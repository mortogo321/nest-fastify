import {
  AuthenticatorModule,
  DatabaseModule,
  JwtGuard,
  RmqModule,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleController } from './google/google.controller';
import { FacebookController } from './facebook/facebook.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/auth/.env.app`,
    }),
    RmqModule.register({ name: process.env.AUTH_QUEUE }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    AuthenticatorModule,
  ],
  controllers: [AuthController, GoogleController, FacebookController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AuthModule {}
