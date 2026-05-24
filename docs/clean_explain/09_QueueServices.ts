// src/infrastructure/queue/RedisQueueService.ts
import { IQueueService } from '@/application/interfaces/IQueueService';
import redis, { Redis } from 'ioredis';

export class RedisQueueService implements IQueueService {
  private client: Redis;

  constructor(redisUrl: string) {
    this.client = new redis(redisUrl);
  }

  async enqueue<T>(queue: string, data: T): Promise<void> {
    const serialized = JSON.stringify(data);
    await this.client.rpush(queue, serialized);
  }

  async dequeue<T>(queue: string): Promise<T | null> {
    const data = await this.client.lpop(queue);
    return data ? JSON.parse(data) : null;
  }

  subscribe<T>(queue: string, callback: (data: T) => Promise<void>): void {
    const processQueue = async () => {
      while (true) {
        const data = await this.dequeue<T>(queue);
        if (data) {
          try {
            await callback(data);
          } catch (error) {
            console.error(`Error processing ${queue}:`, error);
            // Re-enqueue failed items (dead letter queue pattern)
            await this.enqueue(`${queue}:dead-letter`, data);
          }
        } else {
          // Wait before polling again
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };

    processQueue();
  }
}

// src/infrastructure/queue/RabbitMQQueueService.ts
import { IQueueService } from '@/application/interfaces/IQueueService';
import amqp, { Channel, Connection } from 'amqplib';

export class RabbitMQQueueService implements IQueueService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect(url: string): Promise<void> {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
  }

  async enqueue<T>(queue: string, data: T): Promise<void> {
    if (!this.channel) throw new Error('Not connected');

    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
  }

  async dequeue<T>(queue: string): Promise<T | null> {
    if (!this.channel) throw new Error('Not connected');

    const msg = await this.channel.get(queue);
    return msg ? JSON.parse(msg.content.toString()) : null;
  }

  subscribe<T>(queue: string, callback: (data: T) => Promise<void>): void {
    if (!this.channel) throw new Error('Not connected');

    this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString()) as T;
        await callback(data);
        this.channel!.ack(msg);
      } catch (error) {
        console.error(`Error processing ${queue}:`, error);
        // Negative acknowledgment - message goes back to queue
        this.channel!.nack(msg, false, true);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

// src/infrastructure/queue/QueueConsumer.ts
// Worker process that consumes jobs from queue
import { IQueueService } from '@/application/interfaces/IQueueService';
import { IEmailService } from '@/application/interfaces/IEmailService';

interface SendWelcomeEmailJob {
  email: string;
  name: string;
}

export class QueueConsumer {
  constructor(
    private queueService: IQueueService,
    private emailService: IEmailService
  ) {}

  startConsuming(): void {
    // Handle welcome email jobs
    this.queueService.subscribe<SendWelcomeEmailJob>(
      'send-welcome-email',
      async (job) => {
        console.log(`Processing welcome email for ${job.email}`);
        await this.emailService.sendWelcomeEmail(job.email, job.name);
        console.log(`Welcome email sent to ${job.email}`);
      }
    );

    // Handle order confirmation jobs
    this.queueService.subscribe<any>(
      'send-order-confirmation',
      async (job) => {
        console.log(`Processing order confirmation for ${job.orderId}`);
        await this.emailService.sendOrderConfirmation(job.email, job.orderId);
        console.log(`Order confirmation sent`);
      }
    );
  }
}
