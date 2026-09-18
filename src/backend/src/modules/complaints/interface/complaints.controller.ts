import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { ComplaintsService } from '../application/complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { ComplaintQueryDto } from './dto/complaint-query.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Phản ánh, khiếu nại (Complaints)')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Public()
  @Post()
  // Endpoint public, không đăng nhập. Throttle mặc định 100/phút cho phép một
  // IP tạo ~144.000 phiếu rác mỗi ngày, chôn vùi hàng đợi thật và làm hỏng chỉ
  // số quá hạn. 5 phiếu/giờ đủ cho người dùng thật.
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @ApiOperation({
    summary:
      'Gửi phản ánh, yêu cầu, khiếu nại (kênh trực tuyến — Điều 7 NĐ 248)',
  })
  @ApiResponse({ status: 201, description: 'Trả về mã phiếu để tra cứu' })
  async create(@Body() dto: CreateComplaintDto) {
    const data = await this.complaintsService.create(dto);
    return {
      message: `Đã tiếp nhận. Mã phiếu của bạn: ${data.code}`,
      data,
    };
  }

  @Public()
  @Get('track/:code')
  // Chặn dò mã hàng loạt. Mã phiếu đã đủ dài để không đoán được, throttle này
  // là lớp phòng thủ thứ hai.
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Tra cứu tiến độ xử lý bằng mã phiếu (public)' })
  @ApiParam({ name: 'code', example: 'KN-20260918-0001' })
  async track(@Param('code') code: string) {
    const data = await this.complaintsService.trackByCode(code);
    return { message: 'Tra cứu thành công', data };
  }

  @Get()
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách phiếu khiếu nại (Admin)' })
  async findAll(@Query() query: ComplaintQueryDto) {
    const data = await this.complaintsService.findAll(query);
    return { message: 'Lấy danh sách khiếu nại thành công', data };
  }

  @Get(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết phiếu khiếu nại (Admin)' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string) {
    const data = await this.complaintsService.findOne(id);
    return { message: 'Lấy chi tiết khiếu nại thành công', data };
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật trạng thái / phản hồi khiếu nại (Admin)' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() dto: UpdateComplaintDto) {
    const data = await this.complaintsService.update(id, dto);
    return { message: 'Cập nhật khiếu nại thành công', data };
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa mềm phiếu khiếu nại (Admin)' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string) {
    const data = await this.complaintsService.remove(id);
    return { message: 'Xóa khiếu nại thành công', data };
  }
}
