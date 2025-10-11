import {
  AuditModule,
  AuthenticatorModule,
  authEnvSchema,
  DatabaseModule,
  getRequiredEnv,
  HealthModule,
  JwtGuard,
  LoggerMiddleware,
  RequestIdMiddleware,
  RmqModule,
  validateEnv,
  winstonConfig,
} from '@app/common';
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FacebookController } from './facebook/facebook.controller';
import { GoogleController } from './google/google.controller';
import { AuthGrpcController } from './grpc/auth-grpc.controller';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/auth/.env.app`,
      expandVariables: true,
      validate: () => validateEnv(authEnvSchema),
    }),
    WinstonModule.forRootAsync({ useFactory: () => winstonConfig }),
    RmqModule.register({ name: getRequiredEnv('AUTH_QUEUE') }),
    DatabaseModule,
    AuditModule,
    JwtModule.register({
      global: true,
      secret: getRequiredEnv('JWT_SECRET'),
      signOptions: { expiresIn: getRequiredEnv('JWT_EXPIRATION') },
    }),
    AuthenticatorModule,
    HealthModule,
    UsersModule,
  ],
  controllers: [AuthController, GoogleController, FacebookController, AuthGrpcController],
  providers: [
    AuthService,
    RefreshTokenService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  exports: [RefreshTokenService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
