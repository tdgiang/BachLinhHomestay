import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ComplaintCategory } from '@prisma/client';

export class CreateComplaintDto {
  @ApiProperty({ description: 'Họ và tên người gửi', example: 'Nguyễn Văn A' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ description: 'Email nhận phản hồi', example: 'a@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(150)
  email: string;

  @ApiProperty({ description: 'Số điện thoại liên hệ', example: '0931708256' })
  @Matches(/^(0|\+84)[0-9]{9,10}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'Mã đặt phòng liên quan (nếu có)',
    example: 'BK-20260918-0001',
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  bookingCode?: string;

  @ApiProperty({
    description: 'Nhóm vấn đề',
    enum: ComplaintCategory,
    example: ComplaintCategory.booking,
  })
  @IsEnum(ComplaintCategory)
  category: ComplaintCategory;

  @ApiProperty({
    description: 'Tiêu đề',
    example: 'Chưa nhận được email xác nhận',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ description: 'Nội dung chi tiết' })
  @IsString()
  @MinLength(20, { message: 'Nội dung tối thiểu 20 ký tự' })
  @MaxLength(5000)
  content: string;
}
