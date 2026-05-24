// src/infrastructure/database/repositories/PostgresUserRepository.ts
// Concrete implementation - Phụ thuộc vào Prisma

import { PrismaClient } from '@prisma/client';
import { User } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';

export class PostgresUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toDomainEntity(user) : null;
  }

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
      raw.isActive
    );
  }
}
