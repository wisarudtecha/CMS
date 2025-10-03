// /src/hooks/useAutoReconnect.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { getWebSocketService, WebSocketStatus } from "@/services/websocket.service";

export interface AutoReconnectConfig {
  backoffMultiplier?: number;
  enabled?: boolean;
  exponentialBackoff?: boolean;
  healthCheckInterval?: number;
  inactivityTimeout?: number;
  initialDelay?: number;
  jitterEnabled?: boolean;
  maxAttempts?: number;
  maxDelay?: number;
  reconnectOnNetworkRestore?: boolean;
  reconnectOnVisibilityChange?: boolean;
  resetOnSuccess?: boolean;
}

export interface AutoReconnectState {
  attemptCount: number;
  canReconnect: boolean;
  isReconnecting: boolean;
  lastAttemptTime: Date | null;
  nextRetryIn: number;
  reconnectReason: string | null;
  totalDowntime: number;
}

export interface NetworkState {
  downlink?: number;
  effectiveType?: string;
  isOnline: boolean;
  rtt?: number;
}

export interface AutoReconnectControls {
  forceReconnect: () => void;
  pauseReconnect: () => void;
  resumeReconnect: () => void;
  resetAttempts: () => void;
  updateConfig: (config: Partial<AutoReconnectConfig>) => void;
}

const defaultConfig: Required<AutoReconnectConfig> = {
  backoffMultiplier: 2,
  enabled: true,
  exponentialBackoff: true,
  maxAttempts: 10,
  healthCheckInterval: 60000,
  inactivityTimeout: 300000, // 5 minutes
  initialDelay: 1000,
  jitterEnabled: true,
  maxDelay: 30000,
  reconnectOnNetworkRestore: true,
  reconnectOnVisibilityChange: true,
  resetOnSuccess: true
};

