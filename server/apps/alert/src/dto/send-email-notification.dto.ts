import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendEmailNotificationDto {
  @ApiProperty({
    description: 'Recipient email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Welcome to our platform',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Email body content',
    example: 'Thank you for registering!',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'Sender email address',
    example: 'noreply@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  from?: string;

  @ApiProperty({
    description: 'Additional metadata',
    example: { userId: '123', campaignId: 'welcome-email' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
