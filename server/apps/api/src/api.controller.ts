import { Public } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiService } from './api.service';

@ApiTags('API Gateway')
@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @ApiOperation({ summary: 'Health' })
  @Public()
  @Get()
  getHello(): string {
    return this.apiService.getHello();
  }
}
