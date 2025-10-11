import { Public } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Google OAuth')
@Controller('google')
export class GoogleController {
  @ApiOperation({ summary: 'Health check for Google OAuth service' })
  @ApiOkResponse({
    description: 'Google OAuth service is healthy',
    schema: {
      type: 'string',
      example: 'Google OAuth Service Ready',
    },
  })
  @Public()
  @Get()
  getHello(): string {
    return 'Google OAuth Service Ready';
  }
}
