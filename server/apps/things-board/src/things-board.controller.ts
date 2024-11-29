import { Public } from '@app/common';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ThingsBoardService } from './things-board.service';

@ApiTags('ThingsBoard')
@Controller()
export class ThingsBoardController {
  constructor(private readonly thingsBoardService: ThingsBoardService) {}

  @ApiOperation({ summary: 'Health' })
  @Public()
  @Get()
  getHello(): string {
    return this.thingsBoardService.getHello();
  }

  @ApiOperation({ summary: 'Get profile' })
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() request: FastifyRequest) {
    return (<any>request).user;
  }
}
