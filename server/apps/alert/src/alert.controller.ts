import { Public } from '@app/common';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AlertService } from './alert.service';

@ApiTags('Alert')
@Controller()
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @ApiOperation({ summary: 'Health' })
  @Public()
  @Get()
  getHello(): string {
    return this.alertService.getHello();
  }

  @ApiOperation({ summary: 'Get profile' })
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() request: FastifyRequest) {
    return (<any>request).user;
  }
}
