import { Public } from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import type { CreateEmailJobDto, CreateImportJobDto, CreateReportJobDto } from './dto';
import type { WorkerService } from './worker.service';

@ApiTags('Worker')
@Controller()
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'Service is healthy',
    schema: {
      type: 'string',
      example: 'Hello from Worker Service!',
    },
  })
  @Public()
  @Get()
  getHello(): string {
    return this.workerService.getHello();
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

  // Job Management Endpoints

  @ApiOperation({ summary: 'Create an email job' })
  @ApiResponse({
    status: 201,
    description: 'Email job created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'send-email' },
        status: { type: 'string', example: 'pending' },
        priority: { type: 'number', example: 10 },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBearerAuth()
  @Post('jobs/email')
  async createEmailJob(@Body() dto: CreateEmailJobDto) {
    return this.workerService.sendEmail(dto);
  }

  @ApiOperation({ summary: 'Create a report generation job' })
  @ApiResponse({
    status: 201,
    description: 'Report generation job created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'generate-report' },
        status: { type: 'string', example: 'pending' },
        priority: { type: 'number', example: 5 },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBearerAuth()
  @Post('jobs/report')
  async createReportJob(@Body() dto: CreateReportJobDto) {
    return this.workerService.generateReport(dto);
  }

  @ApiOperation({ summary: 'Create a data import job' })
  @ApiResponse({
    status: 201,
    description: 'Data import job created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'import-data' },
        status: { type: 'string', example: 'pending' },
        priority: { type: 'number', example: 5 },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBearerAuth()
  @Post('jobs/import')
  async createImportJob(@Body() dto: CreateImportJobDto) {
    return this.workerService.importData(dto);
  }

  @ApiOperation({ summary: 'Get all jobs' })
  @ApiOkResponse({
    description: 'List of all jobs',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          status: { type: 'string' },
          priority: { type: 'number' },
          progress: { type: 'number' },
          attempts: { type: 'number' },
          maxAttempts: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiBearerAuth()
  @Get('jobs')
  async getAllJobs() {
    return this.workerService.getAllJobs();
  }

  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiOkResponse({
    description: 'Queue statistics',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 100 },
        pending: { type: 'number', example: 10 },
        processing: { type: 'number', example: 5 },
        completed: { type: 'number', example: 70 },
        failed: { type: 'number', example: 10 },
        cancelled: { type: 'number', example: 3 },
        retry: { type: 'number', example: 2 },
        tasks: { type: 'number', example: 3 },
      },
    },
  })
  @ApiBearerAuth()
  @Get('jobs/stats')
  async getQueueStats() {
    return this.workerService.getQueueStats();
  }

  @ApiOperation({ summary: 'Get a specific job by ID' })
  @ApiOkResponse({
    description: 'Job details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        status: { type: 'string' },
        priority: { type: 'number' },
        progress: { type: 'number' },
        attempts: { type: 'number' },
        maxAttempts: { type: 'number' },
        result: { type: 'object' },
        error: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        startedAt: { type: 'string', format: 'date-time' },
        completedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiBearerAuth()
  @Get('jobs/:id')
  async getJob(@Param('id') id: string) {
    const job = this.workerService.getJob(id);
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  @ApiOperation({ summary: 'Cancel a job' })
  @ApiResponse({
    status: 200,
    description: 'Job cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Job cancelled successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found or cannot be cancelled',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Job not found or cannot be cancelled' },
      },
    },
  })
  @ApiBearerAuth()
  @Delete('jobs/:id')
  @HttpCode(HttpStatus.OK)
  async cancelJob(@Param('id') id: string) {
    const success = await this.workerService.cancelJob(id);
    if (!success) {
      return {
        success: false,
        message: 'Job not found or cannot be cancelled (may be currently processing)',
      };
    }
    return {
      success: true,
      message: 'Job cancelled successfully',
    };
  }
}
