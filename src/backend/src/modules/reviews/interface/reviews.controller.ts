import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { ReviewsService } from '../application/reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { AuthUser } from '../../users/application/users.service';

@ApiTags('Đánh giá (Reviews)')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('room/:roomId')
  @ApiOperation({ summary: 'Danh sách đánh giá theo phòng (public, chỉ visible)' })
  @ApiParam({ name: 'roomId' })
  async findByRoom(
    @Param('roomId') roomId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const data = await this.reviewsService.findByRoom(roomId, +page, +limit);
    return { message: 'Lấy đánh giá thành công', data };
  }

  @Get()
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách tất cả đánh giá (Admin, hỗ trợ lọc)' })
  async findAll(@Query() query: ReviewQueryDto) {
    const data = await this.reviewsService.findAll(query);
    return { message: 'Lấy danh sách đánh giá thành công', data };
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Viết đánh giá (user đã đặt phòng, booking=completed)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: 'Booking chưa hoàn thành' })
  @ApiResponse({ status: 403, description: 'Không phải booking của bạn' })
  @ApiResponse({ status: 409, description: 'Đã đánh giá booking này rồi' })
  async create(
    @Body() dto: CreateReviewDto,
    @Request() req: { user: AuthUser },
  ) {
    const data = await this.reviewsService.create(dto, req.user.id);
    return { message: 'Đánh giá thành công', data };
  }

  @Patch(':id/visibility')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ẩn / hiển thị đánh giá (Admin)' })
  @ApiParam({ name: 'id' })
  async setVisibility(
    @Param('id') id: string,
    @Body('isVisible') isVisible: boolean,
  ) {
    const data = await this.reviewsService.setVisibility(id, isVisible);
    return { message: `Đã ${isVisible ? 'hiển thị' : 'ẩn'} đánh giá`, data };
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa đánh giá (Admin)' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string) {
    const data = await this.reviewsService.remove(id);
    return { message: 'Xóa đánh giá thành công', data };
  }
}
