import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../../prisma/prisma.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
  booking: {
    groupBy:   jest.fn(),
    aggregate: jest.fn(),
    count:     jest.fn(),
  },
  room: {
    count: jest.fn(),
  },
};

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(ReportsService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ─── bookingsSummary ───────────────────────────────────────────────────────

  describe('bookingsSummary', () => {
    it('returns summary with correct field names', async () => {
      mockPrisma.booking.groupBy.mockResolvedValue([
        { bookingStatus: 'pending',   _count: { _all: 3 } },
        { bookingStatus: 'confirmed', _count: { _all: 5 } },
        { bookingStatus: 'completed', _count: { _all: 10 } },
        { bookingStatus: 'cancelled', _count: { _all: 2 } },
      ]);
      mockPrisma.booking.aggregate
        .mockResolvedValueOnce({ _sum: { totalAmount: 4500000 }, _count: { _all: 6 } })
        .mockResolvedValueOnce({ _sum: { totalAmount: 3800000 }, _count: { _all: 5 } });
      mockPrisma.booking.count.mockResolvedValue(2);
      mockPrisma.room.count.mockResolvedValue(10);

      const result = await service.bookingsSummary();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pending');
      expect(result).toHaveProperty('confirmed');
      expect(result).toHaveProperty('checkedIn');
      expect(result).toHaveProperty('completed');
      expect(result).toHaveProperty('cancelled');
      expect(result).toHaveProperty('todayRevenue');
      expect(result).toHaveProperty('occupancyRate');
      expect(result.total).toBe(20);
      expect(result.pending).toBe(3);
      expect(result.todayRevenue).toBe(4500000);
    });

    it('computes occupancyRate as percentage of checked-in rooms', async () => {
      mockPrisma.booking.groupBy.mockResolvedValue([
        { bookingStatus: 'checked_in', _count: { _all: 5 } },
      ]);
      mockPrisma.booking.aggregate
        .mockResolvedValue({ _sum: { totalAmount: 0 }, _count: { _all: 0 } });
      mockPrisma.booking.count.mockResolvedValue(5);
      mockPrisma.room.count.mockResolvedValue(10);

      const result = await service.bookingsSummary();

      expect(result.occupancyRate).toBe(50);
    });

    it('returns occupancyRate = 0 when there are no active rooms', async () => {
      mockPrisma.booking.groupBy.mockResolvedValue([]);
      mockPrisma.booking.aggregate
        .mockResolvedValue({ _sum: { totalAmount: null }, _count: { _all: 0 } });
      mockPrisma.booking.count.mockResolvedValue(0);
      mockPrisma.room.count.mockResolvedValue(0);

      const result = await service.bookingsSummary();

      expect(result.occupancyRate).toBe(0);
    });

    it('coerces null totalAmount to 0', async () => {
      mockPrisma.booking.groupBy.mockResolvedValue([]);
      mockPrisma.booking.aggregate
        .mockResolvedValue({ _sum: { totalAmount: null }, _count: { _all: 0 } });
      mockPrisma.booking.count.mockResolvedValue(0);
      mockPrisma.room.count.mockResolvedValue(5);

      const result = await service.bookingsSummary();

      expect(result.todayRevenue).toBe(0);
      expect(result.yesterdayRevenue).toBe(0);
    });
  });

  // ─── revenueYearly ────────────────────────────────────────────────────────

  describe('revenueYearly', () => {
    it('calls $queryRaw and returns formatted data', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { month: 5, year: 2026, revenue: 1600000, booking_count: 1 },
      ]);
      const result = await service.revenueYearly(2026);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('month');
      expect(result[0]).toHaveProperty('revenue');
      expect(result[0]).toHaveProperty('bookingCount');
    });

    it('returns 12 months even when some have zero revenue', async () => {
      const rows = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1, year: 2026, revenue: 0, booking_count: 0,
      }));
      mockPrisma.$queryRaw.mockResolvedValue(rows);
      const result = await service.revenueYearly(2026);
      expect(result).toHaveLength(12);
    });
  });

  // ─── revenueMonthly ───────────────────────────────────────────────────────

  describe('revenueMonthly', () => {
    it('returns array of daily revenue', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { date: '2026-05-17', revenue: 1600000, booking_count: 1 },
      ]);
      const result = await service.revenueMonthly(2026, 5);
      expect(result[0].date).toBe('2026-05-17');
      expect(result[0].revenue).toBe(1600000);
    });

    it('trims date to YYYY-MM-DD', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { date: '2026-05-01 00:00:00+00', revenue: 0, booking_count: 0 },
      ]);
      const result = await service.revenueMonthly(2026, 5);
      expect(result[0].date).toBe('2026-05-01');
    });
  });

  // ─── revenueByBranch ──────────────────────────────────────────────────────

  describe('revenueByBranch', () => {
    it('maps branch fields correctly', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { branch_id: 'b1', branch_name: 'DN Branch', revenue: 2000000, booking_count: 2 },
      ]);
      const result = await service.revenueByBranch('2026-01-01', '2026-12-31');
      expect(result[0]).toMatchObject({
        branchId: 'b1', branchName: 'DN Branch',
        revenue: 2000000, bookingCount: 2,
      });
    });

    it('returns empty array when no branches have bookings', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);
      const result = await service.revenueByBranch('2026-01-01', '2026-12-31');
      expect(result).toEqual([]);
    });
  });

  // ─── revenueDaily ────────────────────────────────────────────────────────
  // Bug: SQL returns booking_count (snake_case) but callers expect bookingCount

  describe('revenueDaily', () => {
    it('returns bookingCount (camelCase) not booking_count when data exists', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { date: '2026-05-29', revenue: 1600000, booking_count: 3 },
      ]);
      const result = await service.revenueDaily('2026-05-29');
      expect(result).toHaveProperty('bookingCount', 3);
      expect(result).not.toHaveProperty('booking_count');
    });

    it('returns zero defaults with camelCase when no booking on that date', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);
      const result = await service.revenueDaily('2026-05-29');
      expect(result).toMatchObject({ date: '2026-05-29', revenue: 0, bookingCount: 0 });
    });

    it('coerces revenue to Number', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { date: '2026-05-29', revenue: '1600000', booking_count: 3 },
      ]);
      const result = await service.revenueDaily('2026-05-29') as any;
      expect(typeof result.revenue).toBe('number');
    });
  });

  // ─── roomsOccupancy ───────────────────────────────────────────────────────

  describe('roomsOccupancy', () => {
    it('maps DB snake_case fields to camelCase', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { room_id: 'r1', room_name: 'Phòng A', room_number: '101', booked_days: 10 },
      ]);
      const result = await service.roomsOccupancy('2026-05-01', '2026-05-31');
      expect(result[0]).toHaveProperty('roomId', 'r1');
      expect(result[0]).toHaveProperty('roomName', 'Phòng A');
      expect(result[0]).toHaveProperty('roomNumber', '101');
      expect(result[0]).toHaveProperty('bookedDays');
      expect(result[0]).toHaveProperty('occupancyRate');
      expect(result[0]).not.toHaveProperty('room_id');
    });

    it('calculates occupancyRate correctly for 30-day range', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { room_id: 'r1', room_name: 'Phòng A', room_number: '101', booked_days: 15 },
      ]);
      const result = await service.roomsOccupancy('2026-05-01', '2026-05-31');
      expect(result[0].occupancyRate).toBe(50); // 15/30 × 100
    });

    it('returns occupancyRate = 0 when from equals to (zero-day range)', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { room_id: 'r1', room_name: 'Phòng A', room_number: '101', booked_days: 5 },
      ]);
      const result = await service.roomsOccupancy('2026-05-01', '2026-05-01');
      expect(result[0].occupancyRate).toBe(0);
    });

    it('returns empty array when no active rooms', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);
      const result = await service.roomsOccupancy('2026-05-01', '2026-05-31');
      expect(result).toEqual([]);
    });
  });
});
