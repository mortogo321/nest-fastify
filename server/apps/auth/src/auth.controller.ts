import {
  HttpBadRequestSchema,
  HttpResponseSchema,
  JwtGuard,
} from '@app/common';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
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
  signOut(@Req() request: Request) {
    return this.authService.signOut(request);
  }

  @ApiTags('Secured')
  @ApiOperation({
    summary: 'Get Profile',
  })
  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Req() request: Request) {
    console.log(request);
    return 'user'; //request.user;
  }
}
