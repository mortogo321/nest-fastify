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
import { ThingsBoardController } from './things-board.controller';
import { ThingsBoardService } from './things-board.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/things-board/.env.app`,
    }),
    RmqModule.register({ name: process.env.THINGS_BOARD_QUEUE }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    AuthenticatorModule,
  ],
  controllers: [ThingsBoardController],
  providers: [
    ThingsBoardService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class ThingsBoardModule {}
