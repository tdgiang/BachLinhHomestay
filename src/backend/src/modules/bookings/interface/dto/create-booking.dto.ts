import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min, MinLength,
} from 'class-validator';
import { BookingType, PaymentMethod } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ example: 'room-001' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ enum: BookingType })
  @IsEnum(BookingType)
  bookingType: BookingType;

  @ApiProperty({ example: '2026-06-01T14:00:00+07:00' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2026-06-03T11:00:00+07:00' })
  @IsDateString()
  checkOut: string;

  @ApiPropertyOptional({ example: 3, description: 'Bắt buộc nếu bookingType = hourly' })
  @IsInt()
  @Min(1)
  @IsOptional()
  numHours?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(1)
  @IsOptional()
  numGuests?: number;

  @ApiProperty({ example: 'Nguyễn Văn An' })
  @IsString()
  @MinLength(2, { message: 'Họ tên tối thiểu 2 ký tự' })
  guestName: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại không hợp lệ (VD: 0901234567)' })
  guestPhone: string;

  @ApiPropertyOptional({ example: 'guest@email.com' })
  @IsString()
  @IsOptional()
  guestEmail?: string;

  @ApiPropertyOptional({ example: 'Cần thêm khăn tắm' })
  @IsString()
  @IsOptional()
  guestNote?: string;

  @ApiPropertyOptional({ example: 'SUMMER30' })
  @IsString()
  @IsOptional()
  voucherCode?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
