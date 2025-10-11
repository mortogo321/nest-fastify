import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
    required: true,
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString()
  @IsUUID('4', { message: 'Invalid UUID format' })
  readonly id!: string;
}
