// /src/components/dashboard/LiveDashboard.tsx
import React, { useEffect, useState } from "react";
// import { useWebSocket } from "@/components/websocket/websocket";
import { useRealTimeSync } from "@/hooks/useRealTimeSync";
// import { getRealTimeSyncService } from "@/services/realtime-sync.service";
import { getWebSocketService, WebSocketStatus } from "@/services/websocket.service";
// import { WEBSOCKET } from "@/utils/constants";
import ConnectionStatusIndicator from "@/components/common/ConnectionStatusIndicator"; 
// import ActiveCasesList from "@/components/dashboard/ActiveCasesList";
// import CaseStatistics from "@/components/dashboard/CaseStatistics";
// import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
// import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
// import RecentActivity from "@/components/dashboard/RecentActivity";
// import UserActivityPanel from "@/components/dashboard/UserActivityPanel";

export interface Activity {
  id: string;
  description: string;
  entityId: string;
  entityType: string;
  timestamp: string;
  type: string;
  userId: string;
}

export interface Case {
  id: string;
  assignedTo: string;
  priority: string;
  status: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardConfig {
  enableNotifications?: boolean;
  enablePerformanceMetrics?: boolean;
  enableUserActivity?: boolean;
  maxActiveCases?: number;
  maxRecentActivities?: number;
  refreshInterval?: number;
}

export interface LiveDashboardProps {
  className?: string;
  config?: DashboardConfig;
  userId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  userId: string;
  read: boolean;
  createdAt: string;
}

export interface PerformanceMetric {
  id: string;
  category: "response_time" | "throughput" | "error_rate" | "resource_usage";
  metric: string;
  timestamp: string;
  unit: string;
  value: number;
}

export interface UserSession {
  id: string;
  currentPage?: string;
  lastActivity: string;
  status: "online" | "offline" | "away";
  userId: string;
  userName: string;
}

const defaultConfig: Required<DashboardConfig> = {
  enableNotifications: true,
  enablePerformanceMetrics: true,
  enableUserActivity: true,
  maxActiveCases: 10,
  maxRecentActivities: 20,
  refreshInterval: 30000, // 30 seconds
};

const LiveDashboard: React.FC<LiveDashboardProps> = ({
  className = "",
  config = {},
  // userId
}) => {
  // const { connectionState, isConnected, connect, subscribe } = useWebSocket();

  // useEffect(() => {
  //   console.log(connectionState, isConnected);

  //   if (connectionState === 'disconnected') {
  //     connect({
  //       url: `${WEBSOCKET}/api/v1/notifications/register`,
  //       reconnectInterval: 5000,
  //       maxReconnectAttempts: 10,
  //       heartbeatInterval: 60000
  //     });
  //   }
  // });

  // useEffect(() => {
  //   const listener = subscribe(message => {
  //     try {
  //       if (message?.data) {
  //         const data = message.data;
  //         if (data?.additionalJson?.event === "Update") {
  //           (async () => {
  //             const caseIdFromUrl = data?.redirectUrl?.split('/case/')[1];
  //             if (caseIdFromUrl) {
  //               console.log("Update", caseIdFromUrl);
  //             }
  //           })();
  //         }
  //         else if (data?.additionalJson?.event === "STATUS UPDATE") {
  //           (async () => {
  //             if (data?.additionalJson?.caseId) {
  //               console.log("STATUS UPDATE", data?.additionalJson?.caseId);
  //             }
  //           })();
  //         }
  //       }
  //     }
  //     catch (error) {
  //       console.error("Error processing WebSocket message:", error);
  //     }
  //   });

  //   return () => {
  //     listener();
  //   };
  // }, [subscribe, connect, connectionState, isConnected]);

  const finalConfig = { ...defaultConfig, ...config };
  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>(WebSocketStatus.DISCONNECTED);
  // const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [lastUpdate, ] = useState<Date>(new Date());

  // Initialize real-time sync for different entity types
  // Initialize real-time sync for different entity types with proper typing
  const { 
    entities: cases, 
    loading: casesLoading, 
    error: casesError,
    refresh: refreshCases 
  } = useRealTimeSync<Case>("cases", {
    syncInterval: finalConfig.refreshInterval
  });

  const { 
    entities: activities, 
    loading: activitiesLoading,
    refresh: refreshActivities
  } = useRealTimeSync<Activity>("activities", {
    syncInterval: finalConfig.refreshInterval
  });

  const { 
    entities: notifications,
    refresh: refreshNotifications
  } = useRealTimeSync<Notification>("notifications", {
    syncInterval: finalConfig.refreshInterval
  });

  const { 
    entities: userSessions,
    refresh: refreshUserSessions
  } = useRealTimeSync<UserSession>("user-sessions", {
    syncInterval: finalConfig.refreshInterval
  });

  const { 
    entities: metrics,
    refresh: refreshMetrics
  } = useRealTimeSync<PerformanceMetric>("performance-metrics", {
    syncInterval: finalConfig.refreshInterval
  });

  useEffect(() => {
    const wsService = getWebSocketService();
    if (wsService) {
      // Subscribe to connection status changes
      const unsubscribe = wsService.onStatusChange((status) => {
        setConnectionStatus(status);
      });

      // Set initial status
      setConnectionStatus(wsService.getStatus());

      return unsubscribe;
    }
  }, []);

  useEffect(() => {
    // Update last update time when any data changes
    // setLastUpdate(new Date());
  }, [cases, activities, notifications, userSessions, metrics]);

  const handleRefreshAll = () => {
    refreshCases();
    refreshActivities();
    refreshNotifications();
    if (finalConfig.enableUserActivity) {
      refreshUserSessions();
    }
    if (finalConfig.enablePerformanceMetrics) {
      refreshMetrics();
    }
  };

  const isLoading = casesLoading || activitiesLoading;
  const hasError = casesError !== null;

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Case Management Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectionStatusIndicator 
                status={connectionStatus}
                className="mr-4"
              />
              <button
                onClick={handleRefreshAll}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                There was an error loading dashboard data. Some information may be outdated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Stats and Cases */}
          <div className="lg:col-span-3 space-y-6">
            {/* Case Statistics */}
            {/* <CaseStatistics 
              cases={Object.values(cases)}
              loading={casesLoading}
              className="bg-white rounded-lg shadow"
            /> */}

