import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AmenityCategory } from '@prisma/client';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class AmenityQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Số bản ghi (tối đa 500)', default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  declare limit?: number;

  @ApiPropertyOptional({ enum: AmenityCategory })
  @IsEnum(AmenityCategory)
  @IsOptional()
  category?: AmenityCategory;
}
