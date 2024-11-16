import { DatabaseModule, RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/api/.env.app`,
    }),
    RmqModule.register({ name: process.env.AUTH_QUEUE }),
    DatabaseModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
