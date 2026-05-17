import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException, ConflictException, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from '../infrastructure/reviews.repository';
import { BookingsService } from '../../bookings/application/bookings.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockRepo = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createAndUpdateRating: jest.fn(),
  reviewSelect: {},
};

const mockBookingsService = { findOne: jest.fn() };
const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

const completedBooking = {
  id: 'b1', userId: 'u1', roomId: 'r1', bookingStatus: 'completed',
};

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewsRepository,  useValue: mockRepo },
        { provide: BookingsService,     useValue: mockBookingsService },
        { provide: CACHE_MANAGER,       useValue: mockCache },
      ],
    }).compile();
    service = module.get(ReviewsService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('create', () => {
    it('throws ForbiddenException when booking belongs to different user', async () => {
      mockBookingsService.findOne.mockResolvedValue({ ...completedBooking, userId: 'other' });
      await expect(
        service.create({ bookingId: 'b1', rating: 5 }, 'u1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when booking not completed', async () => {
      mockBookingsService.findOne.mockResolvedValue({ ...completedBooking, bookingStatus: 'confirmed' });
      await expect(
        service.create({ bookingId: 'b1', rating: 5 }, 'u1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when review already exists', async () => {
      mockBookingsService.findOne.mockResolvedValue(completedBooking);
      mockRepo.findFirst.mockResolvedValue({ id: 'existing-review' });
      await expect(
        service.create({ bookingId: 'b1', rating: 5 }, 'u1'),
      ).rejects.toThrow(ConflictException);
    });

    it('creates review when all guards pass', async () => {
      mockBookingsService.findOne.mockResolvedValue(completedBooking);
      mockRepo.findFirst.mockResolvedValue(null);
      mockRepo.createAndUpdateRating.mockResolvedValue({ id: 'r1', rating: 5 });

      const result = await service.create({ bookingId: 'b1', rating: 5, comment: 'Great!' }, 'u1');

      expect(mockRepo.createAndUpdateRating).toHaveBeenCalledWith(
        expect.objectContaining({ rating: 5 }),
      );
      expect(result).toHaveProperty('id');
    });
  });

  describe('setVisibility', () => {
    it('throws NotFoundException when review not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.setVisibility('nope', false)).rejects.toThrow(NotFoundException);
    });

    it('updates isVisible flag', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'r1', roomId: 'rm1' });
      mockRepo.update.mockResolvedValue({ id: 'r1', isVisible: false });
      await service.setVisibility('r1', false);
      expect(mockRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isVisible: false } }),
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when review not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });

    it('removes review when found', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'r1', roomId: 'rm1' });
      mockRepo.remove.mockResolvedValue({ id: 'r1' });
      await service.remove('r1');
      expect(mockRepo.remove).toHaveBeenCalledWith({ id: 'r1' });
    });
  });

  describe('findByRoom', () => {
    it('filters by roomId and isVisible', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findAll.mockResolvedValue([[], 0]);
      await service.findByRoom('rm1', 1, 10);
      expect(mockRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ roomId: 'rm1', isVisible: true }),
        }),
      );
    });
  });
});
