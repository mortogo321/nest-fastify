import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersGrpcController } from './users-grpc.controller';

@Module({
  controllers: [UsersController, UsersGrpcController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
