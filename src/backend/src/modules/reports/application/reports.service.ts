import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface RevenueRow {
  date?: string;
  month?: number;
  year?: number;
  revenue: number;
  booking_count: number;
}

export interface BranchRevenueRow {
  branch_id: string;
  branch_name: string;
  revenue: number;
  booking_count: number;
}

export interface OccupancyRow {
  room_id: string;
  room_name: string;
  room_number: string;
  booked_days: number;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Doanh thu + số booking theo ngày cụ thể */
  async revenueDaily(date: string) {
    const rows = await this.prisma.$queryRaw<RevenueRow[]>`
      SELECT
        TO_CHAR(b.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') AS date,
        COALESCE(SUM(b.total_amount), 0)::float                              AS revenue,
        COUNT(*)::int                                                         AS booking_count
      FROM bookings b
      WHERE b.booking_status IN ('confirmed', 'checked_in', 'completed')
        AND DATE(b.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${date}::date
      GROUP BY DATE(b.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')
    `;

    if (!rows[0]) return { date, revenue: 0, bookingCount: 0 };
    return {
      date:         rows[0].date ?? date,
      revenue:      Number(rows[0].revenue),
      bookingCount: Number(rows[0].booking_count),
    };
  }

  /** Doanh thu theo từng ngày trong một tháng */
  async revenueMonthly(year: number, month: number) {
    const rows = await this.prisma.$queryRaw<RevenueRow[]>`
      SELECT
        day_date::text                                 AS date,
        COALESCE(SUM(b.total_amount), 0)::float        AS revenue,
        COUNT(b.id)::int                               AS booking_count
      FROM generate_series(
        DATE_TRUNC('month', MAKE_DATE(${year}, ${month}, 1)),
        DATE_TRUNC('month', MAKE_DATE(${year}, ${month}, 1)) + INTERVAL '1 month' - INTERVAL '1 day',
        INTERVAL '1 day'
      ) AS gs(day_date)
      LEFT JOIN bookings b
        ON DATE(b.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = gs.day_date::date
        AND b.booking_status IN ('confirmed', 'checked_in', 'completed')
      GROUP BY day_date
      ORDER BY day_date ASC
    `;

    return rows.map((r) => ({
      date: (r.date ?? '').slice(0, 10),
      revenue: Number(r.revenue),
      bookingCount: Number(r.booking_count),
    }));
  }

  /** Doanh thu theo từng tháng trong một năm */
  async revenueYearly(year: number) {
    const rows = await this.prisma.$queryRaw<RevenueRow[]>`
      SELECT
        gs.m::int                                      AS month,
        ${year}::int                                   AS year,
        COALESCE(SUM(b.total_amount), 0)::float        AS revenue,
        COUNT(b.id)::int                               AS booking_count
      FROM generate_series(1, 12) AS gs(m)
      LEFT JOIN bookings b
        ON EXTRACT(MONTH FROM b.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = gs.m
        AND EXTRACT(YEAR  FROM b.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${year}
        AND b.booking_status IN ('confirmed', 'checked_in', 'completed')
      GROUP BY gs.m
      ORDER BY gs.m ASC
    `;

    return rows.map((r) => ({
      month: Number(r.month),
      year: Number(r.year),
      revenue: Number(r.revenue),
      bookingCount: Number(r.booking_count),
    }));
  }

  /** Doanh thu theo chi nhánh trong khoảng thời gian */
  async revenueByBranch(from: string, to: string) {
    const rows = await this.prisma.$queryRaw<BranchRevenueRow[]>`
      SELECT
        br.id                                    AS branch_id,
        br.name                                  AS branch_name,
        COALESCE(SUM(b.total_amount), 0)::float  AS revenue,
        COUNT(b.id)::int                         AS booking_count
      FROM branches br
      LEFT JOIN rooms r  ON r.branch_id = br.id
      LEFT JOIN bookings b ON b.room_id = r.id
        AND b.booking_status IN ('confirmed', 'checked_in', 'completed')
        AND b.created_at BETWEEN ${from}::timestamptz AND ${to}::timestamptz
      GROUP BY br.id, br.name
      ORDER BY revenue DESC
    `;

    return rows.map((r) => ({
      branchId:     r.branch_id,
      branchName:   r.branch_name,
      revenue:      Number(r.revenue),
      bookingCount: Number(r.booking_count),
    }));
  }

