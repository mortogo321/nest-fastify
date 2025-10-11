import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Operation completed successfully' })
  message: string;

  @ApiProperty({ description: 'Timestamp', example: '2024-01-01T00:00:00Z' })
  timestamp: string;

  constructor(message: string) {
    this.success = true;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}

export class DataResponseDto<T> extends SuccessResponseDto {
  @ApiProperty({ description: 'Response data' })
  data: T;

  constructor(message: string, data: T) {
    super(message);
    this.data = data;
  }
}

export class PaginatedResponseDto<T> extends SuccessResponseDto {
  @ApiProperty({ description: 'Array of items' })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  constructor(
    message: string,
    data: T[],
    meta: {
      total: number;
      page: number;
      limit: number;
    },
  ) {
    super(message);
    this.data = data;
    this.meta = {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
      hasNextPage: meta.page < Math.ceil(meta.total / meta.limit),
      hasPreviousPage: meta.page > 1,
    };
  }
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Success status', example: false })
  success: boolean;

  @ApiProperty({ description: 'Error message', example: 'An error occurred' })
  message: string;

  @ApiProperty({ description: 'Error code', example: 'BAD_REQUEST' })
  error: string;

  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Timestamp', example: '2024-01-01T00:00:00Z' })
  timestamp: string;

  @ApiProperty({ description: 'Request path', example: '/api/users' })
  path?: string;

  @ApiProperty({ description: 'Validation errors', required: false })
  errors?: Array<{
    field: string;
    message: string;
  }>;

  constructor(message: string, error: string, statusCode: number, path?: string) {
    this.success = false;
    this.message = message;
    this.error = error;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}
