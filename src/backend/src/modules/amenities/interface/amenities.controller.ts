import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { AmenitiesService } from '../application/amenities.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { AmenityQueryDto } from './dto/amenity-query.dto';

@ApiTags('amenities')
@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly service: AmenitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách tiện ích' })
  findAll(@Query() query: AmenityQueryDto) {
    return this.service.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết tiện ích' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @Post()
  @ApiOperation({ summary: 'Tạo tiện ích mới (Admin)' })
  create(@Body() dto: CreateAmenityDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tiện ích (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateAmenityDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa tiện ích (Admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
