import { HttpBadRequestSchema, HttpResponseSchema } from '@app/common';
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('health')
  @Get()
  @ApiOperation({
    summary: 'Get Hello',
  })
  getHello(): string {
    return this.authService.getHello();
  }

  @ApiExtraModels(AuthDto)
  @ApiBody({ schema: { $ref: getSchemaPath(AuthDto) } })
  @ApiResponse(HttpResponseSchema)
  @ApiBadRequestResponse(HttpBadRequestSchema)
  @Post('sign-up')
  async signUp(@Body() body: AuthDto) {
    return await this.authService.signUp(body);
  }

  @ApiExtraModels(AuthDto)
  @ApiBody({ schema: { $ref: getSchemaPath(AuthDto) } })
  @ApiResponse(HttpResponseSchema)
  @ApiBadRequestResponse(HttpBadRequestSchema)
  @Post('sign-in')
  async signIn(@Body() body: AuthDto) {
    return await this.authService.signIn(body);
  }

  @Get('sign-out')
  signOut(@Res() res: Request) {
    return this.authService.signOut(res);
  }
}
