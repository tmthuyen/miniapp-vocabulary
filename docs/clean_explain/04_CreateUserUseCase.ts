// src/application/usecases/user/CreateUserUseCase.ts
// Use case - Orchestrate domain logic + infrastructure services

import { User } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IEventBus } from '@/application/interfaces/IEventBus';
import { IEmailService } from '@/application/interfaces/IEmailService';
import { CreateUserDTO } from '@/application/dtos/CreateUserDTO';
import { UserResponseDTO } from '@/application/dtos/UserResponseDTO';
import { UserMapper } from '@/application/mappers/UserMapper';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private eventBus: IEventBus,
    private emailService: IEmailService
  ) {}

  async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user entity (with domain rules validation)
    const user = User.create(
      uuidv4(),
      dto.email,
      dto.name,
      hashedPassword
    );

    // Save to database
    const savedUser = await this.userRepository.save(user);

    // Emit event - Other services can react to this
    await this.eventBus.emit({
      type: 'USER_CREATED',
      payload: {
        userId: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        createdAt: savedUser.createdAt,
      },
    });

    // Send welcome email asynchronously
    // Can be done via queue or direct call depending on design
    await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.name);

    // Return DTO (not the entity itself)
    return UserMapper.toResponseDTO(savedUser);
  }
}
