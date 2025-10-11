import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export enum ImportType {
  USERS = 'users',
  PRODUCTS = 'products',
  ORDERS = 'orders',
}

export class CreateImportJobDto {
  @ApiProperty({
    description: 'URL of the file to import',
    example: 'https://storage.example.com/imports/users.csv',
  })
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    description: 'Type of data to import',
    enum: ImportType,
    example: ImportType.USERS,
  })
  @IsEnum(ImportType)
  @IsNotEmpty()
  type: ImportType;

  @ApiProperty({
    description: 'User ID initiating the import',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
