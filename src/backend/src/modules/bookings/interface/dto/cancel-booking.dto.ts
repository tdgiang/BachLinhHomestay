import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({ example: 'Đổi kế hoạch' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
