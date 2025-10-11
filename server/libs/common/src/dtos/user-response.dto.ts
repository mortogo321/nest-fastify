import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class RoleResponseDto {
  @ApiProperty({ description: 'Role ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Role name', example: 'admin' })
  @Expose()
  name!: string;

  @ApiProperty({ description: 'Role description', example: 'Administrator role' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Creation date', example: '2024-01-01T00:00:00Z' })
  @Expose()
  createdAt!: Date;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  @Expose()
  email!: string;

  @ApiProperty({ description: 'Account active status', example: true })
  @Expose()
  isActive!: boolean;

  @ApiProperty({ description: 'Email verification status', example: false })
  @Expose()
  isVerified!: boolean;

  @ApiProperty({ description: 'User roles', type: [RoleResponseDto] })
  @Expose()
  @Type(() => RoleResponseDto)
  roles?: RoleResponseDto[];

  @ApiProperty({ description: 'Creation date', example: '2024-01-01T00:00:00Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date', example: '2024-01-01T00:00:00Z' })
  @Expose()
  updatedAt!: Date;

  @Exclude()
  hashedPassword?: string;

  @Exclude()
  refreshTokens?: any[];
}
