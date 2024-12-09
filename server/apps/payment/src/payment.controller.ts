import { Public } from '@app/common';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Health' })
  @Public()
  @Get()
  getHello(): string {
    return this.paymentService.getHello();
  }

  @ApiOperation({ summary: 'Get profile' })
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() request: FastifyRequest) {
    return (<any>request).user;
  }
}