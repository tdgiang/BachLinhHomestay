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

  describe('bookingsSummary', () => {
    it('returns summary with correct field names', async () => {
      mockPrisma.booking.groupBy.mockResolvedValue([
        { bookingStatus: 'pending',   _count: { _all: 3 } },
        { bookingStatus: 'confirmed', _count: { _all: 5 } },
        { bookingStatus: 'completed', _count: { _all: 10 } },
        { bookingStatus: 'cancelled', _count: { _all: 2 } },
      ]);
      mockPrisma.booking.aggregate
        .mockResolvedValueOnce({ _sum: { totalAmount: 4500000 }, _count: { _all: 6 } }) // today
        .mockResolvedValueOnce({ _sum: { totalAmount: 3800000 }, _count: { _all: 5 } }); // yesterday
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
      expect(result.total).toBe(20); // 3+5+10+2
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

      expect(result.occupancyRate).toBe(50); // 5/10 × 100
    });
  });

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
  });

  describe('revenueMonthly', () => {
    it('returns array of daily revenue', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { date: '2026-05-17', revenue: 1600000, booking_count: 1 },
      ]);
      const result = await service.revenueMonthly(2026, 5);
      expect(result[0].date).toBe('2026-05-17');
      expect(result[0].revenue).toBe(1600000);
    });
  });

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
  });
});
