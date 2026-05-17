import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;

  @ApiPropertyOptional({ example: 'Ghi chú từ admin' })
  @IsString()
  @IsOptional()
  adminNote?: string;
}