  /** Tổng quan booking — dashboard summary */
  async bookingsSummary() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const [counts, todayRev, yesterdayRev, checkedIn, totalRooms] = await Promise.all([
      // Overall counts
      this.prisma.booking.groupBy({
        by: ['bookingStatus'],
        _count: { _all: true },
      }),

      // Today revenue (confirmed/completed bookings created today)
      this.prisma.booking.aggregate({
        where: {
          bookingStatus: { in: ['confirmed', 'checked_in', 'completed'] },
          createdAt: { gte: new Date(`${todayStr}T00:00:00Z`), lt: new Date(`${todayStr}T23:59:59Z`) },
        },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),

      // Yesterday revenue
      this.prisma.booking.aggregate({
        where: {
          bookingStatus: { in: ['confirmed', 'checked_in', 'completed'] },
          createdAt: { gte: new Date(`${yesterdayStr}T00:00:00Z`), lt: new Date(`${yesterdayStr}T23:59:59Z`) },
        },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),

      // Currently checked in
      this.prisma.booking.count({ where: { bookingStatus: 'checked_in' } }),

      // Total active rooms
      this.prisma.room.count({ where: { status: 'active', deletedAt: null } }),
    ]);

    const statusMap = Object.fromEntries(
      counts.map((c) => [c.bookingStatus, c._count._all]),
    );

    const total = Object.values(statusMap).reduce((s, v) => s + v, 0);

    const occupancyRate = totalRooms > 0
      ? Math.round((checkedIn / totalRooms) * 100)
      : 0;

    return {
      total,
      pending:    statusMap['pending']    ?? 0,
      confirmed:  statusMap['confirmed']  ?? 0,
      checkedIn:  statusMap['checked_in'] ?? 0,
      completed:  statusMap['completed']  ?? 0,
      cancelled:  statusMap['cancelled']  ?? 0,
      todayRevenue:      Number(todayRev._sum.totalAmount ?? 0),
      yesterdayRevenue:  Number(yesterdayRev._sum.totalAmount ?? 0),
      todayBookings:     todayRev._count._all,
      yesterdayBookings: yesterdayRev._count._all,
      occupancyRate,
    };
  }

  /** Tỷ lệ lấp đầy theo phòng trong khoảng ngày */
  async roomsOccupancy(from: string, to: string) {
    const fromDate = new Date(from);
    const toDate   = new Date(to);
    const totalDays = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const rows = await this.prisma.$queryRaw<OccupancyRow[]>`
      SELECT
        r.id          AS room_id,
        r.name        AS room_name,
        r.room_number AS room_number,
        COALESCE(
          SUM(
            EXTRACT(EPOCH FROM (
              LEAST(b.check_out, ${to}::timestamptz)
              - GREATEST(b.check_in, ${from}::timestamptz)
            ))
          ) FILTER (WHERE b.booking_status IN ('confirmed','checked_in','completed')),
          0
        ) / 86400.0 AS booked_days
      FROM rooms r
      LEFT JOIN bookings b ON b.room_id = r.id
        AND b.check_in  < ${to}::timestamptz
        AND b.check_out > ${from}::timestamptz
      WHERE r.deleted_at IS NULL
        AND r.status = 'active'
      GROUP BY r.id, r.name, r.room_number
      ORDER BY booked_days DESC
    `;

    return rows.map((r) => ({
      roomId:         r.room_id,
      roomName:       r.room_name,
      roomNumber:     r.room_number,
      bookedDays:     Math.round(Number(r.booked_days) * 10) / 10,
      occupancyRate:  totalDays > 0
        ? Math.round((Number(r.booked_days) / totalDays) * 100)
        : 0,
    }));
  }
}
