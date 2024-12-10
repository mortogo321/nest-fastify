import { Exclude, Transform } from 'class-transformer';
import { format } from 'date-fns';
import { Role } from '..';

export class User {
  id: string;
  email: string;

  @Exclude()
  hashedPassword: string;

  roles: Role[];

  @Transform(({ value }) => format(value, 'yyyy-MM-dd HH:mm:ss OOOO'))
  createdAt: string;

  @Transform(({ value }) => format(value, 'yyyy-MM-dd HH:mm:ss OOOO'))
  updatedAt: string;
}
