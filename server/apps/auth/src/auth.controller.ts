import {
  getRequiredEnv,
  HttpBadRequestSchema,
  isProduction,
  Public,
  UserResponseDto,
} from '@app/common';
import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { addHours } from 'date-fns';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { TokenResponseDto } from './dtos/token-response.dto';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ description: 'Service is healthy', type: String })
  @Public()
  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @ApiOperation({ summary: 'Sign up - Create new user account' })
  @ApiExtraModels(AuthDto, UserResponseDto)
  @ApiBody({ schema: { $ref: getSchemaPath(AuthDto) } })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Email already exists or validation failed',
    ...HttpBadRequestSchema,
  })
  @Public()
  @Post('sign-up')
  async signUp(@Body() body: AuthDto): Promise<UserResponseDto> {
    return await this.authService.signUp(body);
  }

  @ApiOperation({ summary: 'Sign in - Authenticate and get tokens' })
  @ApiExtraModels(AuthDto, TokenResponseDto)
  @ApiBody({ schema: { $ref: getSchemaPath(AuthDto) } })
  @ApiOkResponse({
    description: 'Successfully authenticated',
    type: TokenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials or account not active',
    ...HttpBadRequestSchema,
  })
  @Public()
  @Post('sign-in')
  async signIn(@Body() body: AuthDto, @Res() response: FastifyReply): Promise<FastifyReply> {
    const tokens = await this.authService.signIn(body);
    const cookieName = getRequiredEnv('JWT_COOKIES');

    // Set access token in cookie
    response.setCookie(cookieName, tokens.accessToken, {
      expires: addHours(new Date(), 1),
      httpOnly: true,
      secure: isProduction(),
      sameSite: 'strict',
    });

    // Set refresh token in separate cookie
    response.setCookie('refresh_token', tokens.refreshToken, {
      expires: addHours(new Date(), 24 * 30), // 30 days
      httpOnly: true,
      secure: isProduction(),
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return response.send(tokens);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Valid refresh token',
          example: 'abc123...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiOkResponse({
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        tokenType: { type: 'string', example: 'Bearer' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired refresh token',
    ...HttpBadRequestSchema,
  })
  @Public()
  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Res() response: FastifyReply,
  ): Promise<FastifyReply> {
    const tokens = await this.authService.refreshTokenService.refreshAccessToken(refreshToken);
    const cookieName = getRequiredEnv('JWT_COOKIES');

    // Set new access token in cookie
    response.setCookie(cookieName, tokens.accessToken, {
      expires: addHours(new Date(), 1),
      httpOnly: true,
      secure: isProduction(),
      sameSite: 'strict',
    });

    // Set new refresh token in cookie
    response.setCookie('refresh_token', tokens.refreshToken, {
      expires: addHours(new Date(), 24 * 30),
      httpOnly: true,
      secure: isProduction(),
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return response.send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
    });
  }

  @ApiOperation({ summary: 'Sign out - Revoke refresh tokens and clear cookies' })
  @ApiNoContentResponse({
    description: 'Successfully signed out',
  })
  @ApiBearerAuth()
  @Get('sign-out')
  async signOut(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
  ): Promise<FastifyReply> {
    const user = (<any>request).user;
    const refreshToken = request.cookies.refresh_token;

    if (user?.sub) {
      await this.authService.signOut(user.sub, refreshToken);
    }

    const cookieName = getRequiredEnv('JWT_COOKIES');
    response.clearCookie(cookieName);
    response.clearCookie('refresh_token');

    return response.status(HttpStatus.NO_CONTENT).send();
  }

  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sub: { type: 'string', description: 'User ID' },
        email: { type: 'string', description: 'Email address' },
        iat: { type: 'number', description: 'Issued at timestamp' },
        exp: { type: 'number', description: 'Expiration timestamp' },
      },
    },
  })
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() request: FastifyRequest) {
    return (<any>request).user;
  }
}
