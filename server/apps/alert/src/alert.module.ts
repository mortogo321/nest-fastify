import {
  AuthenticatorModule,
  alertEnvSchema,
  DatabaseModule,
  EventBusService,
  EventPriority,
  getEnv,
  getRequiredEnv,
  HealthModule,
  JwtGuard,
  LoggerMiddleware,
  RmqModule,
  validateEnv,
  winstonConfig,
} from '@app/common';
import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import {
  OrderPlacedEventHandler,
  PaymentSuccessEventHandler,
  UserRegisteredEventHandler,
} from './events';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/alert/.env.app`,
      expandVariables: true,
      validate: () => validateEnv(alertEnvSchema),
    }),
    WinstonModule.forRootAsync({ useFactory: () => winstonConfig }),
    RmqModule.register({ name: getRequiredEnv('ALERT_QUEUE') }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: getRequiredEnv('JWT_SECRET'),
      signOptions: { expiresIn: getEnv('JWT_EXPIRATION', '1h') },
    }),
    AuthenticatorModule,
    HealthModule,
  ],
  controllers: [AlertController],
  providers: [
    EventBusService,
    AlertService,
    UserRegisteredEventHandler,
    OrderPlacedEventHandler,
    PaymentSuccessEventHandler,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AlertModule implements NestModule, OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly userRegisteredHandler: UserRegisteredEventHandler,
    private readonly orderPlacedHandler: OrderPlacedEventHandler,
    private readonly paymentSuccessHandler: PaymentSuccessEventHandler,
  ) {}

  async onModuleInit() {
    // Subscribe to events
    this.eventBus.subscribe('user.registered', this.userRegisteredHandler, EventPriority.HIGH);

    this.eventBus.subscribe('order.placed', this.orderPlacedHandler, EventPriority.HIGH);

    this.eventBus.subscribe('payment.success', this.paymentSuccessHandler, EventPriority.HIGH);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
