import { status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { type Observable, Subject } from 'rxjs';
import type { UsersService } from './users.service';

/**
 * gRPC Controller for Users Service
 * Handles user management operations via gRPC
 */
@Controller()
export class UsersGrpcController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user
   */
  @GrpcMethod('UsersService', 'CreateUser')
  async createUser(data: { email: string; password: string }) {
    try {
      const user = await this.usersService.create({
        email: data.email,
        password: data.password,
      });

      const userWithFields = user as any;
      return {
        id: user.id,
        email: user.email,
        isActive: userWithFields.isActive ?? true,
        isVerified: userWithFields.isVerified ?? false,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Failed to create user',
      });
    }
  }

  /**
   * Find all users with pagination
   */
  @GrpcMethod('UsersService', 'FindAllUsers')
  async findAllUsers(data: { page?: number; limit?: number }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.usersService.findAll(skip, limit),
        this.usersService.count(),
      ]);

      return {
        users: users.map((user) => {
          const userWithFields = user as any;
          return {
            id: user.id,
            email: user.email,
            isActive: userWithFields.isActive ?? true,
            isVerified: userWithFields.isVerified ?? false,
            createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
          };
        }),
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
      });
    }
  }

  /**
   * Find one user by ID
   */
  @GrpcMethod('UsersService', 'FindOneUser')
  async findOneUser(data: { id: string }) {
    try {
      const user = await this.usersService.findOne(data.id);

      if (!user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const userWithFields = user as any;
      return {
        id: user.id,
        email: user.email,
        isActive: userWithFields.isActive ?? true,
        isVerified: userWithFields.isVerified ?? false,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
      });
    }
  }

  /**
   * Update a user
   */
  @GrpcMethod('UsersService', 'UpdateUser')
  async updateUser(data: { id: string; email?: string; isActive?: boolean; isVerified?: boolean }) {
    try {
      const user = await this.usersService.update(data.id, {
        email: data.email,
      } as any);

      const userWithFields = user as any;
      return {
        id: user.id,
        email: user.email,
        isActive: userWithFields.isActive ?? true,
        isVerified: userWithFields.isVerified ?? false,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  }

  /**
   * Remove a user
   */
  @GrpcMethod('UsersService', 'RemoveUser')
  async removeUser(data: { id: string }) {
    try {
      const user = await this.usersService.remove(data.id);

      const userWithFields = user as any;
      return {
        id: user.id,
        email: user.email,
        isActive: userWithFields.isActive ?? true,
        isVerified: userWithFields.isVerified ?? false,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Failed to remove user',
      });
    }
  }

  /**
   * Query users with streaming (bidirectional)
   */
  @GrpcMethod('UsersService', 'QueryUsers')
  queryUsers(data: Observable<{ page: number; limit: number }>) {
    const subject = new Subject();

    data.subscribe({
      next: async (pagination) => {
        try {
          const page = pagination.page || 1;
          const limit = pagination.limit || 10;
          const skip = (page - 1) * limit;

          const [users, total] = await Promise.all([
            this.usersService.findAll(skip, limit),
            this.usersService.count(),
          ]);

          subject.next({
            users: users.map((user) => {
              const userWithFields = user as any;
              return {
                id: user.id,
                email: user.email,
                isActive: userWithFields.isActive ?? true,
                isVerified: userWithFields.isVerified ?? false,
                createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
                updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
              };
            }),
            total,
            page,
            limit,
          });
        } catch (error) {
          subject.error(
            new RpcException({
              code: status.INTERNAL,
              message: error instanceof Error ? error.message : 'Failed to query users',
            }),
          );
        }
      },
      error: (error) => subject.error(error),
      complete: () => subject.complete(),
    });

    return subject.asObservable();
  }
}