            {/* Active Cases List */}
            {/* <ActiveCasesList
              cases={Object.values(cases)}
              loading={casesLoading}
              maxItems={finalConfig.maxActiveCases}
              className="bg-white rounded-lg shadow"
            /> */}

            {/* Performance Metrics */}
            {/* {finalConfig.enablePerformanceMetrics && (
              <PerformanceMetrics
                metrics={Object.values(metrics)}
                className="bg-white rounded-lg shadow"
              />
            )} */}
          </div>

          {/* Right Column - Activity and Notifications */}
          <div className="lg:col-span-1 space-y-6">
            {/* Notifications Panel */}
            {/* {finalConfig.enableNotifications && (
              <NotificationsPanel
                notifications={Object.values(notifications)}
                userId={userId}
                className="bg-white rounded-lg shadow"
              />
            )} */}

            {/* Recent Activity */}
            {/* <RecentActivity
              activities={Object.values(activities)}
              loading={activitiesLoading}
              maxItems={finalConfig.maxRecentActivities}
              className="bg-white rounded-lg shadow"
            /> */}

            {/* User Activity Panel */}
            {/* {finalConfig.enableUserActivity && (
              <UserActivityPanel
                userSessions={Object.values(userSessions)}
                currentUserId={userId}
                className="bg-white rounded-lg shadow"
              />
            )} */}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-900 font-medium">Loading dashboard data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDashboard;
