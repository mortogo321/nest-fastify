import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString, Matches } from 'class-validator';

export class SendSmsNotificationDto {
  @ApiProperty({
    description: 'Recipient phone number (E.164 format)',
    example: '+14155552671',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +14155552671)',
  })
  to!: string;

  @ApiProperty({
    description: 'SMS message content',
    example: 'Your verification code is 123456',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({
    description: 'Additional metadata',
    example: { userId: '123', type: 'verification' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
