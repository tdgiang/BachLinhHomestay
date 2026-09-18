import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { ComplaintCategory, ComplaintStatus } from '@prisma/client';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ComplaintQueryDto extends PaginationDto {
  @IsIn(['createdAt', 'status', 'category'])
  @IsOptional()
  declare sortBy?: string;

  @ApiPropertyOptional({ enum: ComplaintStatus })
  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @ApiPropertyOptional({ enum: ComplaintCategory })
  @IsEnum(ComplaintCategory)
  @IsOptional()
  category?: ComplaintCategory;
}
