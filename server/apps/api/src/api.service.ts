import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  getHello(): string {
    const appName = process.env.APP_NAME;

    return `Hello from ${appName}!`;
  }
}
