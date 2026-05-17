import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ValidateVoucherDto {
  @ApiProperty({ example: 'SUMMER30' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 1200000, description: 'Tổng giá trị booking (₫)' })
  @IsNumber()
  @Min(0)
  bookingAmount: number;
}
