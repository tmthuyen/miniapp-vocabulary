// src/infrastructure/socket/SocketIOService.ts
import { ISocketService } from '@/application/interfaces/ISocketService';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class SocketIOService implements ISocketService {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
        credentials: true,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join user-specific room
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${socket.id} joined room user:${userId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  sendToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  subscribeToRoom(room: string): void {
    // Client-side method would be called from browser
    console.log(`Subscribing to room: ${room}`);
  }

  unsubscribeFromRoom(room: string): void {
    // Client-side method would be called from browser
    console.log(`Unsubscribing from room: ${room}`);
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}

// src/infrastructure/socket/MockSocketService.ts (for testing)
import { ISocketService } from '@/application/interfaces/ISocketService';

export class MockSocketService implements ISocketService {
  private events: any[] = [];

  sendToUser(userId: string, event: string, data: any): void {
    this.events.push({ type: 'user', userId, event, data });
  }

  sendToRoom(room: string, event: string, data: any): void {
    this.events.push({ type: 'room', room, event, data });
  }

  broadcast(event: string, data: any): void {
    this.events.push({ type: 'broadcast', event, data });
  }

  subscribeToRoom(room: string): void {
    console.log(`[MOCK] Subscribed to ${room}`);
  }

  unsubscribeFromRoom(room: string): void {
    console.log(`[MOCK] Unsubscribed from ${room}`);
  }

  getEvents() {
    return this.events;
  }

  clear() {
    this.events = [];
  }
}
