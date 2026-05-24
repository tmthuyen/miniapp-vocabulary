// src/application/dtos/CreateUserDTO.ts
// Input DTO - Từ API request

export class CreateUserDTO {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly password: string
  ) {}
}

// src/application/dtos/UserResponseDTO.ts
// Output DTO - Trả về API response (không chứa password)

export class UserResponseDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly isActive: boolean
  ) {}
}
