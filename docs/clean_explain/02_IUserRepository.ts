// src/domain/repositories/IUserRepository.ts
// Repository Interface - Abstraction, không biết cách lưu dữ liệu

import { User } from '../entities/User';

export interface IUserRepository {
  // Queries
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(limit?: number, offset?: number): Promise<User[]>;

  // Commands
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;

  // Check exists
  existsById(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}
