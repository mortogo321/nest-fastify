import { Public } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Facebook OAuth')
@Controller('facebook')
export class FacebookController {
  @ApiOperation({ summary: 'Health check for Facebook OAuth service' })
  @ApiOkResponse({
    description: 'Facebook OAuth service is healthy',
    schema: {
      type: 'string',
      example: 'Facebook OAuth Service Ready',
    },
  })
  @Public()
  @Get()
  getHello(): string {
    return 'Facebook OAuth Service Ready';
  }
}
