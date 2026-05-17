import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from '../application/reports.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Báo cáo (Reports)')
@ApiBearerAuth()
@Roles(UserRole.admin)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('bookings/summary')
  @ApiOperation({ summary: 'Tổng quan booking — dashboard KPIs' })
  async bookingsSummary() {
    const data = await this.reportsService.bookingsSummary();
    return { message: 'Lấy tổng quan thành công', data };
  }

  @Get('revenue/daily')
  @ApiOperation({ summary: 'Doanh thu ngày cụ thể' })
  @ApiQuery({ name: 'date', example: '2026-05-17', description: 'YYYY-MM-DD' })
  async revenueDaily(@Query('date') date: string) {
    const d = date ?? new Date().toISOString().split('T')[0];
    const data = await this.reportsService.revenueDaily(d);
    return { message: 'Lấy doanh thu theo ngày thành công', data };
  }

  @Get('revenue/monthly')
  @ApiOperation({ summary: 'Doanh thu từng ngày trong tháng' })
  @ApiQuery({ name: 'year', example: 2026 })
  @ApiQuery({ name: 'month', example: 5 })
  async revenueMonthly(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const data = await this.reportsService.revenueMonthly(+year, +month);
    return { message: 'Lấy doanh thu theo tháng thành công', data };
  }

  @Get('revenue/yearly')
  @ApiOperation({ summary: 'Doanh thu từng tháng trong năm' })
  @ApiQuery({ name: 'year', example: 2026 })
  async revenueYearly(@Query('year') year: string) {
    const data = await this.reportsService.revenueYearly(+year);
    return { message: 'Lấy doanh thu theo năm thành công', data };
  }

  @Get('revenue/by-branch')
  @ApiOperation({ summary: 'Doanh thu theo chi nhánh trong khoảng thời gian' })
  @ApiQuery({ name: 'from', example: '2026-01-01' })
  @ApiQuery({ name: 'to',   example: '2026-12-31' })
  async revenueByBranch(
    @Query('from') from: string,
    @Query('to')   to:   string,
  ) {
    const data = await this.reportsService.revenueByBranch(from, to);
    return { message: 'Lấy doanh thu theo chi nhánh thành công', data };
  }

  @Get('rooms/occupancy')
  @ApiOperation({ summary: 'Tỷ lệ lấp đầy từng phòng trong khoảng thời gian' })
  @ApiQuery({ name: 'from', example: '2026-05-01' })
  @ApiQuery({ name: 'to',   example: '2026-05-31' })
  async roomsOccupancy(
    @Query('from') from: string,
    @Query('to')   to:   string,
  ) {
    const data = await this.reportsService.roomsOccupancy(from, to);
    return { message: 'Lấy occupancy thành công', data };
  }
}
