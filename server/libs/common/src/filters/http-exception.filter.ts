import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    } else if (exception instanceof Error) {
      // Handle generic errors
      message = exception.message;
      error = exception.name;

      // Log unexpected errors
      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
    }

    // Security: Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production' && status === 500) {
      message = 'An unexpected error occurred';
      error = 'Internal Server Error';
    }

    // Log all errors for monitoring
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - ${
        typeof message === 'string' ? message : JSON.stringify(message)
      }`,
    );

    response.status(status).send({
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
