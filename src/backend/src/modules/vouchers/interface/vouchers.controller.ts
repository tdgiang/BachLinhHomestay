import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { VouchersService } from '../application/vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Voucher')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Public()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kiểm tra và tính toán discount của voucher' })
  @ApiResponse({ status: 200 })
  async validate(@Body() dto: ValidateVoucherDto) {
    const data = await this.vouchersService.validate(dto);
    return { message: 'Kiểm tra voucher thành công', data };
  }

  @Get()
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách voucher (Admin)' })
  async findAll(@Query() query: PaginationDto) {
    const data = await this.vouchersService.findAll(query);
    return { message: 'Lấy danh sách voucher thành công', data };
  }

  @Get(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết voucher (Admin)' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string) {
    const data = await this.vouchersService.findOne(id);
    return { message: 'Lấy thông tin voucher thành công', data };
  }

  @Post()
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo voucher mới (Admin)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Mã voucher đã tồn tại' })
  async create(@Body() dto: CreateVoucherDto) {
    const data = await this.vouchersService.create(dto);
    return { message: 'Tạo voucher thành công', data };
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật voucher (Admin)' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    const data = await this.vouchersService.update(id, dto);
    return { message: 'Cập nhật voucher thành công', data };
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa voucher (Admin)' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string) {
    const data = await this.vouchersService.remove(id);
    return { message: 'Xóa voucher thành công', data };
  }
}
