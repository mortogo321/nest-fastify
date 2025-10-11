import {
  type AuthenticatorService,
  getEnv,
  hash,
  type PrismaService,
  UserResponseDto,
  verifyHash,
} from '@app/common';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import type { AuthDto } from './dtos/auth.dto';
import type { TokenResponseDto } from './dtos/token-response.dto';
import type { RefreshTokenService } from './refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private db: PrismaService,
    _authService: AuthenticatorService,
    public refreshTokenService: RefreshTokenService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  getHello(): string {
    const appName = getEnv('APP_NAME', 'Auth');

    return `Hello from ${appName}!`;
  }

  async signUp(body: AuthDto): Promise<UserResponseDto> {
    const { email, password } = body;
    const isUser = await this.db.user.findFirst({ where: { email } });

    if (isUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hash(password);
    const user = await this.db.user.create({
      data: {
        email,
        hashedPassword,
      },
    });

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async signIn(body: AuthDto): Promise<TokenResponseDto> {
    const { email, password } = body;
    const user = await this.db.user.findFirst({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // Check if user is active (optional field)
    if ('isActive' in user && !(user as any).isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    if (!(await verifyHash(user.hashedPassword, password))) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const payload = { email: user.email, sub: user.id };

    // Generate access token
    const accessToken = await this.jwtService.signAsync(payload);

    // Generate refresh token
    const refreshToken = await this.refreshTokenService.generateRefreshToken(user.id);

    // Get token expiration from config
    const expiresIn = this.parseExpiration(this.configService.get<string>('JWT_EXPIRATION', '1h'));

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  async signOut(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific refresh token
      await this.refreshTokenService.revokeRefreshToken(refreshToken);
    } else {
      // Revoke all refresh tokens for user
      await this.refreshTokenService.revokeAllUserTokens(userId);
    }
  }

  /**
   * Parse JWT expiration string to seconds
   */
  private parseExpiration(expiration?: string): number {
    if (!expiration) {
      return 3600; // Default 1 hour
    }

    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // Default 1 hour
    }

    const [, value, unit] = match;
    const num = parseInt(value ?? '3600', 10);

    switch (unit) {
      case 's':
        return num;
      case 'm':
        return num * 60;
      case 'h':
        return num * 3600;
      case 'd':
        return num * 86400;
      default:
        return 3600;
    }
  }
}
