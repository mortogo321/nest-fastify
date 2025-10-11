import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendPushNotificationDto {
  @ApiProperty({
    description: 'User ID or device token',
    example: 'user-123',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Message',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification body',
    example: 'You have a new message from John',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'Additional data payload',
    example: { conversationId: '456', type: 'chat' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({
    description: 'Additional metadata',
    example: { priority: 'high', badge: 1 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
