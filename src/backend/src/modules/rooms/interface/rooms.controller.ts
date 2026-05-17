import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  HttpCode, HttpStatus, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiConsumes,
} from '@nestjs/swagger';
import { RoomsService } from '../application/rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomQueryDto } from './dto/room-query.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Phòng (Rooms)')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách phòng (hỗ trợ lọc, phân trang)' })
  @ApiResponse({ status: 200 })
  async findAll(@Query() query: RoomQueryDto) {
    const data = await this.roomsService.findAll(query);
    return { message: 'Lấy danh sách phòng thành công', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết phòng (với amenities, time slots, policies)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string) {
    const data = await this.roomsService.findOne(id);
    return { message: 'Lấy thông tin phòng thành công', data };
  }

  @Public()
  @Get(':id/availability')
  @ApiOperation({ summary: 'Kiểm tra phòng có trống trong khoảng thời gian' })
  @ApiParam({ name: 'id' })
  async availability(
    @Param('id') id: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
  ) {
    const data = await this.roomsService.checkAvailability(id, checkIn, checkOut);
    return { message: 'Kiểm tra availability thành công', data };
  }

  @Public()
  @Get(':id/time-slots')
  @ApiOperation({ summary: 'Lấy khung giờ gợi ý theo ngày' })
  @ApiParam({ name: 'id' })
  async timeSlots(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    const data = await this.roomsService.getTimeSlots(id, date);
    return { message: 'Lấy time slots thành công', data };
  }

  @Post()
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo phòng mới (Admin)' })
  async create(@Body() dto: CreateRoomDto) {
    const data = await this.roomsService.create(dto);
    return { message: 'Tạo phòng thành công', data };
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật phòng (Admin)' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    const data = await this.roomsService.update(id, dto);
    return { message: 'Cập nhật phòng thành công', data };
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa mềm phòng (Admin)' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string) {
    const data = await this.roomsService.remove(id);
    return { message: 'Xóa phòng thành công', data };
  }

  @Post(':id/images')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload ảnh cho phòng (Admin)' })
  @ApiParam({ name: 'id' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Image service will be wired in Phase 5.4
    return {
      message: 'Upload ảnh thành công',
      data: { url: `/uploads/${file?.originalname ?? 'image'}` },
    };
  }
}
