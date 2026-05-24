// src/application/dtos/UserResponseDTO.ts
// Basic user info - Không chứa related data

export class UserResponseDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly isActive: boolean
  ) {}
}

// src/application/dtos/UserWithRolesDTO.ts
// User + roles information

export class RoleBasicDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string
  ) {}
}

export class UserWithRolesDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly roles: RoleBasicDTO[],
    public readonly createdAt: Date
  ) {}
}

// src/application/dtos/UserWithRolesAndPermissionsDTO.ts
// User + roles + permissions (deep nested)

export class PermissionDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly resource: string,
    public readonly action: string
  ) {}
}

export class RoleWithPermissionsDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly permissions: PermissionDTO[]
  ) {}
}

export class UserWithRolesAndPermissionsDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly roles: RoleWithPermissionsDTO[],
    public readonly createdAt: Date
  ) {}
}

// src/application/dtos/UserFullProfileDTO.ts
// Complete user profile with ALL related data
// Cần cẩn thận với caching, performance

export class AddressDTO {
  constructor(
    public readonly id: string,
    public readonly street: string,
    public readonly city: string,
    public readonly country: string,
    public readonly postalCode: string,
    public readonly isPrimary: boolean
  ) {}
}

export class SessionDTO {
  constructor(
    public readonly id: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly ipAddress?: string,
    public readonly createdAt?: Date
  ) {}
}

export class UserFullProfileDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly roles: RoleWithPermissionsDTO[],
    public readonly addresses: AddressDTO[],
    public readonly sessions: SessionDTO[],
    public readonly primaryAddress?: AddressDTO
  ) {}
}

// src/application/dtos/UserProjectionDTO.ts
// Custom projection - Lấy exact fields needed (GraphQL-like)

export class UserProjectionDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    // Optional fields - chỉ lấy nếu request
    public readonly roles?: RoleBasicDTO[],
    public readonly addresses?: AddressDTO[],
    public readonly sessions?: SessionDTO[],
    public readonly permissions?: PermissionDTO[]
  ) {}
}
