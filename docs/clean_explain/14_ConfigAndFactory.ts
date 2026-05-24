// src/config/environment.ts
// Load environment based on NODE_ENV

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost/myapp',
  },

  // Email Service
  email: {
    provider: (process.env.EMAIL_PROVIDER || 'sendgrid') as
      | 'sendgrid'
      | 'resend'
      | 'mock',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
  },

  // Queue Service
  queue: {
    provider: (process.env.QUEUE_PROVIDER || 'redis') as
      | 'redis'
      | 'rabbitmq'
      | 'mock',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost',
  },

  // Socket Service
  socket: {
    enabled: process.env.SOCKET_ENABLED === 'true',
    port: parseInt(process.env.SOCKET_PORT || '3001', 10),
  },

  // Cache
  cache: {
    provider: (process.env.CACHE_PROVIDER || 'memory') as
      | 'redis'
      | 'memory'
      | 'none',
  },
};

// src/di/ContainerFactory.ts
// Factory to create container with correct implementations based on config

import { Container } from './Container';
import { config } from '@/config/environment';
import { IEmailService } from '@/application/interfaces/IEmailService';
import { IQueueService } from '@/application/interfaces/IQueueService';

export class ContainerFactory {
  static createContainer(): Container {
    const container = Container.getInstance();

    // Register email service based on config
    const emailService = this.createEmailService();
    container.register('IEmailService', emailService);

    // Register queue service based on config
    const queueService = this.createQueueService();
    container.register('IQueueService', queueService);

    return container;
  }

  private static createEmailService(): IEmailService {
    switch (config.email.provider) {
      case 'sendgrid':
        const { SendgridEmailService } = require(
          '@/infrastructure/email/SendgridEmailService'
        );
        return new SendgridEmailService(config.email.sendgridApiKey);

      case 'resend':
        const { ResendEmailService } = require(
          '@/infrastructure/email/ResendEmailService'
        );
        return new ResendEmailService(config.email.resendApiKey);

      case 'mock':
      default:
        const { MockEmailService } = require(
          '@/infrastructure/email/SendgridEmailService'
        );
        return new MockEmailService();
    }
  }

  private static createQueueService(): IQueueService {
    switch (config.queue.provider) {
      case 'redis':
        const { RedisQueueService } = require(
          '@/infrastructure/queue/RedisQueueService'
        );
        return new RedisQueueService(config.queue.redisUrl);

      case 'rabbitmq':
        const { RabbitMQQueueService } = require(
          '@/infrastructure/queue/RabbitMQQueueService'
        );
        return new RabbitMQQueueService();

      case 'mock':
      default:
        // Return in-memory implementation
        const { InMemoryQueueService } = require(
          '@/infrastructure/queue/InMemoryQueueService'
        );
        return new InMemoryQueueService();
    }
  }
}

// .env.local examples

// Production - Use real services
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db.example.com/myapp
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=sg_xxxxxxxxxxxxx
QUEUE_PROVIDER=rabbitmq
RABBITMQ_URL=amqp://user:pass@rabbitmq.example.com
SOCKET_ENABLED=true
CACHE_PROVIDER=redis
REDIS_URL=redis://redis.example.com:6379

---

// Development - Mix of real and mock services
NODE_ENV=development
DATABASE_URL=postgresql://localhost/myapp_dev
EMAIL_PROVIDER=mock
QUEUE_PROVIDER=redis
REDIS_URL=redis://localhost:6379
SOCKET_ENABLED=true
CACHE_PROVIDER=memory

---

// Testing - All mock services
NODE_ENV=test
DATABASE_URL=postgresql://localhost/myapp_test
EMAIL_PROVIDER=mock
QUEUE_PROVIDER=mock
SOCKET_ENABLED=false
CACHE_PROVIDER=none
