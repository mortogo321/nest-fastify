import { Public } from '@app/common';
import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import type { AlertService } from './alert.service';
import type {
  SendEmailNotificationDto,
  SendPushNotificationDto,
  SendSmsNotificationDto,
} from './dto';

@ApiTags('Alert')
@Controller()
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'Service is healthy',
    schema: {
      type: 'string',
      example: 'Hello from Alert Service!',
    },
  })
  @Public()
  @Get()
  getHello(): string {
    return this.alertService.getHello();
  }

  @ApiOperation({ summary: 'Get authenticated user profile from JWT' })
  @ApiOkResponse({
    description: 'User profile from JWT token',
    schema: {
      type: 'object',
      properties: {
        sub: { type: 'string', description: 'User ID' },
        email: { type: 'string', description: 'Email address' },
        iat: { type: 'number', description: 'Issued at timestamp' },
        exp: { type: 'number', description: 'Expiration timestamp' },
      },
    },
  })
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() request: FastifyRequest) {
    return (<any>request).user;
  }

  // Notification Endpoints

  @ApiOperation({ summary: 'Send email notification' })
  @ApiResponse({
    status: 201,
    description: 'Email notification sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        messageId: { type: 'string', example: 'email-1234567890' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiBearerAuth()
  @Post('notifications/email')
  async sendEmailNotification(@Body() dto: SendEmailNotificationDto) {
    return this.alertService.sendEmail(dto);
  }

  @ApiOperation({ summary: 'Send SMS notification' })
  @ApiResponse({
    status: 201,
    description: 'SMS notification sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        messageId: { type: 'string', example: 'sms-1234567890' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiBearerAuth()
  @Post('notifications/sms')
  async sendSmsNotification(@Body() dto: SendSmsNotificationDto) {
    return this.alertService.sendSMS(dto);
  }

  @ApiOperation({ summary: 'Send push notification' })
  @ApiResponse({
    status: 201,
    description: 'Push notification sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        messageId: { type: 'string', example: 'push-1234567890' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiBearerAuth()
  @Post('notifications/push')
  async sendPushNotification(@Body() dto: SendPushNotificationDto) {
    return this.alertService.sendPush(dto);
  }

  // Event Endpoints

  @ApiOperation({ summary: 'Get event history' })
  @ApiQuery({
    name: 'eventName',
    required: false,
    description: 'Filter by specific event name',
    example: 'notification.email.sent',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of events to return',
    example: 100,
  })
  @ApiOkResponse({
    description: 'Event history',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          name: { type: 'string', example: 'notification.email.sent' },
          data: { type: 'object' },
          priority: { type: 'number', example: 5 },
          timestamp: { type: 'string', format: 'date-time' },
          source: { type: 'string', example: 'alert-service' },
          metadata: { type: 'object' },
        },
      },
    },
  })
  @ApiBearerAuth()
  @Get('events')
  async getEventHistory(@Query('eventName') eventName?: string, @Query('limit') limit?: number) {
    return this.alertService.getEventHistory(eventName, limit);
  }

  @ApiOperation({ summary: 'Get event statistics' })
  @ApiOkResponse({
    description: 'Event bus statistics',
    schema: {
      type: 'object',
      properties: {
        totalEvents: { type: 'number', example: 10 },
        totalSubscriptions: { type: 'number', example: 3 },
        historySize: { type: 'number', example: 150 },
        subscriptionCounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              event: { type: 'string', example: 'user.registered' },
              subscribers: { type: 'number', example: 1 },
            },
          },
        },
      },
    },
  })
  @ApiBearerAuth()
  @Get('events/stats')
  async getEventStats() {
    return this.alertService.getEventStats();
  }
}
