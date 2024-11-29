import { Public } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Google')
@Controller('google')
export class GoogleController {
  @ApiOperation({ summary: 'Health' })
  @Public()
  @Get()
  getHello(): string {
    return 'Hello';
  }
}
