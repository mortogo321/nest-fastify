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
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/alert/.env.app`,
    }),
    RmqModule.register({ name: process.env.ALERT_QUEUE }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    AuthenticatorModule,
  ],
  controllers: [AlertController],
  providers: [
    AlertService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AlertModule {}
