import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from '../application/reports.service';

const mockService = {
  bookingsSummary:  jest.fn(),
  revenueDaily:     jest.fn(),
  revenueMonthly:   jest.fn(),
  revenueYearly:    jest.fn(),
  revenueByBranch:  jest.fn(),
  roomsOccupancy:   jest.fn(),
};

describe('ReportsController', () => {
  let controller: ReportsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: mockService }],
    }).compile();
    controller = module.get(ReportsController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  describe('bookingsSummary', () => {
    it('delegates to service and wraps in message/data envelope', async () => {
      const summary = { total: 10, pending: 2, todayRevenue: 500000, occupancyRate: 40 };
      mockService.bookingsSummary.mockResolvedValue(summary);

      const result = await controller.bookingsSummary();

      expect(mockService.bookingsSummary).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data', summary);
    });
  });

  describe('revenueDaily', () => {
    it('passes date to service', async () => {
      const daily = { date: '2026-05-29', revenue: 1600000, bookingCount: 3 };
      mockService.revenueDaily.mockResolvedValue(daily);

      const result = await controller.revenueDaily('2026-05-29');

      expect(mockService.revenueDaily).toHaveBeenCalledWith('2026-05-29');
      expect(result.data).toEqual(daily);
    });

    it('defaults to today when date query is undefined', async () => {
      mockService.revenueDaily.mockResolvedValue({ date: '', revenue: 0, bookingCount: 0 });

      await controller.revenueDaily(undefined as unknown as string);

      const calledWith = mockService.revenueDaily.mock.calls[0][0];
      expect(calledWith).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('revenueMonthly', () => {
    it('converts string params to numbers', async () => {
      mockService.revenueMonthly.mockResolvedValue([]);

      await controller.revenueMonthly('2026', '5');

      expect(mockService.revenueMonthly).toHaveBeenCalledWith(2026, 5);
    });
  });

  describe('revenueYearly', () => {
    it('converts year string to number', async () => {
      mockService.revenueYearly.mockResolvedValue([]);

      await controller.revenueYearly('2026');

      expect(mockService.revenueYearly).toHaveBeenCalledWith(2026);
    });

    it('returns message and data', async () => {
      const yearly = [{ month: 1, year: 2026, revenue: 0, bookingCount: 0 }];
      mockService.revenueYearly.mockResolvedValue(yearly);

      const result = await controller.revenueYearly('2026');

      expect(result).toHaveProperty('message');
      expect(result.data).toEqual(yearly);
    });
  });

  describe('revenueByBranch', () => {
    it('passes from/to to service', async () => {
      mockService.revenueByBranch.mockResolvedValue([]);

      await controller.revenueByBranch('2026-01-01', '2026-12-31');

      expect(mockService.revenueByBranch).toHaveBeenCalledWith('2026-01-01', '2026-12-31');
    });
  });

  describe('roomsOccupancy', () => {
    it('passes from/to to service and wraps response', async () => {
      const occupancy = [{ roomId: 'r1', occupancyRate: 50 }];
      mockService.roomsOccupancy.mockResolvedValue(occupancy);

      const result = await controller.roomsOccupancy('2026-05-01', '2026-05-31');

      expect(mockService.roomsOccupancy).toHaveBeenCalledWith('2026-05-01', '2026-05-31');
      expect(result.data).toEqual(occupancy);
    });
  });
});
