// src/domain/entities/User.ts
// Domain Entity - Pure business object, không phụ thuộc vào database schema

export class User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly password: string; // hashed
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isActive: boolean;
  
  // KHÔNG chứa references trực tiếp đến các entities khác!
  // Chỉ chứa IDs của các related entities
  readonly roleIds: string[];  // IDs, không phải Role objects
  readonly addressIds: string[];

  constructor(
    id: string,
    email: string,
    name: string,
    password: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    isActive: boolean = true,
    roleIds: string[] = [],
    addressIds: string[] = []
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
    this.roleIds = roleIds;
    this.addressIds = addressIds;
  }

  // Domain business rules
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  isPasswordStrong(): boolean {
    return this.password.length >= 8;
  }

  hasRole(roleId: string): boolean {
    return this.roleIds.includes(roleId);
  }

  addRole(roleId: string): void {
    if (!this.roleIds.includes(roleId)) {
      this.roleIds.push(roleId);
    }
  }

  removeRole(roleId: string): void {
    const index = this.roleIds.indexOf(roleId);
    if (index > -1) {
      this.roleIds.splice(index, 1);
    }
  }

  getPrimaryAddress(): string | undefined {
    return this.addressIds[0]; // First address is primary
  }

  static create(
    id: string,
    email: string,
    name: string,
    password: string,
    roleIds: string[] = []
  ): User {
    const user = new User(id, email, name, password, new Date(), new Date(), true, roleIds);

    if (!user.isEmailValid()) {
      throw new Error('Invalid email format');
    }

    if (!user.isPasswordStrong()) {
      throw new Error('Password must be at least 8 characters');
    }

    return user;
  }
}

// src/domain/entities/Role.ts
export class Role {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly permissionIds: string[]; // IDs, không phải Permission objects
  readonly createdAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    permissionIds: string[] = [],
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.permissionIds = permissionIds;
    this.createdAt = createdAt;
  }

  hasPermission(permissionId: string): boolean {
    return this.permissionIds.includes(permissionId);
  }
}

// src/domain/entities/Permission.ts
export class Permission {
  readonly id: string;
  readonly name: string;
  readonly resource: string; // e.g. "users", "posts", "admin"
  readonly action: string; // e.g. "create", "read", "update", "delete"
  readonly createdAt: Date;

  constructor(
    id: string,
    name: string,
    resource: string,
    action: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.resource = resource;
    this.action = action;
    this.createdAt = createdAt;
  }

  // Business rule: can user perform this action on resource?
  canPerform(requiredResource: string, requiredAction: string): boolean {
    return this.resource === requiredResource && this.action === requiredAction;
  }
}

// src/domain/entities/Address.ts
export class Address {
  readonly id: string;
  readonly userId: string;
  readonly street: string;
  readonly city: string;
  readonly country: string;
  readonly postalCode: string;
  readonly isPrimary: boolean;
  readonly createdAt: Date;

  constructor(
    id: string,
    userId: string,
    street: string,
    city: string,
    country: string,
    postalCode: string,
    isPrimary: boolean = false,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.street = street;
    this.city = city;
    this.country = country;
    this.postalCode = postalCode;
    this.isPrimary = isPrimary;
    this.createdAt = createdAt;
  }

  isValidPostalCode(): boolean {
    // Business rule: validation logic
    return this.postalCode.length > 0;
  }
}

// src/domain/entities/Session.ts
export class Session {
  readonly id: string;
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly createdAt: Date;

  constructor(
    id: string,
    userId: string,
    token: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.createdAt = createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired();
  }
}
