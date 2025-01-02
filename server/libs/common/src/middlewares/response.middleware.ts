import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ResponseMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const startTime = new Date().getTime();

    res.on('finish', () => {
      const { statusCode } = res;

      const endTime = new Date().getTime();
      const duration = endTime - startTime;

      res.setHeader('duration', duration);
    });

    next();
  }
}
