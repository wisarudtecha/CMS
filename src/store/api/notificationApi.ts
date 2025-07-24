// /src/store/api/notificationApi.ts
/**
 * Notification System API Endpoints
 * Real-time notifications, preferences, and push notifications
 */

import { baseApi } from "@/store/api/baseApi";
import type { 
  Notification, 
  NotificationPreferences,
  NotificationChannel,
  ApiResponse 
} from "@/types";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Notification management
    getNotifications: builder.query<ApiResponse<Notification[]>, {
      page?: number;
      limit?: number;
      type?: string;
      isRead?: boolean;
      priority?: string;
    }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/notifications?${searchParams.toString()}`;
      },
      providesTags: ["Notification"],
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
    }),

    markAsRead: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    clearAllNotifications: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: "/notifications/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Notification preferences
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => "/notifications/preferences",
    }),

    updateNotificationPreferences: builder.mutation<ApiResponse<NotificationPreferences>, Partial<NotificationPreferences>>({
      query: (preferences) => ({
        url: "/notifications/preferences",
        method: "PUT",
        body: preferences,
      }),
    }),

    // Push notification subscription
    subscribeToPush: builder.mutation<ApiResponse<void>, {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    }>({
      query: (subscription) => ({
        url: "/notifications/push/subscribe",
        method: "POST",
        body: subscription,
      }),
    }),

    unsubscribeFromPush: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: "/notifications/push/unsubscribe",
        method: "POST",
      }),
    }),

    // Test notifications (admin)
    sendTestNotification: builder.mutation<ApiResponse<void>, {
      userId?: string;
      type: string;
      title: string;
      message: string;
      channels: NotificationChannel[];
    }>({
      query: (data) => ({
        url: "/notifications/test",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useSubscribeToPushMutation,
  useUnsubscribeFromPushMutation,
  useSendTestNotificationMutation,
} = notificationApi;
