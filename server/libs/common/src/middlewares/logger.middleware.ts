import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger();

  use(req: any, res: any, next: () => void) {
    const startTime = new Date().getTime();

    res.on('finish', () => {
      const statusCode = res.statusCode;
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
      const log = `[${req.method}] ${req.url} - ${statusCode} - ${duration}ms`;

      if ([401, 403, 404, 405].includes(statusCode)) {
        this.logger.warn(log);
      } else {
        this.logger.log(log);
      }
    });

    next();
  }
}
