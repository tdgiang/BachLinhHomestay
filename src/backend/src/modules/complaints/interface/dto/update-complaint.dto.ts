import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ComplaintStatus } from '@prisma/client';

/**
 * Admin cập nhật trạng thái xử lý và nội dung phản hồi cho một phiếu khiếu nại.
 * Không dùng PartialType(CreateComplaintDto) vì admin không được sửa nội dung
 * người dùng đã gửi — đó là bằng chứng của quy trình tiếp nhận (Điều 7 NĐ 248).
 */
export class UpdateComplaintDto {
  @ApiPropertyOptional({ enum: ComplaintStatus })
  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @ApiPropertyOptional({ description: 'Nội dung phản hồi gửi khách hàng' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  @IsOptional()
  response?: string;
}
