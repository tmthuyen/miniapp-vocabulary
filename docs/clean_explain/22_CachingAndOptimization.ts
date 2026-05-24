// src/infrastructure/cache/CachedUserRepository.ts
// Decorator pattern - Wrap repository with cache

import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { ICacheService } from '@/application/interfaces/ICacheService';
import { User } from '@/domain/entities/User';

export class CachedUserRepository implements IUserRepository {
  private cacheKeyPrefix = 'user:';
  private cacheTTL = 3600; // 1 hour

  constructor(
    private innerRepository: IUserRepository,
    private cache: ICacheService
  ) {}

  async findById(id: string): Promise<User | null> {
    const cacheKey = `${this.cacheKeyPrefix}${id}`;

    // Try cache first
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) return cached;

    // Get from database
    const user = await this.innerRepository.findById(id);

    // Cache result
    if (user) {
      await this.cache.set(cacheKey, user, this.cacheTTL);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `${this.cacheKeyPrefix}email:${email}`;

    const cached = await this.cache.get<User>(cacheKey);
    if (cached) return cached;

    const user = await this.innerRepository.findByEmail(email);

    if (user) {
      await this.cache.set(cacheKey, user, this.cacheTTL);
    }

    return user;
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    const cacheKey = `${this.cacheKeyPrefix}all:${limit}:${offset}`;

    const cached = await this.cache.get<User[]>(cacheKey);
    if (cached) return cached;

    const users = await this.innerRepository.findAll(limit, offset);
    await this.cache.set(cacheKey, users, this.cacheTTL);

    return users;
  }

  async save(user: User): Promise<User> {
    // Invalidate cache
    await this.invalidateUserCache(user.id);

    const saved = await this.innerRepository.save(user);

    return saved;
  }

  async update(user: User): Promise<User> {
    // Invalidate cache
    await this.invalidateUserCache(user.id, user.email);

    const updated = await this.innerRepository.update(user);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    // Get email before deletion
    const user = await this.innerRepository.findById(id);

    // Invalidate cache
    await this.invalidateUserCache(id, user?.email);

    return this.innerRepository.delete(id);
  }

  async existsById(id: string): Promise<boolean> {
    return this.innerRepository.existsById(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.innerRepository.existsByEmail(email);
  }

  private async invalidateUserCache(id: string, email?: string): Promise<void> {
    await this.cache.delete(`${this.cacheKeyPrefix}${id}`);
    if (email) {
      await this.cache.delete(`${this.cacheKeyPrefix}email:${email}`);
    }
    // Invalidate list cache
    await this.cache.delete(`${this.cacheKeyPrefix}all:*`);
  }
}

// src/application/usecases/user/GetUserWithCacheUseCase.ts
// Use case sử dụng caching - Tránh multiple loads của cùng một data

import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IRoleRepository } from '@/domain/repositories/IRoleRepository';
import { ICacheService } from '@/application/interfaces/ICacheService';
import { UserMapper } from '@/application/mappers/UserMapper';
import { UserFullProfileDTO } from '@/application/dtos';

export class GetUserWithCacheUseCase {
  private profileCacheTTL = 3600; // 1 hour

  constructor(
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository,
    private cache: ICacheService
  ) {}

  async execute(userId: string): Promise<UserFullProfileDTO> {
    const cacheKey = `user:profile:${userId}`;

    // Try cache first
    const cached = await this.cache.get<UserFullProfileDTO>(cacheKey);
    if (cached) {
      console.log(`Cache HIT for user ${userId}`);
      return cached;
    }

    console.log(`Cache MISS for user ${userId}`);

    // Load from database
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const roles = await this.roleRepository.findByIds(user.roleIds);

    const profile = UserMapper.toFullProfileDTO(
      user,
      roles,
      new Map(), // permissionsByRoleId
      [], // addresses
      [] // sessions
    );

    // Cache result
    await this.cache.set(cacheKey, profile, this.profileCacheTTL);

    return profile;
  }

  // Invalidate cache when user changes
  async invalidateCache(userId: string): Promise<void> {
    await this.cache.delete(`user:profile:${userId}`);
  }
}

// src/infrastructure/database/OptimizedUserRepository.ts
// Optimized queries - Batch loading, selective fields

export class OptimizedUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  // N+1 problem solution: Batch load
  async findByIds(
    ids: string[]
  ): Promise<Map<string, User>> {
    if (ids.length === 0) return new Map();

    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });

    return new Map(users.map((u) => [u.id, this.toDomainEntity(u)]));
  }

  // Selective fields - không load password nếu không cần
  async findByIdWithoutPassword(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        roleIds: true,
        addressIds: true,
      },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.email,
      user.name,
      '', // Password không load
      user.createdAt,
      user.updatedAt,
      user.isActive,
      user.roleIds,
      user.addressIds
    );
  }

  // ... other methods
}

// src/infrastructure/database/DataLoaderUserRepository.ts
// DataLoader pattern - Batch queries automatically

import DataLoader from 'dataloader';

export class DataLoaderUserRepository {
  private userLoader: DataLoader<string, User | null>;
  private roleLoader: DataLoader<string, Role | null>;

  constructor(private prisma: PrismaClient) {
    // Batch load users
    this.userLoader = new DataLoader(async (userIds: readonly string[]) => {
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds as string[] } },
      });

      const userMap = new Map(
        users.map((u) => [u.id, this.toDomainEntity(u)])
      );

      return userIds.map((id) => userMap.get(id) || null);
    });

    // Batch load roles
    this.roleLoader = new DataLoader(async (roleIds: readonly string[]) => {
      const roles = await this.prisma.role.findMany({
        where: { id: { in: roleIds as string[] } },
      });

      const roleMap = new Map(
        roles.map((r) => [r.id, this.toDomainEntity(r)])
      );

      return roleIds.map((id) => roleMap.get(id) || null);
    });
  }

  // Use DataLoader - automatic batching
  async getUserById(id: string): Promise<User | null> {
    return this.userLoader.load(id);
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.roleLoader.load(id);
  }

  // Get multiple users - Automatically batched
  async getUsersByIds(ids: string[]): Promise<(User | null)[]> {
    return Promise.all(ids.map((id) => this.getUserById(id)));
  }
}

// Usage in GraphQL/API resolver context
// const userRepository = new DataLoaderUserRepository(prisma);
// const users = await userRepository.getUsersByIds([id1, id2, id3, ...id100]);
// // Instead of 100 queries, only 1 batched query
