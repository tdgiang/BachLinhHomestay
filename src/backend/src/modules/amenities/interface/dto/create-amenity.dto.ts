import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AmenityCategory } from '@prisma/client';

export class CreateAmenityDto {
  @ApiProperty({ example: 'WiFi miễn phí' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Free WiFi' })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiPropertyOptional({ example: 'Wifi', description: 'Lucide icon name' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ enum: AmenityCategory, default: AmenityCategory.basic })
  @IsEnum(AmenityCategory)
  @IsOptional()
  category?: AmenityCategory;
}
