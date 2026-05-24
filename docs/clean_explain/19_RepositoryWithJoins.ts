// src/infrastructure/database/repositories/PostgresUserRepository.ts
// Implementation - Xử lý JOIN queries, eager/lazy loading

import { PrismaClient } from '@prisma/client';
import { User } from '@/domain/entities/User';
import { Role } from '@/domain/entities/Role';
import { Address } from '@/domain/entities/Address';
import { Session } from '@/domain/entities/Session';
import { IUserRepository } from '@/domain/repositories/IUserRepository';

export interface UserWithRelations {
  user: User;
  roles?: Role[];
  addresses?: Address[];
  sessions?: Session[];
}

export class PostgresUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  // Basic queries - Không load relations
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  // Find with explicit relations - Load what you need
  async findByIdWithRoles(id: string): Promise<UserWithRelations | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    if (!raw) return null;

    const user = this.toDomainEntity(raw);
    const roles = raw.roles.map(
      (r: any) => new Role(r.id, r.name, r.description)
    );

    return { user, roles };
  }

  // Find with all relations - Full profile
  async findByIdWithAllRelations(
    id: string
  ): Promise<UserWithRelations | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            permissions: {
              select: { id: true, name: true, resource: true, action: true },
            },
          },
        },
        addresses: true,
        sessions: {
          where: {
            expiresAt: { gt: new Date() }, // Only active sessions
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!raw) return null;

    const user = this.toDomainEntity(raw);

    const roles = raw.roles.map(
      (r: any) =>
        new Role(
          r.id,
          r.name,
          r.description,
          r.permissions.map((p: any) => p.id)
        )
    );

    const addresses = raw.addresses.map(
      (a: any) =>
        new Address(
          a.id,
          a.userId,
          a.street,
          a.city,
          a.country,
          a.postalCode,
          a.isPrimary,
          a.createdAt
        )
    );

    const sessions = raw.sessions.map(
      (s: any) =>
        new Session(
          s.id,
          s.userId,
          s.token,
          s.expiresAt,
          s.ipAddress,
          s.userAgent,
          s.createdAt
        )
    );

    return { user, roles, addresses, sessions };
  }

  // Find with custom projection - Select specific relations
  async findByIdWithProjection(
    id: string,
    options: {
      includeRoles?: boolean;
      includeAddresses?: boolean;
      includeSessions?: boolean;
    }
  ): Promise<UserWithRelations | null> {
    const includeObject: any = {};

    if (options.includeRoles) {
      includeObject.roles = {
        select: { id: true, name: true, description: true },
      };
    }

    if (options.includeAddresses) {
      includeObject.addresses = true;
    }

    if (options.includeSessions) {
      includeObject.sessions = {
        where: { expiresAt: { gt: new Date() } },
      };
    }

    const raw = await this.prisma.user.findUnique({
      where: { id },
      include: includeObject,
    });

    if (!raw) return null;

    const user = this.toDomainEntity(raw);
    const roles = raw.roles?.map(
      (r: any) => new Role(r.id, r.name, r.description)
    );
    const addresses = raw.addresses?.map(
      (a: any) =>
        new Address(
          a.id,
          a.userId,
          a.street,
          a.city,
          a.country,
          a.postalCode,
          a.isPrimary,
          a.createdAt
        )
    );
    const sessions = raw.sessions?.map(
      (s: any) =>
        new Session(
          s.id,
          s.userId,
          s.token,
          s.expiresAt,
          s.ipAddress,
          s.userAgent,
          s.createdAt
        )
    );

    return { user, roles, addresses, sessions };
  }

  // Find multiple users with relations
  async findAllWithRoles(
    limit: number = 10,
    offset: number = 0
  ): Promise<UserWithRelations[]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        roles: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    return users.map((raw: any) => {
      const user = this.toDomainEntity(raw);
      const roles = raw.roles.map(
        (r: any) => new Role(r.id, r.name, r.description)
      );
      return { user, roles };
    });
  }

  // Query with filtering - lấy users có role cụ thể
  async findByRole(roleId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        roles: {
          some: { id: roleId },
        },
      },
    });

    return users.map((user) => this.toDomainEntity(user));
  }

  // Query with deep filtering - lấy users có permission cụ thể
  async findByPermission(permissionId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            permissions: {
              some: { id: permissionId },
            },
          },
        },
      },
    });

    return users.map((user) => this.toDomainEntity(user));
  }

  // Lazy loading - Load relations separately
  async findByIdWithLazyLoading(id: string): Promise<User | null> {
    // Only load user
    const user = await this.findById(id);
    if (!user) return null;

    // Load relations separately when needed
    // Usage: const roles = await repository.loadRoles(user.id);
    return user;
  }

  async loadRoles(userId: string): Promise<Role[]> {
    const raw = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: true,
      },
    });

    if (!raw) return [];

    return raw.roles.map(
      (r: any) => new Role(r.id, r.name, r.description)
    );
  }

  async loadAddresses(userId: string): Promise<Address[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: { isPrimary: 'desc' },
    });

    return addresses.map(
      (a) =>
        new Address(
          a.id,
          a.userId,
          a.street,
          a.city,
          a.country,
          a.postalCode,
          a.isPrimary,
          a.createdAt
        )
    );
  }

  async loadSessions(userId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map(
      (s) =>
        new Session(
          s.id,
          s.userId,
          s.token,
          s.expiresAt,
          s.ipAddress,
          s.userAgent,
          s.createdAt
        )
    );
  }

  // Basic operations
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toDomainEntity(user));
  }

  async save(user: User): Promise<User> {
    const saved = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive,
      },
    });

    return this.toDomainEntity(saved);
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        updatedAt: new Date(),
        isActive: user.isActive,
      },
    });

    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async existsById(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  private toDomainEntity(raw: any): User {
    return new User(
      raw.id,
      raw.email,
      raw.name,
      raw.password,
      raw.createdAt,
      raw.updatedAt,
      raw.isActive,
      raw.roleIds || [],
      raw.addressIds || []
    );
  }
}
