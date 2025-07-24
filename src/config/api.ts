// src/config/api.ts
const getApiBaseUrl = (): string => {
  // In a real app, would set this via environment variables during build
  // For demo purposes, use a mock API or detect environment
  const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  if (isDevelopment) {
    return "/api/v1"; // Local development API
  }
  
  // Production API - replace with actual API URL
  return "https://localhost:8080/api/v1"; // Local development API
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    VERIFY: "/auth/verify",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    PROFILE: "/auth/profile"
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  // Demo mode - when true, uses mock responses instead of real API calls
  DEMO_MODE: false
};