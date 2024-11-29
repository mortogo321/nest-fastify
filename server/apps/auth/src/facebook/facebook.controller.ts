import { Public } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Facebook')
@Controller('facebook')
export class FacebookController {
  @ApiOperation({ summary: 'Health' })
  @Public()
  @Get()
  getHello(): string {
    return 'Hello';
  }
}
