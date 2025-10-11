import {
  AuthenticatorModule,
  DatabaseModule,
  getEnv,
  getRequiredEnv,
  HealthModule,
  JwtGuard,
  LoggerMiddleware,
  RmqModule,
  TaskQueueService,
  validateEnv,
  winstonConfig,
  workerEnvSchema,
} from '@app/common';
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { DataImportProcessor } from './tasks/data-import.processor';
import { EmailTaskProcessor } from './tasks/email-task.processor';
import { ReportGenerationProcessor } from './tasks/report-generation.processor';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/worker/.env.app`,
      expandVariables: true,
      validate: () => validateEnv(workerEnvSchema),
    }),
    WinstonModule.forRootAsync({ useFactory: () => winstonConfig }),
    RmqModule.register({ name: getRequiredEnv('WORKER_QUEUE') }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: getRequiredEnv('JWT_SECRET'),
      signOptions: { expiresIn: getRequiredEnv('JWT_EXPIRATION') },
    }),
    AuthenticatorModule,
    HealthModule,
  ],
  controllers: [WorkerController],
  providers: [
    TaskQueueService,
    EmailTaskProcessor,
    ReportGenerationProcessor,
    DataImportProcessor,
    WorkerService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class WorkerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
