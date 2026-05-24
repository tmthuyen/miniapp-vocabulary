// src/application/interfaces/IEmailService.ts
export interface IEmailService {
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendOrderConfirmation(email: string, orderId: string): Promise<void>;
  sendResetPassword(email: string, resetLink: string): Promise<void>;
}

// src/application/interfaces/IQueueService.ts
export interface IQueueService {
  enqueue<T>(queue: string, data: T): Promise<void>;
  dequeue<T>(queue: string): Promise<T | null>;
  subscribe<T>(queue: string, callback: (data: T) => Promise<void>): void;
}

// src/application/interfaces/IEventBus.ts
export interface DomainEvent {
  type: string;
  payload: any;
  timestamp?: Date;
}

export interface IEventBus {
  emit(event: DomainEvent): Promise<void>;
  subscribe(
    eventType: string,
    callback: (event: DomainEvent) => Promise<void>
  ): void;
}

// src/application/interfaces/ISocketService.ts
export interface ISocketService {
  sendToUser(userId: string, event: string, data: any): void;
  sendToRoom(room: string, event: string, data: any): void;
  broadcast(event: string, data: any): void;
  subscribeToRoom(room: string): void;
  unsubscribeFromRoom(room: string): void;
}

// src/application/interfaces/ICacheService.ts
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
