// contexts/WebSocketContext.tsx
import React, { createContext, useContext, useRef, useEffect, useState, ReactNode } from 'react';
import {  getNewCaseDataByCaseId } from '../case/caseLocalStorage.tsx/caseListUpdate';
import { CaseEntity } from '@/types/case';
import { idbStorage } from '../idb/idb';

const isLocalhost: boolean = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "[::1]";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  send: (data: any) => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => () => void;
  websocket: (config: WebSocketConfig) => void;
  disconnect: () => void;
  lastMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  defaultConfig?: WebSocketConfig;
}
const WEBSOCKET = import.meta.env.VITE_WEBSOCKET_BASE_URL;

export const defalutWebsocketConfig = {
  url: `${WEBSOCKET}/api/v1/notifications/register`,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 60000,


} as WebSocketConfig;

export const WebSocketCaseEvent = (message: WebSocketMessage) => {
  switch (message.data?.EVENT) {
    case "CASE-CREATE":
      (async () => {
        const caseId = message.data.additionalJson.caseId;
        await getNewCaseDataByCaseId(caseId);
        window.dispatchEvent(new StorageEvent("storage", {
          key: "caseList",
          newValue: JSON.stringify(await idbStorage.getItem("caseList")),
        }));
      })();
      break;

    case "CASE-UPDATE":
      (async () => {
        const caseId = message.data.additionalJson.caseId;
        await getNewCaseDataByCaseId(caseId);
        window.dispatchEvent(new StorageEvent("storage", {
          key: "caseList",
          newValue: JSON.stringify(await idbStorage.getItem("caseList")),
        }));
      })();
      break;

    case "CASE-STATUS-UPDATE":
      (async () => {
        try {
          const caseList = JSON.parse(JSON.stringify(await idbStorage.getItem("caseList") ?? "[]")) as CaseEntity[];
          const targetCaseId = message?.data?.additionalJson?.caseId;
          const newStatus = message?.data?.additionalJson?.status;

          if (targetCaseId && newStatus !== undefined) {
            const updatedCaseList = caseList.map((item) =>
              item.caseId === targetCaseId
                ? { ...item, statusId: newStatus === "S013" ? "S001" : newStatus }
                : item
            );

            idbStorage.setItem("caseList", JSON.stringify(updatedCaseList));


            window.dispatchEvent(new StorageEvent("storage", {
              key: "caseList",
              newValue: JSON.stringify(await idbStorage.getItem("caseList")),
            }));
          }
        } catch (error) {
          console.error("Failed to update case status:", error);
        }
      })();
      break;

    default:

      break;
  }
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  autoConnect = false,
  defaultConfig
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const configRef = useRef<WebSocketConfig | null>(null);
  const subscribersRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);

  const clearTimers = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const startHeartbeat = () => {
    const config = configRef.current;
    if (!config?.heartbeatInterval) return;

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, config.heartbeatInterval);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const attemptReconnect = () => {
    const config = configRef.current;
    // if (!config) return;

    // const maxAttempts = config?.maxReconnectAttempts || 5;
    const maxAttempts = config?.maxReconnectAttempts || 10;
    const interval = config?.reconnectInterval || 3000;

    if (reconnectAttemptsRef.current >= maxAttempts) {
      console.error('Max reconnect attempts reached');
      setConnectionState('error');
      return;
    }

    reconnectAttemptsRef.current++;
    if (!isLocalhost) {
      console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxAttempts})`);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      websocket(config || defalutWebsocketConfig);
    }, interval);
  };

  const getProfile = () => {
    const profile = localStorage.getItem("profile");
    if (profile) {
      try { return JSON.parse(profile); } catch (err) {
        console.error("Failed to parse profile:", err);
        return null;
      }
    }
    return null;
  };

  const websocket = (config: WebSocketConfig) => {
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {

      return;
    }

    isConnectingRef.current = true;
    configRef.current = config;
    setConnectionState('connecting');
    clearTimers();

    try {

      const ws = new WebSocket(config.url);
      const profile = getProfile();
      ws.onopen = () => {
        const userRegisterPayload = { "EVENT": "SUBSCRIBE", orgId: profile.orgId, username: profile.username };

        ws.send(JSON.stringify(userRegisterPayload));
        // console.log('WebSocket connected');
        // setIsConnected(true);
        // setConnectionState('connected');
        isConnectingRef.current = false;
        // reconnectAttemptsRef.current = 0;
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const message: WebSocketMessage = {
            type: parsed.type || 'message',
            data: parsed,
            timestamp: Date.now()
          };

          if (isConnected === false && message.data.EVENT === "SUBSCRIBE-SUCCESS") {
            console.log('WebSocket connected');
            setIsConnected(true);
            setConnectionState('connected');
            return
          }

          setLastMessage(message);
          switch (message.data.EVENT != null) {
            case message.data.EVENT?.includes("CASE"):
              WebSocketCaseEvent(message)
              break;
            default:
              break;
          }


          // Notify all subscribers
          subscribersRef.current.forEach(callback => {
            try {
              callback(message);
            } catch (error) {
              console.error('Error in WebSocket subscriber callback:', error);
            }
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        if (!isLocalhost) {
          console.log('WebSocket disconnected:', event.code, event.reason);
        }
        setIsConnected(false);
        setConnectionState('disconnected');
        isConnectingRef.current = false;
        stopHeartbeat();

        // Attempt reconnect if it wasn't a manual close
        if (event.code !== 1000 && configRef.current) {
          attemptReconnect();
        }
      };

      ws.onerror = (error) => {
        if (!isLocalhost) {
          console.error('WebSocket error:', error);
        }
        setConnectionState('error');
        isConnectingRef.current = false;
        // connect(defalutWebsocketConfig)
        reconnectAttemptsRef.current = 0;
        attemptReconnect();

      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState('error');
      isConnectingRef.current = false;
    }
  };

  const disconnect = () => {
    clearTimers();
    configRef.current = null;

    if (wsRef.current) {
      if (!isLocalhost) {
        wsRef.current.close(1000, 'Manual disconnect');
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionState('disconnected');
  };

  const send = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', data);
    }
  };

  const onMessage = (callback: (message: WebSocketMessage) => void) => {
    subscribersRef.current.add(callback);

    // Return unsubscribe function
    return () => {
      subscribersRef.current.delete(callback);
    };
  };

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      websocket(defaultConfig || defalutWebsocketConfig);

    }

    return () => {
      disconnect();
    };
  }, [autoConnect, defaultConfig]);

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionState,
    send,
    onMessage,
    websocket,
    disconnect,
    lastMessage
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};