// /src/utils/constants.ts
/**
 * Application Constants
 */
import { AlertHexaIcon, CheckCircleIcon, TimeIcon } from "@/icons";

export const APP_CONFIG = {
  NAME: "CMS - Case Management System",
  VERSION: "1.0.0",
  // Environment-based API configuration
  API_BASE_URL: (() => {
    // if (import.meta.env.DEV) {
    //   return "/api/v1";
    // }
    return import.meta.env.VITE_API_BASE_URL || "/api/v1";
  })(),

  WS_URL: import.meta.env.VITE_WS_URL,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
  },
  TICKETS: {
    LIST: "/tickets",
    CREATE: "/tickets",
    UPDATE: "/tickets/:id",
    DELETE: "/tickets/:id",
    ASSIGN: "/tickets/:id/assign",
    COMMENT: "/tickets/:id/comments",
  },
  WORKFLOWS: {
    LIST: "/workflows",
    CREATE: "/workflows",
    UPDATE: "/workflows/:id",
    DELETE: "/workflows/:id",
    EXECUTE: "/workflows/:id/execute",
    TEMPLATES: "/workflows/templates",
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: "/notifications/:id/read",
    PREFERENCES: "/notifications/preferences",
  },
} as const;

export const AUTO_DELETE_OPTIONS = [1, 3, 5, 7, 15, 30] as const;

export const CASE_CANNOT_DELETE = ["S007", "S013", "S014", "S016"] as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
} as const;

// CORS-safe endpoints for development
export const CORS_SAFE_ENDPOINTS = [
  "/health",
  "/status",
  "/version",
] as const;

// Development configuration
export const DEV_CONFIG = {
  MOCK_API: import.meta.env.VITE_MOCK_API === "true",
  API_DELAY: parseInt(import.meta.env.VITE_API_DELAY || "0"),
  ENABLE_DEVTOOLS: import.meta.env.DEV,
} as const;

export const PERMISSIONS = {
  TICKETS: {
    READ: "tickets:read",
    CREATE: "tickets:create",
    UPDATE: "tickets:update",
    DELETE: "tickets:delete",
    ASSIGN: "tickets:assign",
  },
  WORKFLOWS: {
    READ: "workflows:read",
    CREATE: "workflows:create",
    UPDATE: "workflows:update",
    DELETE: "workflows:delete",
    EXECUTE: "workflows:execute",
  },
  USERS: {
    READ: "users:read",
    CREATE: "users:create",
    UPDATE: "users:update",
    DELETE: "users:delete",
  },
  ADMIN: {
    SYSTEM: "admin:system",
    USERS: "admin:users",
    SETTINGS: "admin:settings",
  },
} as const;

export const POPUP_AUTO_DISMISS_MS = 10000 as const; // แต่ละป็อปอัปโชว์ 10 วิ
export const POPUP_GROUP_AUTO_CLOSE_MS = 8000 as const; // ปิดทั้งชุดใน 8 วิ
export const POPUP_TRANSITION_MS = 300 as const; // animation 300ms (ต้องตรงกับ duration-300)

// export const PRIORITY_COLORS = {
//   low: "text-gray-600 bg-gray-50",
//   medium: "text-blue-600 bg-blue-50",
//   high: "text-orange-600 bg-orange-50",
//   urgent: "text-red-600 bg-red-50",
// } as const;

export const PRIORITY_COLORS = {
  low: "text-green-600 dark:text-green-300",
  medium: "text-yellow-600 dark:text-yellow-300",
  high: "text-red-600 dark:text-red-300",
  urgent: "text-red-600 dark:text-red-300",
} as const;

export const PRIORITY_LABELS = {
  low: {
    th: "ต่ำ",
    en: "Low",
  },
  medium: {
    th: "ปานกลาง",
    en: "Medium",
  },
  high: {
    th: "สูง",
    en: "High",
  },
  urgent: {
    th: "สูงสุด",
    en: "Urgent",
  }
} as const;

export const PRIORITY_CONFIG = [
  { type: 'high', count: 4, color: PRIORITY_COLORS.high, icon: AlertHexaIcon },
  { type: 'medium', count: 3, color: PRIORITY_COLORS.medium, icon: TimeIcon },
  { type: 'low', count: 3, color: PRIORITY_COLORS.low, icon: CheckCircleIcon },
] as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  TICKETS: "/tickets",
  WORKFLOWS: "/workflows",
  USERS: "/users",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const SLA_STATUS_COLORS = {
  on_time: "text-green-600 bg-green-50",
  warning: "text-yellow-600 bg-yellow-50",
  breached: "text-red-600 bg-red-50",
} as const;

export const SOP_TIMELINES_STATUS = ["S008", "S009", "S010", "S011", "S012", "S013", "S014"] as const;

export const STATUS_COLORS = {
  open: "text-blue-600 bg-blue-50",
  in_progress: "text-yellow-600 bg-yellow-50",
  pending: "text-orange-600 bg-orange-50",
  resolved: "text-green-600 bg-green-50",
  closed: "text-gray-600 bg-gray-50",
} as const;

export const SYSTEM_ROLE = "d6381714-8e89-47de-9d16-859131cdc5dc" as const;

export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: {
      50: "#eff6ff",
      100: "#dbeafe",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      900: "#1e3a8a",
    },
    SUCCESS: {
      50: "#f0fdf4",
      500: "#22c55e",
      700: "#15803d",
    },
    WARNING: {
      50: "#fffbeb",
      500: "#f59e0b",
      700: "#d97706",
    },
    ERROR: {
      50: "#fef2f2",
      500: "#ef4444",
      700: "#dc2626",
    },
  },
  BREAKPOINTS: {
    xs: "320px",
    sm: "768px",
    md: "1024px",
    lg: "1280px",
    xl: "1920px",
  },
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  // PHONE: /^\+?[\d\s\-\(\)]+$/,
  PHONE: /^\+?[\d\s\-()]+$/,
} as const;

export const WEBSOCKET = import.meta.env.VITE_WEBSOCKET_BASE_URL;
