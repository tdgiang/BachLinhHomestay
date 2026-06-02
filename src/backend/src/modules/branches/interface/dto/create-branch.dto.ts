import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean, IsDecimal, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Homestay Ba.Li — Đà Nẵng Trung Tâm' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Ba.Li Homestay — Da Nang Center' })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({ example: '12 Bạch Đằng, Hải Châu' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Đà Nẵng' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: 16.0544 })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 108.2022 })
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: '0236 123 4567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Chi nhánh trung tâm Đà Nẵng' })
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
