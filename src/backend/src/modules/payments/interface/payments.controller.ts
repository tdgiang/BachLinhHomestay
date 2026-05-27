import {
  Controller, Post, Get, Body, Query, Req, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from '../application/payments.service';
import { CreateVnpayPaymentDto } from './dto/create-vnpay-payment.dto';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Thanh toán (Payments)')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('vnpay/create')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tạo URL thanh toán VNPay' })
  @ApiResponse({ status: 200, description: '{ paymentUrl }' })
  async createVnpay(
    @Body() dto: CreateVnpayPaymentDto,
    @Req() req: Request,
  ) {
    const ipAddr = req.ip ?? '127.0.0.1';
    const data = await this.paymentsService.createVnpayUrl(dto.bookingId, ipAddr);
    return { message: 'Tạo URL thanh toán thành công', data };
  }

  @Get('vnpay/callback')
  @Public()
  @ApiOperation({ summary: 'VNPay redirect callback — xử lý kết quả thanh toán từ VNPay' })
  async vnpayCallback(@Query() query: Record<string, string>, @Res() res: Response) {
    const redirectUrl = await this.paymentsService.handleVnpayCallback(query);
    return res.redirect(redirectUrl);
  }

  @Post('vnpay/ipn')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'VNPay IPN server-to-server notification' })
  async vnpayIpn(@Query() query: Record<string, string>) {
    return this.paymentsService.handleVnpayIpn(query);
  }
}
