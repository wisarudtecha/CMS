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

// Debug only - Setting SSO cookies for staging environment
// Cookies.set("stg_mt_mdss_accesstoken", "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmxlSEFpT2pFM05qVTVORFU0TkRnc0ltOXlaMGxrSWpvaU5ETTBZekJtTVRZdFlqZGxZUzAwWVRkaUxXRTNOR0l0WlRKbE1HWTROVGxtTlRRNUlpd2lkWE5sY201aGJXVWlPaUpoWkcxcGJpSjkudjdydDlKRXdWM05nZHNjVm9faHRKUTBfUGtiaFB6UHg3Zlptd2t0UUtJcw==", { expires: 1 });
// Cookies.set("stg_mt_mdss_refreshtoken", "eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJjMTY1ZDg3NS00ZWRkLTQ1MGEtOTU2Zi01MjhlMzFhMjkzMDcifQ.eyJleHAiOjE3NjYwMjg2MzAsImlhdCI6MTc2NTk0MjIzMCwianRpIjoiMzBhY2EyYjgtZWRjYi0yZGE1LWM3ZjgtMWM4YWQxM2Y0ZjRiIiwiaXNzIjoiaHR0cHM6Ly9hdXRoa2V5LXN0Zy5tZXR0aGllci5haTo2NTAwMC9yZWFsbXMvTUVUVENPUkUiLCJhdWQiOiJodHRwczovL2F1dGhrZXktc3RnLm1ldHRoaWVyLmFpOjY1MDAwL3JlYWxtcy9NRVRUQ09SRSIsInN1YiI6IjljOTgzOTg0LTlhYzYtNGFkZi05ODkzLTYxYTAxYTY1ZDE5OCIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJtZXR0cmlxIiwic2lkIjoiYjU4YWM3YjktMjg5OC00ZTcyLTg2ZjktM2Y5ZTlkODlmZjk0Iiwic2NvcGUiOiJhY3Igd2ViLW9yaWdpbnMgcHJvZmlsZSByb2xlcyBBdWRpZW5jZSBzZXJ2aWNlX2FjY291bnQgZW1haWwgYmFzaWMifQ.lmIXbEqmO1WrzSJi4e3M2G9JlQJzrITrR0AqIxuW2SejF4cqwkJkE2ynxcG0gzVLWBQldzozDQDAQIdKbeH86w", { expires: 1 });
// Cookies.set("stg_mt_mdss_token_expire_time", "1765945830", { expires: 1 });
// Cookies.set("stg_mt_mdss_workspace", "bma", { expires: 1 });

export interface SSOCookie {
  accessToken: string | null;
  disabled_audio: string | null;
  refreshToken: string | null;
  tokenExpireTime: string | null;
  workspace: string | null;
}

export const getSSOCookie = (): SSOCookie => {
  return {
    accessToken: Cookies?.get("bma_mt_mdss_accesstoken") || Cookies?.get("qa_mt_mdss_accesstoken") || Cookies?.get("stg_mt_mdss_accesstoken") || null,
    disabled_audio: Cookies?.get("bma_mt_mdss_disabled_audio") || Cookies?.get("qa_mt_mdss_disabled_audio") || Cookies?.get("stg_mt_mdss_disabled_audio") || null,
    refreshToken: Cookies?.get("bma_mt_mdss_refreshtoken") || Cookies?.get("qa_mt_mdss_refreshtoken") || Cookies?.get("stg_mt_mdss_refreshtoken") || null,
    tokenExpireTime: Cookies?.get("bma_mt_mdss_token_expire_time") || Cookies?.get("qa_mt_mdss_token_expire_time") || Cookies?.get("stg_mt_mdss_token_expire_time") || null,
    workspace: Cookies?.get("bma_mt_mdss_workspace") || Cookies?.get("qa_mt_mdss_workspace") || Cookies?.get("stg_mt_mdss_workspace") || null,
  }
}

export const forceSSOLogout = (): void => {
  // Production cookies
  Cookies.remove("bma_mt_mdss_accesstoken");
  Cookies.remove("bma_mt_mdss_disabled_audio");
  Cookies.remove("bma_mt_mdss_refreshtoken");
  Cookies.remove("bma_mt_mdss_token_expire_time");
  Cookies.remove("bma_mt_mdss_workspace");

  // QA cookies
  Cookies.remove("qa_mt_mdss_accesstoken");
  Cookies.remove("qa_mt_mdss_disabled_audio");
  Cookies.remove("qa_mt_mdss_refreshtoken");
  Cookies.remove("qa_mt_mdss_token_expire_time");
  Cookies.remove("qa_mt_mdss_workspace");

  // Staging cookies
  Cookies.remove("stg_mt_mdss_accesstoken");
  Cookies.remove("stg_mt_mdss_disabled_audio");
  Cookies.remove("stg_mt_mdss_refreshtoken");
  Cookies.remove("stg_mt_mdss_token_expire_time");
  Cookies.remove("stg_mt_mdss_workspace");
}

export const isSSOAvailable = (): string | null => {
  const MT_MDSS = getSSOCookie();
  if (MT_MDSS.accessToken && MT_MDSS.refreshToken && MT_MDSS.tokenExpireTime && MT_MDSS.workspace) {
    return MT_MDSS.accessToken;
  }
  forceSSOLogout();
  return null;
}

export const isSSOLogout = (): string | null => {
  const MT_MDSS = getSSOCookie();
  if (!MT_MDSS.accessToken && !MT_MDSS.refreshToken && !MT_MDSS.workspace) {
    forceSSOLogout();
    return MT_MDSS.tokenExpireTime;
  }
  return null;
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
