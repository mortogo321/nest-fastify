import { HttpBadRequestSchema, HttpResponseSchema, Public } from '@app/common';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Health' })
  @Public()
  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @ApiOperation({ summary: 'Sing up' })
  @ApiExtraModels(AuthDto)
  @ApiBody({ schema: { $ref: getSchemaPath(AuthDto) } })
  @ApiResponse(HttpResponseSchema)
  @ApiBadRequestResponse(HttpBadRequestSchema)
  @Public()
  @Post('sign-up')
  async signUp(@Body() body: AuthDto) {
    return await this.authService.signUp(body);
  }

  @ApiOperation({ summary: 'Sing in' })
  @ApiExtraModels(AuthDto)
  @ApiBody({ schema: { $ref: getSchemaPath(AuthDto) } })
  @ApiResponse(HttpResponseSchema)
  @ApiBadRequestResponse(HttpBadRequestSchema)
  @Public()
  @Post('sign-in')
  async signIn(@Body() body: AuthDto) {
    return await this.authService.signIn(body);
  }

  @ApiOperation({ summary: 'Sing out' })
  @Get('sign-out')
  signOut(@Req() request: FastifyRequest) {
    return this.authService.signOut(request);
  }

  @ApiOperation({ summary: 'Secured get profile' })
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() request: FastifyRequest) {
    return (<any>request).user;
  }
}
