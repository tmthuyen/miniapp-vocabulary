// tests/unit/application/CreateUserUseCase.test.ts
import { CreateUserUseCase } from '@/application/usecases/user/CreateUserUseCase';
import { CreateUserDTO } from '@/application/dtos/CreateUserDTO';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IEventBus } from '@/application/interfaces/IEventBus';
import { IEmailService } from '@/application/interfaces/IEmailService';
import { User } from '@/domain/entities/User';
import { MockEmailService } from '@/infrastructure/email/SendgridEmailService';
import { EventBus } from '@/infrastructure/events/EventBus';

// Mock repository
class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async save(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async update(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  async existsById(id: string): Promise<boolean> {
    return !!this.users.find((u) => u.id === id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return !!this.users.find((u) => u.email === email);
  }
}

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockRepository: MockUserRepository;
  let mockEmailService: MockEmailService;
  let eventBus: EventBus;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    mockEmailService = new MockEmailService();
    eventBus = new EventBus();

    createUserUseCase = new CreateUserUseCase(
      mockRepository,
      eventBus,
      mockEmailService
    );
  });

  it('should create a user successfully', async () => {
    const dto = new CreateUserDTO(
      'test@example.com',
      'Test User',
      'password123'
    );

    const result = await createUserUseCase.execute(dto);

    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
    expect(result.id).toBeDefined();
  });

  it('should throw error if user already exists', async () => {
    const dto = new CreateUserDTO(
      'test@example.com',
      'Test User',
      'password123'
    );

    // First creation
    await createUserUseCase.execute(dto);

    // Second creation should fail
    await expect(createUserUseCase.execute(dto)).rejects.toThrow(
      'User with this email already exists'
    );
  });

  it('should send welcome email after user creation', async () => {
    const dto = new CreateUserDTO(
      'test@example.com',
      'Test User',
      'password123'
    );

    await createUserUseCase.execute(dto);

    const sentEmails = mockEmailService['sentEmails'];
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].type).toBe('welcome');
    expect(sentEmails[0].email).toBe('test@example.com');
  });

  it('should emit USER_CREATED event', async () => {
    const dto = new CreateUserDTO(
      'test@example.com',
      'Test User',
      'password123'
    );

    let emittedEvent: any = null;
    eventBus.subscribe('USER_CREATED', async (event) => {
      emittedEvent = event;
    });

    await createUserUseCase.execute(dto);

    // Wait for event processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(emittedEvent).toBeDefined();
    expect(emittedEvent.type).toBe('USER_CREATED');
    expect(emittedEvent.payload.email).toBe('test@example.com');
  });

  it('should not save user if password is weak', async () => {
    const dto = new CreateUserDTO(
      'test@example.com',
      'Test User',
      'weak' // Password too short
    );

    await expect(createUserUseCase.execute(dto)).rejects.toThrow(
      'Password must be at least 8 characters'
    );

    // User should not be saved
    const users = await mockRepository.findAll();
    expect(users).toHaveLength(0);
  });

  it('should not save user if email is invalid', async () => {
    const dto = new CreateUserDTO(
      'invalid-email',
      'Test User',
      'password123'
    );

    await expect(createUserUseCase.execute(dto)).rejects.toThrow(
      'Invalid email format'
    );

    // User should not be saved
    const users = await mockRepository.findAll();
    expect(users).toHaveLength(0);
  });
});

// tests/integration/CreateUserUseCase.integration.test.ts
// Integration test with real dependencies (only email is mocked)

describe('CreateUserUseCase Integration', () => {
  let createUserUseCase: CreateUserUseCase;
  let container: Container;

  beforeEach(() => {
    container = Container.getInstance();
    // Override email service with mock
    const mockEmailService = new MockEmailService();
    container.register('IEmailService', mockEmailService);

    createUserUseCase = container.get<CreateUserUseCase>(
      'CreateUserUseCase'
    );
  });

  it('should create user with real database', async () => {
    const dto = new CreateUserDTO(
      `user-${Date.now()}@example.com`,
      'Integration Test',
      'password123'
    );

    const result = await createUserUseCase.execute(dto);

    expect(result.id).toBeDefined();
    expect(result.email).toBe(dto.email);

    // Verify user was saved in database
    const userRepository = container.get<IUserRepository>(
      'IUserRepository'
    );
    const savedUser = await userRepository.findById(result.id);
    expect(savedUser).toBeDefined();
  });
});
