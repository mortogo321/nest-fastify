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
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/worker/.env.app`,
      expandVariables: true,
    }),
    RmqModule.register({ name: process.env.WORKER_QUEUE }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    AuthenticatorModule,
  ],
  controllers: [WorkerController],
  providers: [
    WorkerService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class WorkerModule {}