export const useAutoReconnect = (
  config: AutoReconnectConfig = {}
): [AutoReconnectState, AutoReconnectControls] => {
  const finalConfig = { ...defaultConfig, ...config };
  const [reconnectState, setReconnectState] = useState<AutoReconnectState>({
    attemptCount: 0,
    canReconnect: finalConfig.enabled,
    isReconnecting: false,
    lastAttemptTime: null,
    nextRetryIn: 0,
    reconnectReason: null,
    totalDowntime: 0
  });

  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine,
  });

  const [wsStatus, setWsStatus] = useState<WebSocketStatus>(WebSocketStatus.DISCONNECTED);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Refs for timers and state
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const healthCheckTimer = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const downTimeStart = useRef<number | null>(null);
  const configRef = useRef(finalConfig);
  const isPausedRef = useRef(false);

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = { ...defaultConfig, ...config };
    setReconnectState(prev => ({ ...prev, canReconnect: configRef.current.enabled }));
  }, [config]);

  // Calculate next retry delay with exponential backoff and jitter
  const calculateDelay = useCallback((attemptCount: number): number => {
    const config = configRef.current;
    let delay: number;

    if (config.exponentialBackoff) {
      delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attemptCount),
        config.maxDelay
      );
    }
    else {
      delay = config.initialDelay;
    }

    // Add jitter to prevent thundering herd
    if (config.jitterEnabled) {
      const jitter = delay * 0.1 * Math.random();
      delay += jitter;
    }

    return Math.floor(delay);
  }, []);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  }, []);

  // Update network state
  const updateNetworkState = useCallback(() => {
    // const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    type NetworkInformation = {
      downlink?: number;
      effectiveType?: string;
      rtt?: number;
      addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
      removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
    };
    const nav = navigator as Navigator & {
      connection?: NetworkInformation;
      mozConnection?: NetworkInformation;
      webkitConnection?: NetworkInformation;
    };
    const connection: NetworkInformation | undefined = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    setNetworkState({
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    });
  }, []);

  // Track user activity
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Check if reconnection should be attempted
  const shouldReconnect = useCallback((): { should: boolean; reason: string } => {
    const config = configRef.current;
    const now = Date.now();

    if (!config.enabled || isPausedRef.current) {
      return { should: false, reason: "Reconnection disabled or paused" };
    }

    if (reconnectState.attemptCount >= config.maxAttempts) {
      return { should: false, reason: "Maximum reconnection attempts reached" };
    }

    if (!networkState.isOnline) {
      return { should: false, reason: "Network is offline" };
    }

    if (!isPageVisible && config.reconnectOnVisibilityChange) {
      return { should: false, reason: "Page is not visible" };
    }

    if (config.inactivityTimeout > 0 && now - lastActivity > config.inactivityTimeout) {
      return { should: false, reason: "User inactive for too long" };
    }

    return { should: true, reason: "Conditions met for reconnection" };
  }, [reconnectState.attemptCount, networkState.isOnline, isPageVisible, lastActivity]);

  // Perform reconnection attempt
  const attemptReconnect = useCallback(async (reason: string) => {
    const wsService = getWebSocketService();
    if (!wsService) {
      return;
    }

    const { should, reason: skipReason } = shouldReconnect();
    if (!should) {
      console.log("Skipping reconnection:", skipReason);
      setReconnectState(prev => ({
        ...prev,
        isReconnecting: false,
        reconnectReason: skipReason,
      }));
      return;
    }

    const attemptCount = reconnectState.attemptCount + 1;
    
    setReconnectState(prev => ({
      ...prev,
      isReconnecting: true,
      attemptCount,
      lastAttemptTime: new Date(),
      reconnectReason: reason,
    }));

    console.log(`Reconnection attempt ${attemptCount}/${configRef.current.maxAttempts}: ${reason}`);

    try {
      await wsService.connect();
      console.log("Reconnection successful");
      
      // Reset state on successful connection
      if (configRef.current.resetOnSuccess) {
        setReconnectState(prev => ({
          ...prev,
          isReconnecting: false,
          attemptCount: 0,
          nextRetryIn: 0,
          reconnectReason: null,
        }));
        downTimeStart.current = null;
      }
    }
    catch (error) {
      console.error("Reconnection failed:", error);
      
      // Schedule next attempt if we haven"t exceeded max attempts
      if (attemptCount < configRef.current.maxAttempts) {
        const delay = calculateDelay(attemptCount);
        scheduleReconnect(delay, `Retry after ${delay}ms delay`);
      } else {
        setReconnectState(prev => ({
          ...prev,
          isReconnecting: false,
          reconnectReason: "Maximum attempts reached",
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnectState.attemptCount, shouldReconnect, calculateDelay]);

  // Schedule reconnection with countdown
  const scheduleReconnect = useCallback((delay: number, reason: string) => {
    clearTimers();

    setReconnectState(prev => ({
      ...prev,
      nextRetryIn: delay,
      reconnectReason: reason,
    }));

    // Start countdown
    countdownTimer.current = setInterval(() => {
      setReconnectState(prev => {
        const newRetryIn = Math.max(0, prev.nextRetryIn - 1000);
        return { ...prev, nextRetryIn: newRetryIn };
      });
    }, 1000);

    // Schedule actual reconnection
    reconnectTimer.current = setTimeout(() => {
      clearTimers();
      attemptReconnect(reason);
    }, delay);

    console.log(`Next reconnection scheduled in ${delay}ms: ${reason}`);
  }, [clearTimers, attemptReconnect]);

  // Health check ping
  const performHealthCheck = useCallback(() => {
    const wsService = getWebSocketService();
    if (!wsService || !wsService.isConnected()) return;

    // Send ping and measure response time
    const pingStart = Date.now();
    wsService.send("ping", { timestamp: pingStart });

    // Listen for pong response (this would be handled in the WebSocket service)
    // For now, we"ll just assume the connection is healthy if we can send
  }, []);

  // Force reconnection
  const forceReconnect = useCallback(() => {
    clearTimers();
    setReconnectState(prev => ({ ...prev, attemptCount: 0 }));
    attemptReconnect("Manual reconnection requested");
  }, [clearTimers, attemptReconnect]);

  // Pause/resume reconnection
  const pauseReconnect = useCallback(() => {
    isPausedRef.current = true;
    clearTimers();
    setReconnectState(prev => ({
      ...prev,
      isReconnecting: false,
      canReconnect: false,
      reconnectReason: "Reconnection paused",
    }));
  }, [clearTimers]);

  const resumeReconnect = useCallback(() => {
    isPausedRef.current = false;
    setReconnectState(prev => ({
      ...prev,
      canReconnect: configRef.current.enabled,
      reconnectReason: null,
    }));

    // Attempt immediate reconnection if disconnected
    if (wsStatus !== WebSocketStatus.CONNECTED) {
      attemptReconnect("Reconnection resumed");
    }
  }, [wsStatus, attemptReconnect]);

  // Reset attempt counter
  const resetAttempts = useCallback(() => {
    setReconnectState(prev => ({
      ...prev,
      attemptCount: 0,
      nextRetryIn: 0,
      reconnectReason: null,
    }));
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<AutoReconnectConfig>) => {
    configRef.current = { ...configRef.current, ...newConfig };
    setReconnectState(prev => ({ ...prev, canReconnect: configRef.current.enabled }));
  }, []);

  // Setup WebSocket status monitoring
  useEffect(() => {
    const wsService = getWebSocketService();
    if (!wsService) {
      return;
    }

    setWsStatus(wsService.getStatus());

    const unsubscribe = wsService.onStatusChange((status) => {
      setWsStatus(status);

      // Handle status changes
      if (status === WebSocketStatus.DISCONNECTED || status === WebSocketStatus.ERROR) {
        if (!downTimeStart.current) {
          downTimeStart.current = Date.now();
        }

        if (configRef.current.enabled && !isPausedRef.current) {
          const delay = calculateDelay(reconnectState.attemptCount);
          scheduleReconnect(delay, `Connection ${status}, attempting reconnection`);
        }
      }
      else if (status === WebSocketStatus.CONNECTED) {
        if (downTimeStart.current) {
          const downtime = Date.now() - downTimeStart.current;
          setReconnectState(prev => ({ ...prev, totalDowntime: prev.totalDowntime + downtime }));
          downTimeStart.current = null;
        }
        clearTimers();
      }
    });

    return unsubscribe;
  }, [calculateDelay, reconnectState.attemptCount, scheduleReconnect, clearTimers]);

  // Setup network monitoring
  useEffect(() => {
    updateNetworkState();

    const handleOnline = () => {
      updateNetworkState();
      if (configRef.current.reconnectOnNetworkRestore && wsStatus !== WebSocketStatus.CONNECTED) {
        attemptReconnect("Network restored");
      }
    };

    const handleOffline = () => {
      updateNetworkState();
      clearTimers();
    };

    const handleConnectionChange = () => {
      updateNetworkState();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    type NetworkInformation = {
      downlink?: number;
      effectiveType?: string;
      rtt?: number;
      addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
      removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
    };
    const nav = navigator as Navigator & {
      connection?: NetworkInformation;
      mozConnection?: NetworkInformation;
      webkitConnection?: NetworkInformation;
    };
    const connection: NetworkInformation | undefined = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      connection.addEventListener?.("change", handleConnectionChange);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener?.("change", handleConnectionChange);
      }
    };
  }, [updateNetworkState, wsStatus, attemptReconnect, clearTimers]);

  // Setup page visibility monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsPageVisible(visible);

      if (visible && configRef.current.reconnectOnVisibilityChange && wsStatus !== WebSocketStatus.CONNECTED) {
        attemptReconnect("Page became visible");
      }
      else if (!visible) {
        clearTimers();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [wsStatus, attemptReconnect, clearTimers]);

  // Setup activity monitoring
  useEffect(() => {
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  // Setup inactivity timer
  useEffect(() => {
    if (configRef.current.inactivityTimeout <= 0) {
      return;
    }

    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    inactivityTimer.current = setTimeout(() => {
      if (wsStatus === WebSocketStatus.CONNECTED) {
        const wsService = getWebSocketService();
        wsService?.disconnect();
        console.log("Disconnected due to inactivity");
      }
    }, configRef.current.inactivityTimeout);

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [lastActivity, wsStatus]);

  // Setup health check
  useEffect(() => {
    if (configRef.current.healthCheckInterval <= 0) return;

    if (healthCheckTimer.current) {
      clearInterval(healthCheckTimer.current);
    }

    healthCheckTimer.current = setInterval(() => {
      if (wsStatus === WebSocketStatus.CONNECTED) {
        performHealthCheck();
      }
    }, configRef.current.healthCheckInterval);

    return () => {
      if (healthCheckTimer.current) {
        clearInterval(healthCheckTimer.current);
      }
    };
  }, [wsStatus, performHealthCheck]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      if (healthCheckTimer.current) {
        clearInterval(healthCheckTimer.current);
      }
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [clearTimers]);

  const controls: AutoReconnectControls = {
    forceReconnect,
    pauseReconnect,
    resumeReconnect,
    resetAttempts,
    updateConfig,
  };

  return [reconnectState, controls];
};

export default useAutoReconnect;
