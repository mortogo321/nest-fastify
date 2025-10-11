import { Injectable, Logger } from '@nestjs/common';
import type { PrismaService } from '../database';

export interface AuditLogData {
  requestId: string;
  method: string;
  path: string;
  query?: string;
  body?: string;
  userId?: string;
  userEmail?: string;
  ip: string;
  userAgent?: string;
  statusCode: number;
  response?: string;
  duration: number;
  service: string;
  version?: string;
  error?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an audit log entry
   */
  async createLog(data: AuditLogData): Promise<void> {
    try {
      // Sanitize sensitive data
      const sanitizedData = this.sanitizeData(data);

      await this.prisma.auditLog.create({
        data: sanitizedData,
      });
    } catch (error) {
      // Don't fail the request if audit logging fails
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create audit log: ${message}`);
    }
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserLogs(userId: string, limit = 100): Promise<any[]> {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get audit logs for a specific request ID
   */
  async getRequestLogs(requestId: string): Promise<any[]> {
    return this.prisma.auditLog.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get recent audit logs with filters
   */
  async getLogs(filters: {
    userId?: string;
    method?: string;
    path?: string;
    statusCode?: number;
    service?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    const { userId, method, path, statusCode, service, startDate, endDate, limit = 100 } = filters;

    return this.prisma.auditLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(method && { method }),
        ...(path && { path: { contains: path } }),
        ...(statusCode && { statusCode }),
        ...(service && { service }),
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(filters: {
    userId?: string;
    service?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const { userId, service, startDate, endDate } = filters;

    const where = {
      ...(userId && { userId }),
      ...(service && { service }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [totalRequests, successfulRequests, failedRequests, avgDuration] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.count({
        where: { ...where, statusCode: { gte: 200, lt: 300 } },
      }),
      this.prisma.auditLog.count({
        where: { ...where, statusCode: { gte: 400 } },
      }),
      this.prisma.auditLog.aggregate({
        where,
        _avg: { duration: true },
      }),
    ]);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : 0,
      avgDuration: avgDuration._avg.duration ? Math.round(avgDuration._avg.duration) : 0,
    };
  }

  /**
   * Clean up old audit logs (for maintenance)
   */
  async cleanupOldLogs(daysToKeep = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old audit logs`);
    return result.count;
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeData(data: AuditLogData): AuditLogData {
    const sanitized = { ...data };

    // Remove sensitive fields from body
    if (sanitized.body) {
      try {
        const body = JSON.parse(sanitized.body);
        // Remove passwords, tokens, etc.
        const sensitiveFields = [
          'password',
          'token',
          'secret',
          'apiKey',
          'accessToken',
          'refreshToken',
          'hashedPassword',
        ];

        sensitiveFields.forEach((field) => {
          if (body[field]) {
            body[field] = '[REDACTED]';
          }
        });

        sanitized.body = JSON.stringify(body);
      } catch {
        // If parsing fails, keep as is or truncate
        if (sanitized.body.length > 5000) {
          sanitized.body = `${sanitized.body.substring(0, 5000)}...[TRUNCATED]`;
        }
      }
    }

    // Truncate response if too large
    if (sanitized.response && sanitized.response.length > 5000) {
      sanitized.response = `${sanitized.response.substring(0, 5000)}...[TRUNCATED]`;
    }

    // Truncate query if too large
    if (sanitized.query && sanitized.query.length > 2000) {
      sanitized.query = `${sanitized.query.substring(0, 2000)}...[TRUNCATED]`;
    }

    return sanitized;
  }
}
