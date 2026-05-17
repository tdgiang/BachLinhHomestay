import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsOptional, IsString, MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({ description: 'Địa chỉ email', example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0901234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Mật khẩu (tối thiểu 6 ký tự)', example: 'Secret@123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: 'Họ và tên', example: 'Nguyễn Văn A' })
  @IsString()
  @IsOptional()
  fullName?: string;
}
