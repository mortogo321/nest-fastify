import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger();

  use(req: any, res: any, next: () => void) {
    res.on('finish', () => {
      const statusCode = res.statusCode;

      if ([401, 403, 404, 405].includes(statusCode)) {
        this.logger.warn(`[${req.method}] ${req.url} - ${statusCode}`);
      } else {
        this.logger.log(`[${req.method}] ${req.url} - ${statusCode}`);
      }
    });

    next();
  }
}
