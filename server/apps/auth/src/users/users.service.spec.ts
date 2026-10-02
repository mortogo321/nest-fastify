import type { PrismaService } from '@app/common';
import { describe, expect, it } from 'vitest';
import { UsersService } from './users.service';

describe('UsersService', () => {
  it('should be defined', () => {
    expect(new UsersService({} as PrismaService)).toBeDefined();
  });
});
