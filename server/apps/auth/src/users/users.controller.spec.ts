import type { PrismaService } from '@app/common';
import { describe, expect, it, vi } from 'vitest';
import type { CreateUserDto } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  it('should be defined', () => {
    const controller = new UsersController(new UsersService({} as PrismaService));
    expect(controller).toBeDefined();
  });

  it('should delegate user creation to the service', async () => {
    const dto = { email: 'user@example.com', password: 'secret' } as CreateUserDto;
    const created = { id: '1', email: dto.email };
    const service = { create: vi.fn().mockResolvedValue(created) } as unknown as UsersService;
    const controller = new UsersController(service);

    await expect(controller.create(dto)).resolves.toBe(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
