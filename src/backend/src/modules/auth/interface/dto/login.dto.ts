import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ description: 'Địa chỉ email', example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0901234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'Secret@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
