import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ReviewQueryDto extends PaginationDto {
  @IsIn(['createdAt', 'rating'])
  declare sortBy?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isVisible?: boolean;
}
