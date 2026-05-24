// src/application/usecases/user/GetUserByIdUseCase.ts
// Flexible use case - Return different DTOs based on parameters

import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IRoleRepository } from '@/domain/repositories/IRoleRepository';
import { IPermissionRepository } from '@/domain/repositories/IPermissionRepository';
import { IAddressRepository } from '@/domain/repositories/IAddressRepository';
import { ISessionRepository } from '@/domain/repositories/ISessionRepository';
import { UserMapper } from '@/application/mappers/UserMapper';
import {
  UserResponseDTO,
  UserWithRolesDTO,
  UserWithRolesAndPermissionsDTO,
  UserFullProfileDTO,
  UserProjectionDTO,
} from '@/application/dtos';

export enum UserLoadLevel {
  BASIC = 'basic', // Chỉ user info
  WITH_ROLES = 'with_roles', // User + roles
  WITH_PERMISSIONS = 'with_permissions', // User + roles + permissions
  FULL = 'full', // User + roles + permissions + addresses + sessions
}

export class GetUserByIdUseCase {
  constructor(
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository,
    private permissionRepository: IPermissionRepository,
    private addressRepository: IAddressRepository,
    private sessionRepository: ISessionRepository
  ) {}

  // Flexible execute method - return based on loadLevel
  async execute(
    userId: string,
    loadLevel: UserLoadLevel = UserLoadLevel.BASIC
  ): Promise<
    | UserResponseDTO
    | UserWithRolesDTO
    | UserWithRolesAndPermissionsDTO
    | UserFullProfileDTO
  > {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    switch (loadLevel) {
      case UserLoadLevel.BASIC:
        return this.toBasicDTO(user);

      case UserLoadLevel.WITH_ROLES:
        return await this.toUserWithRolesDTO(user);

      case UserLoadLevel.WITH_PERMISSIONS:
        return await this.toUserWithPermissionsDTO(user);

      case UserLoadLevel.FULL:
        return await this.toFullProfileDTO(user);

      default:
        return this.toBasicDTO(user);
    }
  }

  // Specific methods for each load level
  private toBasicDTO(user): UserResponseDTO {
    return UserMapper.toResponseDTO(user);
  }

  private async toUserWithRolesDTO(user) {
    // Load roles by IDs
    const roles = await this.roleRepository.findByIds(user.roleIds);
    return UserMapper.toUserWithRolesDTO(user, roles);
  }

  private async toUserWithPermissionsDTO(user) {
    // Load roles
    const roles = await this.roleRepository.findByIds(user.roleIds);

    // Load permissions for each role
    const permissionsByRoleId = new Map();
    for (const role of roles) {
      const permissions = await this.permissionRepository.findByIds(
        role.permissionIds
      );
      permissionsByRoleId.set(role.id, permissions);
    }

    return UserMapper.toUserWithRolesAndPermissionsDTO(
      user,
      roles,
      permissionsByRoleId
    );
  }

  private async toFullProfileDTO(user) {
    // Load everything in parallel
    const [roles, addresses, sessions] = await Promise.all([
      this.roleRepository.findByIds(user.roleIds),
      this.addressRepository.findByUserId(user.id),
      this.sessionRepository.findActiveByUserId(user.id),
    ]);

    // Load permissions for each role
    const permissionsByRoleId = new Map();
    for (const role of roles) {
      const permissions = await this.permissionRepository.findByIds(
        role.permissionIds
      );
      permissionsByRoleId.set(role.id, permissions);
    }

    return UserMapper.toFullProfileDTO(
      user,
      roles,
      permissionsByRoleId,
      addresses,
      sessions
    );
  }
}

// src/application/usecases/user/GetUserProfileUseCase.ts
// Specific use case for getting user with custom projection

import { UserMapper } from '@/application/mappers/UserMapper';

export interface UserProfileOptions {
  includeRoles?: boolean;
  includeAddresses?: boolean;
  includeSessions?: boolean;
  includePermissions?: boolean;
}

export class GetUserProfileUseCase {
  constructor(
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository,
    private permissionRepository: IPermissionRepository,
    private addressRepository: IAddressRepository,
    private sessionRepository: ISessionRepository
  ) {}

  // Execute with options - Load only what's requested
  async execute(
    userId: string,
    options: UserProfileOptions
  ): Promise<UserProjectionDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Load only requested relations
    let roles = undefined;
    let addresses = undefined;
    let sessions = undefined;
    let permissionsByRoleId = undefined;

    if (options.includeRoles) {
      roles = await this.roleRepository.findByIds(user.roleIds);

      if (options.includePermissions) {
        permissionsByRoleId = new Map();
        for (const role of roles) {
          const permissions = await this.permissionRepository.findByIds(
            role.permissionIds
          );
          permissionsByRoleId.set(role.id, permissions);
        }
      }
    }

    if (options.includeAddresses) {
      addresses = await this.addressRepository.findByUserId(user.id);
    }

    if (options.includeSessions) {
      sessions = await this.sessionRepository.findActiveByUserId(user.id);
    }

    return UserMapper.toProjectionDTO(
      user,
      roles,
      addresses,
      sessions,
      permissionsByRoleId
    );
  }
}

// src/application/usecases/user/ListUsersWithRolesUseCase.ts
// List users with their roles (for user management page)

export class ListUsersWithRolesUseCase {
  constructor(
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository
  ) {}

  async execute(
    limit: number = 10,
    offset: number = 0
  ): Promise<UserWithRolesDTO[]> {
    // Get users with roles (nếu repository support)
    // const usersWithRoles = await this.userRepository.findAllWithRoles(limit, offset);

    // Or: Get users separately, then load roles
    const users = await this.userRepository.findAll(limit, offset);

    // Load roles for all users in parallel
    const results = await Promise.all(
      users.map(async (user) => {
        const roles = await this.roleRepository.findByIds(user.roleIds);
        return UserMapper.toUserWithRolesDTO(user, roles);
      })
    );

    return results;
  }
}

// src/application/usecases/user/SearchUsersByPermissionUseCase.ts
// Search users that have specific permission

export class SearchUsersByPermissionUseCase {
  constructor(
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository,
    private permissionRepository: IPermissionRepository
  ) {}

  async execute(
    resource: string,
    action: string
  ): Promise<UserWithRolesDTO[]> {
    // Find permission by resource + action
    const permission =
      await this.permissionRepository.findByResourceAndAction(resource, action);

    if (!permission) {
      return [];
    }

    // Find users with this permission
    const users = await this.userRepository.findByPermission(permission.id);

    // Load roles for each user
    const results = await Promise.all(
      users.map(async (user) => {
        const roles = await this.roleRepository.findByIds(user.roleIds);
        return UserMapper.toUserWithRolesDTO(user, roles);
      })
    );

    return results;
  }
}
