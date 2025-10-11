import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
  Optional,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { type Observable, tap } from 'rxjs';
import type { AuditService } from '../audit';

/**
 * Audit Log Interceptor
 * Logs all incoming requests and outgoing responses for audit trail
 * Persists logs to database if AuditService is available
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  constructor(@Optional() private readonly auditService?: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();
    const { method, url, ip, headers, query, body } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const user = (request as any).user;
    const userId = user?.sub;
    const userEmail = user?.email;
    const requestId = (request as any).id || this.generateRequestId();
    const startTime = Date.now();

    // Extract service name from URL or environment
    const service = this.extractServiceName(url);
    const version = this.extractVersion(url);

    // Log incoming request (console/winston)
    this.logger.log({
      message: 'Incoming Request',
      requestId,
      method,
      url,
      ip,
      userId: userId || 'anonymous',
      userAgent,
      timestamp: new Date().toISOString(),
    });

    let responseData: any;

    return next.handle().pipe(
      tap({
        next: (data) => {
          responseData = data;
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode || 200;

          // Log successful response (console/winston)
          this.logger.log({
            message: 'Request Completed',
            requestId,
            method,
            url,
            userId: userId || 'anonymous',
            statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });

          // Persist to database (async, non-blocking)
          if (this.auditService) {
            this.auditService.createLog({
              requestId,
              method,
              path: url,
              query: query ? JSON.stringify(query) : undefined,
              body: body ? JSON.stringify(body) : undefined,
              userId,
              userEmail,
              ip,
              userAgent,
              statusCode,
              response: responseData ? JSON.stringify(responseData) : undefined,
              duration,
              service,
              version,
            });
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log failed response (console/winston)
          this.logger.error({
            message: 'Request Failed',
            requestId,
            method,
            url,
            userId: userId || 'anonymous',
            statusCode,
            error: error.message,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });

          // Persist to database (async, non-blocking)
          if (this.auditService) {
            this.auditService.createLog({
              requestId,
              method,
              path: url,
              query: query ? JSON.stringify(query) : undefined,
              body: body ? JSON.stringify(body) : undefined,
              userId,
              userEmail,
              ip,
              userAgent,
              statusCode,
              response: undefined,
              duration,
              service,
              version,
              error: error.message,
            });
          }
        },
      }),
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private extractServiceName(url: string): string {
    // Extract service name from URL path (e.g., /auth/v1/login -> auth)
    const match = url.match(/^\/([^/]+)/);
    return match?.[1] ?? process.env.APP_NAME ?? 'unknown';
  }

  private extractVersion(url: string): string | undefined {
    // Extract version from URL path (e.g., /auth/v1/login -> v1)
    const match = url.match(/\/v(\d+)\//);
    return match ? `v${match[1]}` : undefined;
  }
}
