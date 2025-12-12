// src/config/api.ts
import Cookies from "js-cookie";

const getApiBaseUrl = (): string => {
  const envApi = import.meta.env.VITE_API_BASE_URL || "/api/v1";
  // console.log("API_BASE_URL:", envApi);
  if (envApi) {
    return envApi;
  }
  const allowedHosts = import.meta.env.VITE_ALLOWED_HOSTS.split(",");
  const isDevelopment = allowedHosts.includes(window.location.hostname);
  return isDevelopment && "/api/v1" || envApi;
};

export const getSsoToken = (): string | null => {
  // Cookies.set("stg_mt_mdss_accesstoken", "stg_mt_mdss_accesstoken", { expires: 1 });
  return Cookies?.get("stg_mt_mdss_accesstoken") || Cookies?.get("qa_mt_mdss_accesstoken") || null;
}

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
    PROFILE: "/auth/profile",
    ROLE_PERMISSION_BY_ROLE_ID: "/role_permission/roleId/"
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  DEMO_MODE: false
};
