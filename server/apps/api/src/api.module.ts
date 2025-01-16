import {
  AuthenticatorModule,
  DatabaseModule,
  GrpcModule,
  JwtGuard,
  LoggerMiddleware,
  RmqModule,
  winstonConfig,
} from '@app/common';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
    }),
    WinstonModule.forRootAsync({ useFactory: () => winstonConfig }),
    RmqModule.register({ name: process.env.API_QUEUE }),
    GrpcModule.register({
      packageName: process.env.GRPC_PACKAGE,
      name: 'auth',
    }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    AuthenticatorModule,
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
