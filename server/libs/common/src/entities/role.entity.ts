import { Transform } from 'class-transformer';
import { format } from 'date-fns';
import { User } from '..';

export class Role {
  id: string;
  name: string;
  description: string;

  @Transform(({ value }) => format(value, 'yyyy-MM-dd HH:mm:ss OOOO'))
  createdAt: string;

  @Transform(({ value }) => format(value, 'yyyy-MM-dd HH:mm:ss OOOO'))
  updatedAt: string;

  user?: User;
  userId?: string;
}
