import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { format } from 'date-fns';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).send({
      status: false,
      statusCode: status,
      path: request.url,
      timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss xxx'),
      message: 'Unauthorized',
    });
  }
}
