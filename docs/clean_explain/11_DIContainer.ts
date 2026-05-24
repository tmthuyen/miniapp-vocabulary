// src/di/Container.ts
// Dependency Injection Container - Giải quyết tất cả dependencies

import { PrismaClient } from '@prisma/client';

// Domain
import { IUserRepository } from '@/domain/repositories/IUserRepository';

// Application interfaces
import { IEmailService } from '@/application/interfaces/IEmailService';
import { IQueueService } from '@/application/interfaces/IQueueService';
import { IEventBus } from '@/application/interfaces/IEventBus';
import { ISocketService } from '@/application/interfaces/ISocketService';

// Infrastructure implementations
import { PostgresUserRepository } from '@/infrastructure/database/repositories/PostgresUserRepository';
import { SendgridEmailService } from '@/infrastructure/email/SendgridEmailService';
import { RedisQueueService } from '@/infrastructure/queue/RedisQueueService';
import { EventBus } from '@/infrastructure/events/EventBus';
import { SocketIOService } from '@/infrastructure/socket/SocketIOService';

// Use cases
import { CreateUserUseCase } from '@/application/usecases/user/CreateUserUseCase';

export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerServices();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerServices(): void {
    // Database
    const prisma = new PrismaClient();
    this.services.set('PrismaClient', prisma);

    // Repositories
    this.services.set(
      'IUserRepository',
      new PostgresUserRepository(prisma)
    );

    // Infrastructure Services
    const emailService = new SendgridEmailService(
      process.env.SENDGRID_API_KEY || ''
    );
    this.services.set('IEmailService', emailService);

    const queueService = new RedisQueueService(
      process.env.REDIS_URL || 'redis://localhost:6379'
    );
    this.services.set('IQueueService', queueService);

    const eventBus = new EventBus();
    this.services.set('IEventBus', eventBus);

    // Use cases
    this.services.set(
      'CreateUserUseCase',
      new CreateUserUseCase(
        this.services.get('IUserRepository'),
        this.services.get('IEventBus'),
        this.services.get('IEmailService')
      )
    );
  }

  // Generic get method
  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found in container`);
    }
    return service;
  }

  // Register a service dynamically
  register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  // Get all registered services (for debugging)
  getAllServices(): string[] {
    return Array.from(this.services.keys());
  }
}

// src/di/register.ts
// Register event subscribers and queue consumers

import { Container } from './Container';
import {
  registerUserCreatedSubscriber,
  registerOrderCreatedSubscriber,
} from '@/infrastructure/events/subscribers';
import { QueueConsumer } from '@/infrastructure/queue/QueueConsumer';

export function setupDependencies(): void {
  const container = Container.getInstance();

  // Register event subscribers
  registerUserCreatedSubscriber(
    container.get('IEventBus'),
    container.get('IQueueService'),
    container.get('ISocketService')
  );

  registerOrderCreatedSubscriber(
    container.get('IEventBus'),
    container.get('IQueueService')
  );

  // Start queue consumer worker
  const queueConsumer = new QueueConsumer(
    container.get('IQueueService'),
    container.get('IEmailService')
  );
  queueConsumer.startConsuming();
}

// Usage in _app.tsx or server initialization
export function getContainer(): Container {
  return Container.getInstance();
}
