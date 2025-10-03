// /src/components/common/ConnectionStatusIndicator.tsx
import React, { useEffect, useRef, useState } from "react";
import { WebSocketStatus, getWebSocketService } from "@/services/websocket.service";

export interface ConnectionStatusIndicatorProps {
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  showDetails?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  status?: WebSocketStatus;
  onClick?: () => void;
}

export interface ConnectionDetails {
  lastConnected?: Date;
  lastDisconnected?: Date;
  latency?: number;
  maxReconnectAttempts: number;
  reconnectAttempts: number;
  status: WebSocketStatus;
  uptime?: number;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  className = "",
  position = "bottom",
  showDetails = false,
  showLabel = true,
  size = "md",
  status: propStatus,
  onClick
}) => {
  const [status, setStatus] = useState<WebSocketStatus>(propStatus || WebSocketStatus.DISCONNECTED);
  const [details, setDetails] = useState<ConnectionDetails | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propStatus) {
      setStatus(propStatus);
      return;
    }

    const wsService = getWebSocketService();
    if (!wsService) {
      return;
    }

    // Set initial status
    setStatus(wsService.getStatus());

    // Subscribe to status changes
    const unsubscribe = wsService.onStatusChange((newStatus) => {
      setStatus(newStatus);
      updateConnectionDetails(newStatus);
    });

    // Initial details update
    updateConnectionDetails(wsService.getStatus());

    return unsubscribe;
  }, [propStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowDetailPanel(false);
      }
    };

    if (showDetailPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDetailPanel]);

  const updateConnectionDetails = (currentStatus: WebSocketStatus) => {
    const wsService = getWebSocketService();
    if (!wsService) {
      return;
    }

    const newDetails: ConnectionDetails = {
      lastConnected: currentStatus === WebSocketStatus.CONNECTED ? new Date() : undefined,
      lastDisconnected: currentStatus === WebSocketStatus.DISCONNECTED ? new Date() : undefined,
      maxReconnectAttempts: 5, // This should come from config
      reconnectAttempts: wsService.getReconnectAttempts(),
      status: currentStatus
    };

    setDetails(newDetails);
  };

  const getStatusConfig = (status: WebSocketStatus) => {
    switch (status) {
      case WebSocketStatus.CONNECTED:
        return {
          color: "bg-green-500 dark:bg-green-400",
          pulseColor: "bg-green-400 dark:bg-green-500",
          textColor: "text-green-700 dark:text-green-200",
          label: "Connected",
          icon: "✓",
          description: "Real-time connection active"
        };
      case WebSocketStatus.CONNECTING:
        return {
          color: "bg-yellow-500 dark:bg-yellow-400",
          pulseColor: "bg-yellow-400 dark:bg-yellow-500",
          textColor: "text-yellow-700 dark:text-yellow-200",
          label: "Connecting",
          icon: "↻",
          description: "Establishing connection..."
        };
      case WebSocketStatus.RECONNECTING:
        return {
          color: "bg-orange-500 dark:bg-orange-400",
          pulseColor: "bg-orange-400 dark:bg-orange-500",
          textColor: "text-orange-700 dark:text-orange-200",
          label: "Reconnecting",
          icon: "↻",
          description: "Attempting to reconnect..."
        };
      case WebSocketStatus.ERROR:
        return {
          color: "bg-red-500 dark:bg-red-400",
          pulseColor: "bg-red-400 dark:bg-red-500",
          textColor: "text-red-700 dark:text-red-200",
          label: "Error",
          icon: "⚠",
          description: "Connection error occurred"
        };
      case WebSocketStatus.DISCONNECTED:
      default:
        return {
          color: "bg-gray-500 dark:bg-gray-400",
          pulseColor: "bg-gray-400 dark:bg-gray-500",
          textColor: "text-gray-700 dark:text-gray-200",
          label: "Disconnected",
          icon: "✕",
          description: "No real-time connection"
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return {
          dot: "w-2 h-2",
          text: "text-xs",
          icon: "text-xs",
          container: "gap-1"
        };
      case "lg":
        return {
          dot: "w-4 h-4",
          text: "text-base",
          icon: "text-sm",
          container: "gap-3"
        };
      case "md":
      default:
        return {
          dot: "w-3 h-3",
          text: "text-sm",
          icon: "text-xs",
          container: "gap-2"
        };
    }
  };

  const getTooltipPosition = (position: string) => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      case "bottom":
      default:
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
    }
  };

  const statusConfig = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const isAnimated = status === WebSocketStatus.CONNECTING || status === WebSocketStatus.RECONNECTING;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    else if (showDetails) {
      setShowDetailPanel(!showDetailPanel);
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    else {
      return `${seconds}s`;
    }
  };

  return (
    <div className={`relative inline-flex items-center ${sizeClasses.container} ${className}`}>
      {/* Main Indicator */}
      <div
        className={`relative cursor-pointer ${showDetails ? "cursor-pointer" : ""}`}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Status Dot */}
        <div className="relative">
          <div className={`${sizeClasses.dot} ${statusConfig.color} rounded-full`} />
          
          {/* Pulse Animation */}
          {isAnimated && (
            <div className={`absolute inset-0 ${sizeClasses.dot} ${statusConfig.pulseColor} rounded-full animate-ping opacity-75`} />
          )}
          
          {/* Icon Overlay */}
          {size !== "sm" && (
            <div className={`absolute inset-0 flex items-center justify-center ${sizeClasses.icon} text-white font-bold`}>
              {statusConfig.icon}
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <span className={`font-medium ${statusConfig.textColor} ${sizeClasses.text}`}>
          {statusConfig.label}
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && !showDetailPanel && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${getTooltipPosition(position)} pointer-events-none`}
        >
          <div className="bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg max-w-xs">
            <div className="font-medium">{statusConfig.label}</div>
            <div className="text-gray-300">{statusConfig.description}</div>
            {details && details.reconnectAttempts > 0 && (
              <div className="text-gray-300 mt-1">
                Attempt {details.reconnectAttempts}/{details.maxReconnectAttempts}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Panel */}
      {showDetailPanel && details && (
        <div
          ref={panelRef}
          className={`absolute z-50 ${getTooltipPosition(position)}`}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Connection Status</h3>
              <button
                onClick={() => setShowDetailPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Current Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${statusConfig.color} rounded-full`} />
                  <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Reconnection Info */}
              {details.reconnectAttempts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reconnect Attempts:</span>
                  <span className="text-sm text-gray-900">
                    {details.reconnectAttempts}/{details.maxReconnectAttempts}
                  </span>
                </div>
              )}

              {/* Last Connected */}
              {details.lastConnected && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Connected:</span>
                  <span className="text-sm text-gray-900">
                    {details.lastConnected.toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Last Disconnected */}
              {details.lastDisconnected && status === WebSocketStatus.DISCONNECTED && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Disconnected:</span>
                  <span className="text-sm text-gray-900">
                    {details.lastDisconnected.toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Uptime */}
              {details.uptime && status === WebSocketStatus.CONNECTED && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime:</span>
                  <span className="text-sm text-gray-900">
                    {formatUptime(details.uptime)}
                  </span>
                </div>
              )}

              {/* Latency */}
              {details.latency && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Latency:</span>
                  <span className="text-sm text-gray-900">
                    {details.latency}ms
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex gap-2">
                {status === WebSocketStatus.DISCONNECTED && (
                  <button
                    onClick={() => {
                      const wsService = getWebSocketService();
                      wsService?.connect();
                      setShowDetailPanel(false);
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                  >
                    Reconnect
                  </button>
                )}
                
                {status === WebSocketStatus.CONNECTED && (
                  <button
                    onClick={() => {
                      const wsService = getWebSocketService();
                      wsService?.disconnect();
                      setShowDetailPanel(false);
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Disconnect
                  </button>
                )}

                <button
                  onClick={() => {
                    updateConnectionDetails(status);
                  }}
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;
