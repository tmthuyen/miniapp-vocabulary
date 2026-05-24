// src/domain/entities/User.ts
// Domain Entity - Pure business object, không phụ thuộc vào framework hay database

export class User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly password: string; // hashed
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isActive: boolean;

  constructor(
    id: string,
    email: string,
    name: string,
    password: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    isActive: boolean = true
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
  }

  // Domain rules
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  isPasswordStrong(): boolean {
    return this.password.length >= 8;
  }

  canBeDeleted(): boolean {
    return this.isActive;
  }

  // Static factory method
  static create(
    id: string,
    email: string,
    name: string,
    password: string
  ): User {
    const user = new User(id, email, name, password);

    if (!user.isEmailValid()) {
      throw new Error('Invalid email format');
    }

    if (!user.isPasswordStrong()) {
      throw new Error('Password must be at least 8 characters');
    }

    return user;
  }
}
