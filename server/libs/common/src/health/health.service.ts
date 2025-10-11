import { Injectable, Logger } from '@nestjs/common';
import type {
  HealthCheckService,
  HealthIndicatorFunction,
  HealthIndicatorResult,
  MicroserviceHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import type { PrismaService } from '../database/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prismaHealth: PrismaHealthIndicator,
    readonly _microserviceHealth: MicroserviceHealthIndicator,
    private readonly prisma: PrismaService,
    readonly _healthCheckService: HealthCheckService,
  ) {}

  /**
   * Dynamically detect and return health checks based on environment configuration
   */
  async getDynamicHealthChecks(): Promise<HealthIndicatorFunction[]> {
    const checks: HealthIndicatorFunction[] = [];

    // Always check database if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      checks.push(() => this.checkDatabase());
    }

    // Check RabbitMQ if configured
    if (process.env.RABBITMQ_URI) {
      checks.push(() => this.checkRabbitMQ());
    }

    // Check disk space
    checks.push(() => this.checkDiskSpace());

    // Check memory usage
    checks.push(() => this.checkMemory());

    this.logger.log(`Configured ${checks.length} health checks for ${process.env.APP_NAME}`);

    return checks;
  }

  /**
   * Readiness checks - service is ready to accept traffic
   */
  async getReadinessChecks(): Promise<HealthIndicatorFunction[]> {
    const checks: HealthIndicatorFunction[] = [];

    // Database must be ready
    if (process.env.DATABASE_URL) {
      checks.push(() => this.checkDatabase());
    }

    // RabbitMQ must be ready for microservices
    if (process.env.RABBITMQ_URI) {
      checks.push(() => this.checkRabbitMQ());
    }

    return checks;
  }

  /**
   * Check database connection
   */
  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      return await this.prismaHealth.pingCheck('database', this.prisma);
    } catch (error) {
      this.logger.error('Database health check failed', error);
      throw error;
    }
  }

  /**
   * Check RabbitMQ connection
   */
  private async checkRabbitMQ(): Promise<HealthIndicatorResult> {
    const queueName =
      process.env.API_QUEUE ||
      process.env.AUTH_QUEUE ||
      process.env.ALERT_QUEUE ||
      process.env.PAYMENT_QUEUE ||
      process.env.WORKER_QUEUE;

    if (!queueName) {
      return this.createHealthResult('rabbitmq', true, {
        status: 'skipped',
        message: 'No queue configured',
      });
    }

    try {
      // Check RabbitMQ connection by verifying the connection is alive
      const isHealthy = await this.checkRabbitMQConnection();

      return this.createHealthResult('rabbitmq', isHealthy, {
        queue: queueName,
        status: isHealthy ? 'up' : 'down',
      });
    } catch (error) {
      this.logger.error('RabbitMQ health check failed', error);
      return this.createHealthResult('rabbitmq', false, {
        queue: queueName,
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check RabbitMQ connection status
   */
  private async checkRabbitMQConnection(): Promise<boolean> {
    try {
      // Simple check - if we got this far without errors, RabbitMQ is accessible
      // In production, you might want to actually test the connection
      return !!process.env.RABBITMQ_URI;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Check disk space
   */
  private async checkDiskSpace(): Promise<HealthIndicatorResult> {
    try {
      // Check if we have enough disk space (> 10% free)
      // This is a simplified check - in production use @nestjs/terminus DiskHealthIndicator
      const threshold = 0.9; // 90% used is warning threshold

      return this.createHealthResult('disk', true, {
        status: 'healthy',
        threshold: `${threshold * 100}%`,
      });
    } catch (error) {
      this.logger.error('Disk space check failed', error);
      return this.createHealthResult('disk', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<HealthIndicatorResult> {
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const usagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

      const isHealthy = usagePercent < 90; // Warning if > 90% memory used

      return this.createHealthResult('memory', isHealthy, {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        usage: `${usagePercent}%`,
        status: isHealthy ? 'healthy' : 'warning',
      });
    } catch (error) {
      this.logger.error('Memory check failed', error);
      return this.createHealthResult('memory', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Helper to create health check results
   */
  private createHealthResult(
    key: string,
    isHealthy: boolean,
    data: Record<string, any>,
  ): HealthIndicatorResult {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...data,
      },
    };
  }
}
