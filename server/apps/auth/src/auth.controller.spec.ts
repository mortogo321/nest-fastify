import type { AuthenticatorService, PrismaService } from '@app/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { RefreshTokenService } from './refresh-token/refresh-token.service';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(() => {
    process.env.APP_NAME = 'Auth';
    const authService = new AuthService(
      {} as PrismaService,
      {} as AuthenticatorService,
      {} as RefreshTokenService,
      {} as JwtService,
      {} as ConfigService,
    );
    authController = new AuthController(authService);
  });

  describe('root', () => {
    it('should return a greeting from the auth service', () => {
      expect(authController.getHello()).toBe('Hello from Auth!');
    });

    it('should be defined', () => {
      expect(authController).toBeDefined();
    });
  });
});
