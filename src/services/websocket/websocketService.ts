import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { WebSocketMessage } from '../../shared/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private connected = false;
  private reconnectDelay = 5000;

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected && this.client?.active) {
        resolve();
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        reconnectDelay: this.reconnectDelay,
        onConnect: () => {
          this.connected = true;
          console.log('[WebSocket] Connected to STOMP broker');
          resolve();
        },
        onStompError: (frame) => {
          console.error('[WebSocket] STOMP error:', frame);
          reject(new Error(frame.headers?.message || 'STOMP connection error'));
        },
        onDisconnect: () => {
          this.connected = false;
          console.log('[WebSocket] Disconnected from STOMP broker');
        },
        onWebSocketError: (event) => {
          console.error('[WebSocket] WebSocket error:', event);
        },
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client?.active) {
      this.subscriptions.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch (_) {
          // ignore
        }
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
    }
  }

  subscribe(destination: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(destination)) {
      this.handlers.set(destination, new Set());
    }
    this.handlers.get(destination)!.add(handler);

    if (this.connected && this.client?.active) {
      this.doSubscribe(destination);
    }

    return () => {
      const handlers = this.handlers.get(destination);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(destination);
          const sub = this.subscriptions.get(destination);
          if (sub) {
            try {
              sub.unsubscribe();
            } catch (_) {
              // ignore
            }
            this.subscriptions.delete(destination);
          }
        }
      }
    };
  }

  private doSubscribe(destination: string): void {
    if (this.subscriptions.has(destination) || !this.client?.active) return;

    const sub = this.client.subscribe(destination, (stompMsg: IMessage) => {
      try {
        const parsed = JSON.parse(stompMsg.body) as WebSocketMessage;
        const handlers = this.handlers.get(destination);
        handlers?.forEach((h) => h(parsed));
      } catch (err) {
        console.error('[WebSocket] Failed to parse message:', err);
      }
    });
    this.subscriptions.set(destination, sub);
  }

  subscribeToMessages(handler: MessageHandler): () => void {
    return this.subscribe('/topic/admin/messages', handler);
  }

  subscribeToReports(handler: MessageHandler): () => void {
    return this.subscribe('/topic/admin/reports', handler);
  }

  subscribeToUserEvents(handler: MessageHandler): () => void {
    return this.subscribe('/topic/admin/users', handler);
  }

  subscribeToRoom(roomId: number, handler: MessageHandler): () => void {
    return this.subscribe(`/topic/room/${roomId}`, handler);
  }

  isConnected(): boolean {
    return this.connected && (this.client?.active ?? false);
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
