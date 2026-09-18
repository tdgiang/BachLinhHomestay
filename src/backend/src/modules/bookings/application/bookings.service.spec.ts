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
  capacity: 4, minHours: 2,
};

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Quota theo khách (Điều 9d) đếm đơn qua findAll — mặc định khách chưa có đơn nào.
    mockRepo.findAll.mockResolvedValue([[], 0]);
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

  // ── Giới hạn số lượng đã công bố (Điều 9d NĐ 248) ─────────────────────────

  describe('giới hạn số lượng đã công bố', () => {
    const base = {
      roomId: 'room-1',
      numGuests: 1,
      guestName: 'Test',
      guestPhone: '0901234567',
      paymentMethod: 'cash',
    } as any;

    beforeEach(() => {
      mockRoomsService.findOne.mockResolvedValue(activeRoom);
      mockRoomsService.checkAvailability.mockResolvedValue({ available: true, conflicts: [] });
      mockVouchersService.validate.mockResolvedValue({ valid: false, discountAmount: 0 });
      mockRepo.createWithPayment.mockResolvedValue({ bookingCode: 'HMS-OK' });
    });

    const hourly = (from: string, to: string, numHours: number) => ({
      ...base,
      bookingType: 'hourly',
      checkIn: from,
      checkOut: to,
      numHours,
    });

    it('chặn khai numHours thấp hơn khoảng thời gian thực giữ phòng', async () => {
      // Giữ phòng 12 giờ nhưng chỉ khai 3 giờ để trả ít tiền.
      await expect(
        service.create(hourly('2026-12-01T01:00:00Z', '2026-12-01T13:00:00Z', 3)),
      ).rejects.toThrow(/không khớp khoảng thời gian/);
      expect(mockRepo.createWithPayment).not.toHaveBeenCalled();
    });

    it('cho qua khi numHours khớp khoảng thời gian', async () => {
      await service.create(hourly('2026-12-01T01:00:00Z', '2026-12-01T04:00:00Z', 3));
      expect(mockRepo.createWithPayment).toHaveBeenCalledWith(
        expect.objectContaining({ baseAmount: 450000 }), // 3 × 150.000
        'cash',
      );
    });

    it('chặn đặt theo giờ vượt 12 giờ mỗi lượt', async () => {
      await expect(
        service.create(hourly('2026-12-01T00:00:00Z', '2026-12-01T13:00:00Z', 13)),
      ).rejects.toThrow(/tối đa 12 giờ/);
    });

    it('áp sàn 2 giờ ngay cả khi phòng khai minHours thấp hơn', async () => {
      mockRoomsService.findOne.mockResolvedValue({ ...activeRoom, minHours: 1 });
      await expect(
        service.create(hourly('2026-12-01T01:00:00Z', '2026-12-01T02:00:00Z', 1)),
      ).rejects.toThrow(/tối thiểu 2 giờ/);
    });

    it('vẫn tôn trọng minHours cao hơn của từng phòng', async () => {
      mockRoomsService.findOne.mockResolvedValue({ ...activeRoom, minHours: 3 });
      await expect(
        service.create(hourly('2026-12-01T01:00:00Z', '2026-12-01T03:00:00Z', 2)),
      ).rejects.toThrow(/tối thiểu 3 giờ/);
    });

    it('chặn đặt quá 30 đêm liên tục', async () => {
      await expect(
        service.create({
          ...base,
          bookingType: 'daily',
          checkIn: '2027-01-01T07:00:00Z',
          checkOut: '2027-03-01T05:00:00Z',
        }),
      ).rejects.toThrow(/tối đa 30 đêm/);
    });

    it('chặn số khách vượt sức chứa của phòng', async () => {
      await expect(
        service.create({
          ...base,
          numGuests: 99,
          bookingType: 'daily',
          checkIn: '2027-01-01T07:00:00Z',
          checkOut: '2027-01-02T05:00:00Z',
        }),
      ).rejects.toThrow(/chứa tối đa 4 khách/);
    });

    it('chặn khi khách đã có 3 đơn đang hiệu lực', async () => {
      mockRepo.findAll.mockResolvedValueOnce([[], 3]);
      await expect(
        service.create({
          ...base,
          bookingType: 'daily',
          checkIn: '2027-01-01T07:00:00Z',
          checkOut: '2027-01-02T05:00:00Z',
        }),
      ).rejects.toThrow(/tối đa 3 đơn cùng lúc/);
    });

    it('đếm quota theo userId khi khách đã đăng nhập, theo SĐT khi chưa', async () => {
      const daily = {
        ...base,
        bookingType: 'daily',
        checkIn: '2027-01-01T07:00:00Z',
        checkOut: '2027-01-02T05:00:00Z',
      };

      await service.create(daily, 'user-9');
      expect(mockRepo.findAll.mock.calls[0][0].where).toMatchObject({ userId: 'user-9' });

      mockRepo.findAll.mockClear();
      await service.create(daily);
      expect(mockRepo.findAll.mock.calls[0][0].where).toMatchObject({
        guestPhone: '0901234567',
      });
    });

    it('chặn checkOut không sau checkIn', async () => {
      await expect(
        service.create({
          ...base,
          bookingType: 'daily',
          checkIn: '2027-01-02T07:00:00Z',
          checkOut: '2027-01-01T07:00:00Z',
        }),
      ).rejects.toThrow(/phải sau/);
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
