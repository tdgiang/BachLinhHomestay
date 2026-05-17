import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { RoomStatus, BookingType } from '@prisma/client';

const ROOM_SORT_FIELDS = ['createdAt', 'updatedAt', 'pricePerHour', 'pricePerDay', 'ratingAvg'] as const;

export class RoomQueryDto extends PaginationDto {
  @IsIn(ROOM_SORT_FIELDS)
  declare sortBy?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ enum: BookingType })
  @IsEnum(BookingType)
  @IsOptional()
  type?: BookingType;

  @ApiPropertyOptional({ enum: RoomStatus })
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  priceMax?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  priceMin?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isGuestFavorite?: boolean;

  @ApiPropertyOptional({ description: 'Check-in time (ISO string) for availability filter' })
  @IsString()
  @IsOptional()
  checkIn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  checkOut?: string;
}
