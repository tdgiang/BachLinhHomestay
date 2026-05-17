import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'booking-uuid' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Phòng sạch sẽ, nhân viên thân thiện' })
  @IsString()
  @IsOptional()
  comment?: string;
}
