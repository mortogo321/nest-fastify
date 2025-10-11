import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: true,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  readonly email!: string;

  @ApiProperty({
    description: 'User password',
    required: true,
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  readonly password!: string;

  @ApiProperty({
    example: 'https://facebook.com/username',
    description: 'Facebook profile URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid Facebook URL format' })
  @MaxLength(255, { message: 'Facebook URL must not exceed 255 characters' })
  readonly facebookUri?: string;

  @ApiProperty({
    example: 'https://twitter.com/username',
    description: 'Twitter profile URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid Twitter URL format' })
  @MaxLength(255, { message: 'Twitter URL must not exceed 255 characters' })
  readonly twitterUri?: string;
}
