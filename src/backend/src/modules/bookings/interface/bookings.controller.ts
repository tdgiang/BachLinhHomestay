import {
  Controller, Get, Post, Patch, Body, Param, Query,
  Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { BookingsService } from '../application/bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-status.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { AuthUser } from '../../users/application/users.service';

@ApiTags('Đặt phòng (Bookings)')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Tạo booking mới (khách vãng lai hoặc user đã đăng nhập)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: 'Phòng không trống hoặc dữ liệu không hợp lệ' })
  async create(
    @Body() dto: CreateBookingDto,
    @Request() req: { user?: AuthUser },
  ) {
    const data = await this.bookingsService.create(dto, req.user?.id);
    return { message: 'Đặt phòng thành công', data };
  }

  @Get()
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách tất cả booking (Admin)' })
  async findAll(@Query() query: BookingQueryDto) {
    const data = await this.bookingsService.findAll(query);
    return { message: 'Lấy danh sách booking thành công', data };
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lịch sử đặt phòng của tôi' })
  async myBookings(
    @Request() req: { user: AuthUser },
    @Query() query: BookingQueryDto,
  ) {
    const data = await this.bookingsService.findMyBookings(req.user.id, query);
    return { message: 'Lấy lịch sử đặt phòng thành công', data };
  }

  @Get('code/:code')
  @Public()
  @ApiOperation({ summary: 'Tra cứu booking theo mã' })
  @ApiParam({ name: 'code', example: 'HMS-A1B2C3' })
  async findByCode(@Param('code') code: string) {
    const data = await this.bookingsService.findByCode(code);
    return { message: 'Tìm thấy booking', data };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết booking' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string) {
    const data = await this.bookingsService.findOne(id);
    return { message: 'Lấy thông tin booking thành công', data };
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy booking' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 400, description: 'Không thể hủy ở trạng thái hiện tại' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @Request() req: { user: AuthUser },
  ) {
    const isAdmin = req.user.role === UserRole.admin;
    const data = await this.bookingsService.cancel(id, dto, req.user.id, isAdmin);
    return { message: 'Hủy booking thành công', data };
  }

  @Patch(':id/status')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật trạng thái booking (Admin)' })
  @ApiParam({ name: 'id' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    const data = await this.bookingsService.updateStatus(id, dto);
    return { message: 'Cập nhật trạng thái thành công', data };
  }
}
