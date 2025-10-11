import { hash, type PrismaService } from '@app/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hash(createUserDto.password);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        hashedPassword,
      },
    });
  }

  async findAll(skip = 0, take = 10) {
    return this.prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    // Check if user exists
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async count() {
    return this.prisma.user.count();
  }
}
