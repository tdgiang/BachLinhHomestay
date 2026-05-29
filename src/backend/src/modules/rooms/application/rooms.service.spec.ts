import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from '../infrastructure/rooms.repository';
import { ImageService } from '../../image/application/image.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  softRemove: jest.fn(),
  findBookingConflicts: jest.fn(),
  getTimeSlotsForDate: jest.fn(),
  roomListSelect: {},
  roomDetailSelect: {},
};

const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

const mockImageService = { upload: jest.fn(), delete: jest.fn() };

const mockPrisma = {
  roomImage: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), delete: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  roomAmenity: { deleteMany: jest.fn(), createMany: jest.fn() },
};

const activeRoom = {
  id: 'r1', name: 'Test Room', status: 'active', deletedAt: null,
  pricePerHour: 150000, pricePerDay: 1200000,
};

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: RoomsRepository, useValue: mockRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: ImageService, useValue: mockImageService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(RoomsService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('findOne', () => {
    it('throws NotFoundException when room not found', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });

    it('returns cached room on hit', async () => {
      mockCache.get.mockResolvedValue(activeRoom);
      expect(await service.findOne('r1')).toEqual(activeRoom);
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });
  });

  describe('checkAvailability', () => {
    it('returns available=true when no conflicts', async () => {
      mockCache.get.mockResolvedValue(activeRoom);
      mockRepo.findBookingConflicts.mockResolvedValue([]);
      const result = await service.checkAvailability('r1', '2026-07-01T14:00:00Z', '2026-07-03T11:00:00Z');
      expect(result.available).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('returns available=false when conflicts exist', async () => {
      mockCache.get.mockResolvedValue(activeRoom);
      mockRepo.findBookingConflicts.mockResolvedValue([{ id: 'b1' }]);
      const result = await service.checkAvailability('r1', '2026-07-01T14:00:00Z', '2026-07-03T11:00:00Z');
      expect(result.available).toBe(false);
      expect(result.conflicts).toHaveLength(1);
    });
  });

  describe('getTimeSlots', () => {
    it('returns time slots for the given date day-of-week', async () => {
      mockCache.get.mockResolvedValue(activeRoom);
      const slots = [{ id: 's1', label: 'Morning' }];
      mockRepo.getTimeSlotsForDate.mockResolvedValue(slots);
      const result = await service.getTimeSlots('r1', '2026-07-01');
      expect(result).toEqual(slots);
    });
  });

  describe('findAll', () => {
    it('returns cached list on hit', async () => {
      const cached = { items: [], meta: {} };
      mockCache.get.mockResolvedValue(cached);
      expect(await service.findAll({})).toEqual(cached);
    });

    it('applies isFeatured filter', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findAll.mockResolvedValue([[], 0]);
      await service.findAll({ isFeatured: true });
      expect(mockRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isFeatured: true }),
        }),
      );
    });
  });
});
