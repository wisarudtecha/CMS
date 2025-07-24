// /src/store/index.ts
/**
 * Core State Management Configuration
 * Redux Toolkit setup with RTK Query integration
 */

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
// Import the base API
import { baseApi } from "@/store/api/baseApi";

// import { authApi } from "@/store/api/authApi";
// import { ticketApi } from "@/store/api/ticketApi";
// import { workflowApi } from "@/store/api/workflowApi";
// import { userApi } from "@/store/api/userApi";
// import { notificationApi } from "@/store/api/notificationApi";
// import { fileApi } from "@/store/api/fileApi";
import "@/store/api/authApi";
import "@/store/api/ticketApi";
import "@/store/api/workflowApi";
import "@/store/api/userApi";
import "@/store/api/notificationApi";
import "@/store/api/fileApi";

// Import regular slices
import authSlice from "@/store/slices/authSlice";
import ticketSlice from "@/store/slices/ticketSlice";
import workflowSlice from "@/store/slices/workflowSlice";
import notificationSlice from "@/store/slices/notificationSlice";
import uiSlice from "@/store/slices/uiSlice";
import realtimeSlice from "@/store/slices/realtimeSlice";

export const store = configureStore({
  reducer: {
    // RTK Query API slice - CRITICAL: This must match the reducerPath in baseApi
    [baseApi.reducerPath]: baseApi.reducer,
    
    // Regular slices
    auth: authSlice,
    tickets: ticketSlice,
    workflows: workflowSlice,
    notifications: notificationSlice,
    ui: uiSlice,
    realtime: realtimeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER"
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates"],
      },
    })
    // CRITICAL: Add the RTK Query middleware - this was missing!
    .concat(baseApi.middleware),

  devTools: process.env.NODE_ENV !== "production",

  // Enhanced dev tools configuration
  // enhancers: (defaultEnhancers) =>
  //   process.env.NODE_ENV !== "production"
  //     ? defaultEnhancers
  //     : defaultEnhancers,
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the store as default for easier importing
export default store;
