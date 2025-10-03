// /src/services/websocket.service.ts
export interface WebSocketConfig {
  heartbeatInterval?: number;
  maxReconnectAttempts?: number;
  protocols?: string[];
  reconnectInterval?: number;
  timeout?: number;
  url: string;
}

export interface WebSocketMessage {
  id?: string;
  payload: unknown;
  timestamp: number;
  type: string;
}

export enum WebSocketStatus {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  RECONNECTING = "reconnecting",
  ERROR = "error"
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;
export type WebSocketStatusHandler = (status: WebSocketStatus) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private eventHandlers = new Map<string, Set<WebSocketEventHandler>>();
  private statusHandlers = new Set<WebSocketStatusHandler>();
  private messageQueue: WebSocketMessage[] = [];
  private isManualClose = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      protocols: config.protocols || [],
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      heartbeatInterval: config.heartbeatInterval || 30000,
      timeout: config.timeout || 10000
    };
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.isManualClose = false;
      this.updateStatus(WebSocketStatus.CONNECTING);

      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        const timeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error("WebSocket connection timeout"));
          }
        }, this.config.timeout);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.onOpen();
          resolve();
        };

        this.ws.onmessage = (event) => this.onMessage(event);
        this.ws.onclose = (event) => this.onClose(event);
        this.ws.onerror = (event) => {
          clearTimeout(timeout);
          this.onError(event);
          reject(new Error("WebSocket connection failed"));
        };
      }
      catch (error) {
        this.updateStatus(WebSocketStatus.ERROR);
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.isManualClose = true;
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();
    
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
    
    this.updateStatus(WebSocketStatus.DISCONNECTED);
  }

  public send(type: string, payload: unknown): boolean {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      }
      catch (error) {
        console.error("Failed to send WebSocket message:", error);
        this.queueMessage(message);
        return false;
      }
    }
    else {
      this.queueMessage(message);
      return false;
    }
  }

  public subscribe(eventType: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    };
  }

  public onStatusChange(handler: WebSocketStatusHandler): () => void {
    this.statusHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  public isConnected(): boolean {
    return this.status === WebSocketStatus.CONNECTED;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  private onOpen(): void {
    console.log("WebSocket connected");
    this.reconnectAttempts = 0;
    this.updateStatus(WebSocketStatus.CONNECTED);
    this.startHeartbeat();
    this.processMessageQueue();
  }

  private onMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle heartbeat response
      if (message.type === "pong") {
        return;
      }

      // Emit to subscribers
      const handlers = this.eventHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          }
          catch (error) {
            console.error("Error in WebSocket message handler:", error);
          }
        });
      }

      // Emit to wildcard subscribers
      const wildcardHandlers = this.eventHandlers.get("*");
      if (wildcardHandlers) {
        wildcardHandlers.forEach(handler => {
          try {
            handler(message);
          }
          catch (error) {
            console.error("Error in WebSocket wildcard handler:", error);
          }
        });
      }
    }
    catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }

  private onClose(event: CloseEvent): void {
    console.log("WebSocket disconnected:", event.code, event.reason);
    this.clearHeartbeatTimer();
    
    if (!this.isManualClose && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.updateStatus(WebSocketStatus.RECONNECTING);
      this.scheduleReconnect();
    }
    else {
      this.updateStatus(WebSocketStatus.DISCONNECTED);
    }
  }

  private onError(event: Event): void {
    console.error("WebSocket error:", event);
    this.updateStatus(WebSocketStatus.ERROR);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        console.error("Reconnection failed:", error);
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
        else {
          this.updateStatus(WebSocketStatus.DISCONNECTED);
        }
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeatTimer();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send("ping", { timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message);
    
    // Limit queue size to prevent memory issues
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.ws.send(JSON.stringify(message));
        }
        catch (error) {
          console.error("Failed to send queued message:", error);
          // Put message back at the front of the queue
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  private updateStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusHandlers.forEach(handler => {
        try {
          handler(status);
        }
        catch (error) {
          console.error("Error in WebSocket status handler:", error);
        }
      });
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

export const createWebSocketService = (config: WebSocketConfig): WebSocketService => {
  if (webSocketService) {
    webSocketService.disconnect();
  }
  
  webSocketService = new WebSocketService(config);
  return webSocketService;
};

export const getWebSocketService = (): WebSocketService | null => {
  return webSocketService;
};

export default WebSocketService;
