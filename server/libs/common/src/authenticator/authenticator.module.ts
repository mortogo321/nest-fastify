import { Module } from '@nestjs/common';
import { AuthenticatorService } from './authenticator.service';

@Module({
  providers: [AuthenticatorService],
  exports: [],
})
export class AuthenticatorModule {}
