import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from '../infrastructure/bookings.repository';
import { RoomsService } from '../../rooms/application/rooms.service';
import { VouchersService } from '../../vouchers/application/vouchers.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockRepo = {
  createWithPayment: jest.fn(),
  findAll:           jest.fn(),
  findOne:           jest.fn(),
  findFirst:         jest.fn(),
  update:            jest.fn(),
  bookingWithRelations: {},
  prismaService:     { payment: { updateMany: jest.fn() } },
};

const mockRoomsService = {
  findOne:                    jest.fn(),
  checkAvailability:          jest.fn(),
  invalidateAvailabilityCache: jest.fn(),
};

const mockVouchersService = {
  validate:           jest.fn(),
  incrementUsedCount: jest.fn(),
};

const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

const activeRoom = {
  id: 'room-1', status: 'active',
  pricePerHour: 150000, pricePerDay: 1200000,
  extraPersonPrice: 100000, name: 'Test Room',
};

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: BookingsRepository, useValue: mockRepo },
        { provide: RoomsService,       useValue: mockRoomsService },
        { provide: VouchersService,    useValue: mockVouchersService },
        { provide: CACHE_MANAGER,      useValue: mockCache },
      ],
    }).compile();
    service = module.get(BookingsService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      roomId: 'room-1',
      bookingType: 'daily',
      checkIn:  '2026-07-01T14:00:00Z',
      checkOut: '2026-07-03T11:00:00Z',
      numGuests: 1,
      guestName: 'Test', guestPhone: '0901',
      paymentMethod: 'cash',
    } as any;

    it('throws BadRequestException when room is not active', async () => {
      mockRoomsService.findOne.mockResolvedValue({ ...activeRoom, status: 'maintenance' });
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when room is not available', async () => {
      mockRoomsService.findOne.mockResolvedValue(activeRoom);
      mockRoomsService.checkAvailability.mockResolvedValue({ available: false, conflicts: [{}] });
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when bookingType=hourly but numHours missing', async () => {
      mockRoomsService.findOne.mockResolvedValue(activeRoom);
      mockRoomsService.checkAvailability.mockResolvedValue({ available: true, conflicts: [] });
      await expect(
        service.create({ ...dto, bookingType: 'hourly', numHours: undefined }),
      ).rejects.toThrow(BadRequestException);
    });

    it('calculates daily price correctly', async () => {
      mockRoomsService.findOne.mockResolvedValue(activeRoom);
      mockRoomsService.checkAvailability.mockResolvedValue({ available: true, conflicts: [] });
      mockVouchersService.validate.mockResolvedValue({ valid: false, discountAmount: 0, finalAmount: 0 });
      mockRepo.createWithPayment.mockResolvedValue({ bookingCode: 'HMS-TEST', totalAmount: 2400000 });

      await service.create(dto);

      expect(mockRepo.createWithPayment).toHaveBeenCalledWith(
        expect.objectContaining({ baseAmount: 2400000 }), // 2 nights × 1,200,000
        'cash',
      );
    });

    it('applies voucher discount when voucherCode provided', async () => {
      mockRoomsService.findOne.mockResolvedValue(activeRoom);
      mockRoomsService.checkAvailability.mockResolvedValue({ available: true, conflicts: [] });
      mockVouchersService.validate.mockResolvedValue({ valid: true, discountAmount: 200000, finalAmount: 2200000, voucherId: 'v1' });
      mockRepo.createWithPayment.mockResolvedValue({ bookingCode: 'HMS-X' });

      await service.create({ ...dto, voucherCode: 'SAVE' });

      expect(mockVouchersService.incrementUsedCount).toHaveBeenCalledWith('v1');
      expect(mockRepo.createWithPayment).toHaveBeenCalledWith(
        expect.objectContaining({ discountAmount: 200000 }),
        'cash',
      );
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────────

  describe('cancel', () => {
    const booking = {
      id: 'b1', userId: 'user-1', bookingStatus: 'confirmed', roomId: 'r1',
    };

    it('throws ForbiddenException when user is not owner', async () => {
      mockRepo.findOne.mockResolvedValue(booking);
      await expect(
        service.cancel('b1', { reason: 'x' } as any, 'other-user', false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException for non-cancellable status', async () => {
      mockRepo.findOne.mockResolvedValue({ ...booking, bookingStatus: 'completed' });
      await expect(
        service.cancel('b1', { reason: 'x' } as any, 'user-1', false),
      ).rejects.toThrow(BadRequestException);
    });

    it('admin can cancel any booking', async () => {
      mockRepo.findOne.mockResolvedValue(booking);
      mockRepo.update.mockResolvedValue({ ...booking, bookingStatus: 'cancelled' });

      await service.cancel('b1', { reason: 'admin cancel' } as any, 'other-user', true);

      expect(mockRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'b1' } }),
      );
    });
  });

  // ── findByCode ────────────────────────────────────────────────────────────

  describe('findByCode', () => {
    it('throws NotFoundException when booking code not found', async () => {
      mockRepo.findFirst.mockResolvedValue(null);
      await expect(service.findByCode('HMS-NOPE')).rejects.toThrow(NotFoundException);
    });
  });
});
