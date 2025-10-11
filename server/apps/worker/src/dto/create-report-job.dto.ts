import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ReportType {
  SALES = 'sales',
  USERS = 'users',
  ANALYTICS = 'analytics',
}

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EXCEL = 'excel',
}

export class CreateReportJobDto {
  @ApiProperty({
    description: 'Type of report to generate',
    enum: ReportType,
    example: ReportType.SALES,
  })
  @IsEnum(ReportType)
  @IsNotEmpty()
  reportType: ReportType;

  @ApiProperty({
    description: 'Report start date',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Report end date',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'Output format',
    enum: ReportFormat,
    example: ReportFormat.PDF,
  })
  @IsEnum(ReportFormat)
  @IsNotEmpty()
  format: ReportFormat;

  @ApiProperty({
    description: 'User ID requesting the report',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
