import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Ba.Li Homestay — Cầu Giấy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Ba.Li Homestay — Cau Giay' })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({ example: 'Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: 21.0384 })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 105.7899 })
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: '0931 708 256' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Chi nhánh Cầu Giấy, Hà Nội' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
