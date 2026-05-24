// src/infrastructure/events/EventBus.ts
import { IEventBus, DomainEvent } from '@/application/interfaces/IEventBus';
import EventEmitter from 'events';

export class EventBus implements IEventBus {
  private emitter = new EventEmitter();

  async emit(event: DomainEvent): Promise<void> {
    event.timestamp = event.timestamp || new Date();
    console.log(`[EVENT] Emitting ${event.type}:`, event.payload);
    this.emitter.emit(event.type, event);
  }

  subscribe(
    eventType: string,
    callback: (event: DomainEvent) => Promise<void>
  ): void {
    this.emitter.on(eventType, async (event: DomainEvent) => {
      try {
        await callback(event);
      } catch (error) {
        console.error(`Error in subscriber for ${eventType}:`, error);
      }
    });
  }
}

// src/infrastructure/events/subscribers/UserCreatedSubscriber.ts
import { IEventBus, DomainEvent } from '@/application/interfaces/IEventBus';
import { IQueueService } from '@/application/interfaces/IQueueService';
import { ISocketService } from '@/application/interfaces/ISocketService';

export function registerUserCreatedSubscriber(
  eventBus: IEventBus,
  queueService: IQueueService,
  socketService: ISocketService
) {
  eventBus.subscribe('USER_CREATED', async (event: DomainEvent) => {
    const { userId, email, name } = event.payload;

    // Enqueue welcome email job
    await queueService.enqueue('send-welcome-email', {
      email,
      name,
    });

    // Send notification via socket
    socketService.broadcast('user-joined', {
      userId,
      name,
      joinedAt: event.timestamp,
    });

    // Log analytics
    console.log(`[USER_CREATED] New user: ${name} (${email})`);
  });
}

// src/infrastructure/events/subscribers/OrderCreatedSubscriber.ts
import { IEventBus, DomainEvent } from '@/application/interfaces/IEventBus';
import { IQueueService } from '@/application/interfaces/IQueueService';

export function registerOrderCreatedSubscriber(
  eventBus: IEventBus,
  queueService: IQueueService
) {
  eventBus.subscribe('ORDER_CREATED', async (event: DomainEvent) => {
    const { orderId, userId, totalAmount } = event.payload;

    // Enqueue order confirmation email
    await queueService.enqueue('send-order-confirmation', {
      orderId,
      userId,
    });

    // Enqueue inventory update job
    await queueService.enqueue('update-inventory', {
      orderId,
    });

    // Log analytics
    console.log(
      `[ORDER_CREATED] New order: ${orderId} - Amount: ${totalAmount}`
    );
  });
}
