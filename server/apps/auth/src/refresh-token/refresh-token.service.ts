import type { PrismaService } from '@app/common';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    readonly _configService: ConfigService,
  ) {}

  /**
   * Generate a new refresh token for a user
   */
  async generateRefreshToken(userId: string): Promise<string> {
    // Generate a secure random token
    const token = randomBytes(64).toString('hex');

    // Calculate expiration (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Store in database
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    this.logger.log(`Generated refresh token for user ${userId}`);

    return token;
  }

  /**
   * Validate and use a refresh token to generate new access token
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Find the refresh token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // Validate token exists
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is revoked
    if (storedToken.revokedAt) {
      this.logger.warn(`Attempted to use revoked refresh token for user ${storedToken.userId}`);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      this.logger.warn(`Attempted to use expired refresh token for user ${storedToken.userId}`);
      // Clean up expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Check if user is active (optional field)
    if ('isActive' in storedToken.user && !(storedToken.user as any).isActive) {
      throw new UnauthorizedException('User account is not active');
    }

    // Generate new access token
    const payload = {
      email: storedToken.user.email,
      sub: storedToken.user.id,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // Generate new refresh token (rotate tokens for security)
    const newRefreshToken = await this.generateRefreshToken(storedToken.userId);

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`Refreshed tokens for user ${storedToken.userId}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (refreshToken) {
      await this.prisma.refreshToken.update({
        where: { id: refreshToken.id },
        data: { revokedAt: new Date() },
      });

      this.logger.log(`Revoked refresh token ${refreshToken.id}`);
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.log(`Revoked all refresh tokens for user ${userId}`);
  }

  /**
   * Clean up expired tokens (can be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired refresh tokens`);

    return result.count;
  }
}
