import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

const BRANCH_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'city'] as const;

export class BranchQueryDto extends PaginationDto {
  @IsIn(BRANCH_SORT_FIELDS)
  declare sortBy?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ obj, key }) => {
    const raw = obj[key];
    if (raw === 'true' || raw === true) return true;
    if (raw === 'false' || raw === false) return false;
    return undefined;
  })
  isActive?: boolean;
}
