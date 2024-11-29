import { HttpBadRequestSchema, HttpResponseSchema, Public } from '@app/common';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
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
import { addHours } from 'date-fns';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';

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
  async signIn(@Body() body: AuthDto, @Res() response: FastifyReply) {
    const jwtToken = await this.authService.signIn(body);

    response.setCookie(process.env.JWT_COOKIES, jwtToken.access_token, {
      expires: addHours(new Date(), parseInt(process.env.JWT_EXPIRATION)),
    });

    return response.send(jwtToken);
  }

  @ApiOperation({ summary: 'Sing out' })
  @Get('sign-out')
  signOut(@Res() response: FastifyReply) {
    response.clearCookie(process.env.JWT_COOKIES);

    return response.status(HttpStatus.NO_CONTENT).send();
  }

  @ApiOperation({ summary: 'Get profile' })
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() request: FastifyRequest) {
    return (<any>request).user;
  }
}
