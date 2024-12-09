import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  getHello(): string {
    const appName = process.env.APP_NAME;

    return `Hello from ${appName}!`;
  }
}
