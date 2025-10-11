import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, type HealthCheckResult, type HealthCheckService } from '@nestjs/terminus';
import { Public } from '../decorators';
import type { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private healthService: HealthService,
  ) {}

  @ApiOperation({ summary: 'Check service health status' })
  @Public()
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check(await this.healthService.getDynamicHealthChecks());
  }

  @ApiOperation({ summary: 'Check if service is ready' })
  @Public()
  @Get('ready')
  @HealthCheck()
  async ready(): Promise<HealthCheckResult> {
    return this.health.check(await this.healthService.getReadinessChecks());
  }

  @ApiOperation({ summary: 'Check if service is alive' })
  @Public()
  @Get('live')
  async live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: process.env.APP_NAME || 'unknown',
    };
  }
}
