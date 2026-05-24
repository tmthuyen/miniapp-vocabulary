// src/application/mappers/UserMapper.ts
import { User } from '@/domain/entities/User';
import { Role } from '@/domain/entities/Role';
import { Permission } from '@/domain/entities/Permission';
import { Address } from '@/domain/entities/Address';
import { Session } from '@/domain/entities/Session';
import {
  UserResponseDTO,
  UserWithRolesDTO,
  UserWithRolesAndPermissionsDTO,
  UserFullProfileDTO,
  RoleBasicDTO,
  RoleWithPermissionsDTO,
  AddressDTO,
  PermissionDTO,
  SessionDTO,
  UserProjectionDTO,
} from '@/application/dtos';

export class UserMapper {
  // Map to basic DTO - chỉ user info
  static toResponseDTO(user: User): UserResponseDTO {
    return new UserResponseDTO(
      user.id,
      user.email,
      user.name,
      user.createdAt,
      user.isActive
    );
  }

  // Map to DTO with roles
  static toUserWithRolesDTO(
    user: User,
    roles: Role[]
  ): UserWithRolesDTO {
    const roleDTOs = roles.map((role) =>
      new RoleBasicDTO(role.id, role.name, role.description)
    );

    return new UserWithRolesDTO(
      user.id,
      user.email,
      user.name,
      roleDTOs,
      user.createdAt
    );
  }

  // Map to DTO with roles + permissions (nested)
  static toUserWithRolesAndPermissionsDTO(
    user: User,
    roles: Role[],
    permissionsByRoleId: Map<string, Permission[]>
  ): UserWithRolesAndPermissionsDTO {
    const rolesWithPermissions = roles.map((role) => {
      const permissions = permissionsByRoleId.get(role.id) || [];
      const permissionDTOs = permissions.map(
        (p) => new PermissionDTO(p.id, p.name, p.resource, p.action)
      );

      return new RoleWithPermissionsDTO(
        role.id,
        role.name,
        role.description,
        permissionDTOs
      );
    });

    return new UserWithRolesAndPermissionsDTO(
      user.id,
      user.email,
      user.name,
      rolesWithPermissions,
      user.createdAt
    );
  }

  // Map to full profile DTO - ALL data
  static toFullProfileDTO(
    user: User,
    roles: Role[],
    permissionsByRoleId: Map<string, Permission[]>,
    addresses: Address[],
    sessions: Session[]
  ): UserFullProfileDTO {
    // Build roles with permissions
    const rolesWithPermissions = roles.map((role) => {
      const permissions = permissionsByRoleId.get(role.id) || [];
      const permissionDTOs = permissions.map(
        (p) => new PermissionDTO(p.id, p.name, p.resource, p.action)
      );

      return new RoleWithPermissionsDTO(
        role.id,
        role.name,
        role.description,
        permissionDTOs
      );
    });

    // Build addresses
    const addressDTOs = addresses.map(
      (a) =>
        new AddressDTO(
          a.id,
          a.street,
          a.city,
          a.country,
          a.postalCode,
          a.isPrimary
        )
    );

    // Build sessions (không trả token full string, chỉ một phần)
    const sessionDTOs = sessions
      .filter((s) => !s.isExpired())
      .map(
        (s) =>
          new SessionDTO(
            s.id,
            s.token.substring(0, 20) + '...',
            s.expiresAt,
            s.ipAddress,
            s.createdAt
          )
      );

    const primaryAddress = addressDTOs.find((a) => a.isPrimary);

    return new UserFullProfileDTO(
      user.id,
      user.email,
      user.name,
      user.isActive,
      user.createdAt,
      user.updatedAt,
      rolesWithPermissions,
      addressDTOs,
      sessionDTOs,
      primaryAddress
    );
  }

  // Map to custom projection - flexible fields
  static toProjectionDTO(
    user: User,
    roles?: Role[],
    addresses?: Address[],
    sessions?: Session[],
    permissionsByRoleId?: Map<string, Permission[]>
  ): UserProjectionDTO {
    let rolesDTOs: RoleBasicDTO[] | undefined;
    let addressDTOs: AddressDTO[] | undefined;
    let sessionDTOs: SessionDTO[] | undefined;
    let permissionDTOs: PermissionDTO[] | undefined;

    if (roles && roles.length > 0) {
      rolesDTOs = roles.map(
        (r) => new RoleBasicDTO(r.id, r.name, r.description)
      );

      // Extract all permissions from roles
      const allPermissions = new Map<string, Permission>();
      roles.forEach((role) => {
        const rolePermissions = permissionsByRoleId?.get(role.id) || [];
        rolePermissions.forEach((p) => {
          allPermissions.set(p.id, p);
        });
      });
      permissionDTOs = Array.from(allPermissions.values()).map(
        (p) => new PermissionDTO(p.id, p.name, p.resource, p.action)
      );
    }

    if (addresses && addresses.length > 0) {
      addressDTOs = addresses.map(
        (a) =>
          new AddressDTO(
            a.id,
            a.street,
            a.city,
            a.country,
            a.postalCode,
            a.isPrimary
          )
      );
    }

    if (sessions && sessions.length > 0) {
      sessionDTOs = sessions
        .filter((s) => !s.isExpired())
        .map(
          (s) =>
            new SessionDTO(
              s.id,
              s.token.substring(0, 20) + '...',
              s.expiresAt,
              s.ipAddress,
              s.createdAt
            )
        );
    }

    return new UserProjectionDTO(
      user.id,
      user.email,
      user.name,
      rolesDTOs,
      addressDTOs,
      sessionDTOs,
      permissionDTOs
    );
  }
}
