import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    example: 'demo@example.com',
    description: 'User email address',
    required: true,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  readonly email!: string;

  @ApiProperty({
    description:
      'User password (min 8 chars, must include uppercase, lowercase, number, and special character)',
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
}
