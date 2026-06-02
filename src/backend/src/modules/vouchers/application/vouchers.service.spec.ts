import { Test, TestingModule } from '@nestjs/testing';
import { VouchersService } from './vouchers.service';
import { VouchersRepository } from '../infrastructure/vouchers.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  incrementUsedCount: jest.fn(),
};

const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

describe('VouchersService', () => {
  let service: VouchersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        { provide: VouchersRepository, useValue: mockRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();
    service = module.get(VouchersService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ── validate ──────────────────────────────────────────────────────────────

  describe('validate', () => {
    const baseVoucher = {
      id: 'v1',
      code: 'SAVE10',
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2099-12-31'),
      usageLimit: 100,
      usedCount: 0,
      minBookingAmount: 0,
      discountType: 'percentage',
      discountValue: 10,
      maxDiscountAmount: null,
    };

    it('returns valid=false for unknown code', async () => {
      mockRepo.findFirst.mockResolvedValue(null);
      const res = await service.validate({ code: 'NOPE', bookingAmount: 1000 });
      expect(res.valid).toBe(false);
    });

    it('returns valid=false when voucher is inactive', async () => {
      mockRepo.findFirst.mockResolvedValue({ ...baseVoucher, isActive: false });
      const res = await service.validate({ code: 'SAVE10', bookingAmount: 1000 });
      expect(res.valid).toBe(false);
    });

    it('returns valid=false when booking below minimum', async () => {
      mockRepo.findFirst.mockResolvedValue({ ...baseVoucher, minBookingAmount: 500000 });
      const res = await service.validate({ code: 'SAVE10', bookingAmount: 100000 });
      expect(res.valid).toBe(false);
    });

    it('returns valid=false when usage limit reached', async () => {
      mockRepo.findFirst.mockResolvedValue({ ...baseVoucher, usageLimit: 5, usedCount: 5 });
      const res = await service.validate({ code: 'SAVE10', bookingAmount: 1000 });
      expect(res.valid).toBe(false);
    });

    it('calculates percentage discount correctly', async () => {
      mockRepo.findFirst.mockResolvedValue({ ...baseVoucher, discountValue: 30, maxDiscountAmount: null });
      const res = await service.validate({ code: 'SAVE10', bookingAmount: 1000000 });
      expect(res.valid).toBe(true);
      expect(res.discountAmount).toBe(300000);
      expect(res.finalAmount).toBe(700000);
    });

    it('caps percentage discount at maxDiscountAmount', async () => {
      mockRepo.findFirst.mockResolvedValue({ ...baseVoucher, discountValue: 30, maxDiscountAmount: 200000 });
      const res = await service.validate({ code: 'SAVE10', bookingAmount: 1000000 });
      expect(res.discountAmount).toBe(200000);
    });

    it('calculates fixed_amount discount correctly', async () => {
      mockRepo.findFirst.mockResolvedValue({
        ...baseVoucher, discountType: 'fixed_amount', discountValue: 100000,
      });
      const res = await service.validate({ code: 'SAVE10', bookingAmount: 500000 });
      expect(res.discountAmount).toBe(100000);
      expect(res.finalAmount).toBe(400000);
    });

    it('does not discount more than booking amount for fixed type', async () => {
      mockRepo.findFirst.mockResolvedValue({
        ...baseVoucher, discountType: 'fixed_amount', discountValue: 999999,
      });
      const res = await service.validate({ code: 'SAVE10', bookingAmount: 100000 });
      expect(res.discountAmount).toBe(100000);
      expect(res.finalAmount).toBe(0);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('throws ConflictException for duplicate code', async () => {
      mockRepo.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ code: 'DUP', discountType: 'percentage', discountValue: 10,
          validFrom: '2026-01-01', validUntil: '2026-12-31' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('throws NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
