import { Public } from '@app/common';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import type { ApiService } from './api.service';

@ApiTags('API Gateway')
@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'Service is healthy',
    schema: {
      type: 'string',
      example: 'Hello from API Gateway!',
    },
  })
  @Public()
  @Get()
  getHello(): string {
    return this.apiService.getHello();
  }

  @ApiOperation({ summary: 'Get authenticated user profile from JWT' })
  @ApiOkResponse({
    description: 'User profile from JWT token',
    schema: {
      type: 'object',
      properties: {
        sub: { type: 'string', description: 'User ID' },
        email: { type: 'string', description: 'Email address' },
        iat: { type: 'number', description: 'Issued at timestamp' },
        exp: { type: 'number', description: 'Expiration timestamp' },
      },
    },
  })
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() request: FastifyRequest) {
    return (<any>request).user;
  }
}
