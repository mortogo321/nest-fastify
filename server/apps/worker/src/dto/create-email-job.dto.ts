import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmailJobDto {
  @ApiProperty({
    description: 'Email recipient address',
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
    example: 'Thank you for signing up!',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'Email sender address',
    example: 'noreply@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  from?: string;
}
