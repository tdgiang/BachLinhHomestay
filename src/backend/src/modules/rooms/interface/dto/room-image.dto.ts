import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddRoomImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isCover?: boolean;
}

export class ReorderImagesDto {
  @ApiProperty({ type: [String], description: 'Ordered array of image IDs' })
  imageIds: string[];
}
