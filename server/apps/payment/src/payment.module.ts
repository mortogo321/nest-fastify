import {
  AuthenticatorModule,
  DatabaseModule,
  getJwtExpiresIn,
  getRequiredEnv,
  HealthModule,
  JwtGuard,
  LoggerMiddleware,
  paymentEnvSchema,
  RmqModule,
  validateEnv,
  winstonConfig,
} from '@app/common';
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/payment/.env.app`,
      expandVariables: true,
      validate: () => validateEnv(paymentEnvSchema),
    }),
    WinstonModule.forRootAsync({ useFactory: () => winstonConfig }),
    RmqModule.register({ name: getRequiredEnv('PAYMENT_QUEUE') }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: getRequiredEnv('JWT_SECRET'),
      signOptions: { expiresIn: getJwtExpiresIn() },
    }),
    AuthenticatorModule,
    HealthModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
