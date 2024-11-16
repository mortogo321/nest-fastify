import { Exclude, Transform } from 'class-transformer';
import { format } from 'date-fns';

export class User {
  id: string;
  email: string;

  @Exclude()
  hashedPassword: string;

  @Transform(({ value }) => format(value, 'yyyy-MM-dd HH:mm:ss OOOO'))
  createdAt: string;

  @Transform(({ value }) => format(value, 'yyyy-MM-dd HH:mm:ss OOOO'))
  updatedAt: string;
}
