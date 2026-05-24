// src/domain/repositories/IUserRepository.ts
import { User } from '../entities/User';

export interface IUserRepository {
  // Basic queries
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

// src/domain/repositories/IRoleRepository.ts
import { Role } from '../entities/Role';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByIds(ids: string[]): Promise<Role[]>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<Role>;
  delete(id: string): Promise<boolean>;
}

// src/domain/repositories/IPermissionRepository.ts
import { Permission } from '../entities/Permission';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByIds(ids: string[]): Promise<Permission[]>;
  findAll(): Promise<Permission[]>;
  findByResourceAndAction(
    resource: string,
    action: string
  ): Promise<Permission | null>;
  save(permission: Permission): Promise<Permission>;
  delete(id: string): Promise<boolean>;
}

// src/domain/repositories/IAddressRepository.ts
import { Address } from '../entities/Address';

export interface IAddressRepository {
  findById(id: string): Promise<Address | null>;
  findByIds(ids: string[]): Promise<Address[]>;
  findByUserId(userId: string): Promise<Address[]>;
  save(address: Address): Promise<Address>;
  update(address: Address): Promise<Address>;
  delete(id: string): Promise<boolean>;
}

// src/domain/repositories/ISessionRepository.ts
import { Session } from '../entities/Session';

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByToken(token: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  findActiveByUserId(userId: string): Promise<Session[]>;
  save(session: Session): Promise<Session>;
  delete(id: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<number>;
}
