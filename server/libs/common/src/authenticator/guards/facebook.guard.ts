import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

@Injectable()
export class FacebookGuard implements CanActivate {
  constructor(_reflector: Reflector) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
