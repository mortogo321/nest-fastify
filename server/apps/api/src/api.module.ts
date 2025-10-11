import {
  AuthenticatorModule,
  apiEnvSchema,
  DatabaseModule,
  GrpcModule,
  getRequiredEnv,
  HealthModule,
  JwtGuard,
  LoggerMiddleware,
  RmqModule,
  validateEnv,
  winstonConfig,
} from '@app/common';
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/api/.env.app`,
      expandVariables: true,
      validate: () => validateEnv(apiEnvSchema),
    }),
    WinstonModule.forRootAsync({ useFactory: () => winstonConfig }),
    RmqModule.register({ name: getRequiredEnv('API_QUEUE') }),
    GrpcModule.register({
      packageName: getRequiredEnv('GRPC_PACKAGE'),
      name: 'auth',
    }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: getRequiredEnv('JWT_SECRET'),
      signOptions: { expiresIn: getRequiredEnv('JWT_EXPIRATION') },
    }),
    AuthenticatorModule,
    HealthModule,
  ],
  controllers: [ApiController],
  providers: [
    ApiService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
