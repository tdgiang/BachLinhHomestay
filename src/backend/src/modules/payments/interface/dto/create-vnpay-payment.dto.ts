import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVnpayPaymentDto {
  @ApiProperty({ example: 'booking-uuid' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;
}
