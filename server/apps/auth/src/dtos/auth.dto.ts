import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    example: 'demo@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(4, 20, { message: 'Password has to be at between 4 and 20 chars' })
  password: string;
}
