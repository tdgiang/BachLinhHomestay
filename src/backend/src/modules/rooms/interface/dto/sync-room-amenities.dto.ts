import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested,
} from 'class-validator';

export class RoomAmenityItemDto {
  @ApiProperty({ example: 'amenity-uuid' })
  @IsString()
  @IsNotEmpty()
  amenityId: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @IsOptional()
  price?: number;
}

export class SyncRoomAmenitiesDto {
  @ApiProperty({ type: [RoomAmenityItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomAmenityItemDto)
  amenities: RoomAmenityItemDto[];
}
