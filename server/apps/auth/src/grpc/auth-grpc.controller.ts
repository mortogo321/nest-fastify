import type { PrismaService } from '@app/common';
import { status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import type { AuthService } from '../auth.service';
import type { RefreshTokenService } from '../refresh-token/refresh-token.service';

/**
 * gRPC Controller for Authentication Service
 * Handles all gRPC authentication-related operations
 */
@Controller()
export class AuthGrpcController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Sign up a new user
   */
  @GrpcMethod('AuthService', 'SignUp')
  async signUp(data: { email: string; password: string }) {
    try {
      const user = await this.authService.signUp(data);
      const userWithFields = user as any;

      return {
        id: user.id,
        email: user.email,
        isActive: userWithFields.isActive ?? true,
        isVerified: userWithFields.isVerified ?? false,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: error instanceof Error ? error.message : 'Failed to create user',
      });
    }
  }

  /**
   * Sign in and get tokens
   */
  @GrpcMethod('AuthService', 'SignIn')
  async signIn(data: { email: string; password: string }) {
    try {
      const tokens = await this.authService.signIn(data);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn,
      };
    } catch (error) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  }

  /**
   * Sign out and revoke tokens
   */
  @GrpcMethod('AuthService', 'SignOut')
  async signOut(data: { userId: string; refreshToken?: string }) {
    try {
      await this.authService.signOut(data.userId, data.refreshToken);
      return {};
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Sign out failed',
      });
    }
  }

  /**
   * Refresh access token
   */
  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(data: { refreshToken: string }) {
    try {
      const tokens = await this.refreshTokenService.refreshAccessToken(data.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600, // 1 hour
      };
    } catch (error) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: error instanceof Error ? error.message : 'Token refresh failed',
      });
    }
  }

  /**
   * Validate access token
   */
  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { accessToken: string }) {
    try {
      const payload = await this.jwtService.verifyAsync(data.accessToken);

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true },
      });

      if (!user) {
        return {
          valid: false,
          userId: '',
          email: '',
          error: 'User not found',
        };
      }

      // Check if user is active (optional field)
      const userWithActive = user as any;
      if ('isActive' in userWithActive && !userWithActive.isActive) {
        return {
          valid: false,
          userId: '',
          email: '',
          error: 'User inactive',
        };
      }

      return {
        valid: true,
        userId: user.id,
        email: user.email,
        error: '',
      };
    } catch (error) {
      return {
        valid: false,
        userId: '',
        email: '',
        error: error instanceof Error ? error.message : 'Invalid token',
      };
    }
  }

  /**
   * Get user profile
   */
  @GrpcMethod('AuthService', 'GetProfile')
  async getProfile(data: { userId: string }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const userWithFields = user as any;
      return {
        id: user.id,
        email: user.email,
        isActive: userWithFields.isActive ?? true,
        isVerified: userWithFields.isVerified ?? false,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Failed to get profile',
      });
    }
  }
}
