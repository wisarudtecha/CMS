// /src/config/api.ts
import Cookies from "js-cookie";

type RuntimeEnv = "local" | "stg" | "qa" | "prod";

const resolveRuntimeEnv = (): RuntimeEnv => {
  const env = import.meta.env.VITE_ENV;
  if (env?.includes("local")) return "local";
  if (env?.includes("staging")) return "stg";
  if (env?.includes("quality")) return "qa";
  if (env === "production") return "prod";
  throw new Error(`Unsupported VITE_ENV: ${env}`);
};

const COOKIE_PREFIX_MAP: Record<RuntimeEnv, string> = {
  local: "",
  stg: "stg_mt_mdss",
  qa: "qa_mt_mdss",
  prod: "bma_mt_mdss"
};

const getCookieName = (key: string): string => {
  const env = resolveRuntimeEnv();
  return `${COOKIE_PREFIX_MAP[env]}_${key}`;
};

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



export interface SSOCookie {
  accessToken: string | null;
  disabled_audio: string | null;
  refreshToken: string | null;
  tokenExpireTime: string | null;
  workspace: string | null;
}

export const getSSOCookie = (): SSOCookie => {
  return {
    accessToken: Cookies.get(getCookieName("accesstoken")) || null,
    disabled_audio: Cookies.get(getCookieName("disabled_audio")) || null,
    refreshToken: Cookies.get(getCookieName("refreshtoken")) || null,
    tokenExpireTime: Cookies.get(getCookieName("token_expire_time")) || null,
    workspace: Cookies.get(getCookieName("workspace")) || null,
  };

  // return {
  //   accessToken: Cookies?.get("bma_mt_mdss_accesstoken") || Cookies?.get("qa_mt_mdss_accesstoken") || Cookies?.get("stg_mt_mdss_accesstoken") || null,
  //   disabled_audio: Cookies?.get("bma_mt_mdss_disabled_audio") || Cookies?.get("qa_mt_mdss_disabled_audio") || Cookies?.get("stg_mt_mdss_disabled_audio") || null,
  //   refreshToken: Cookies?.get("bma_mt_mdss_refreshtoken") || Cookies?.get("qa_mt_mdss_refreshtoken") || Cookies?.get("stg_mt_mdss_refreshtoken") || null,
  //   tokenExpireTime: Cookies?.get("bma_mt_mdss_token_expire_time") || Cookies?.get("qa_mt_mdss_token_expire_time") || Cookies?.get("stg_mt_mdss_token_expire_time") || null,
  //   workspace: Cookies?.get("bma_mt_mdss_workspace") || Cookies?.get("qa_mt_mdss_workspace") || Cookies?.get("stg_mt_mdss_workspace") || null,
  // }
}

export const forceSSOLogout = (): void => {
  const keys = [
    "accesstoken",
    "disabled_audio",
    "refreshtoken",
    "token_expire_time",
    "workspace"
  ];

  keys.forEach(key => {
    Cookies.remove(getCookieName(key));
  });

  // Production cookies
  // Cookies.remove("bma_mt_mdss_accesstoken");
  // Cookies.remove("bma_mt_mdss_disabled_audio");
  // Cookies.remove("bma_mt_mdss_refreshtoken");
  // Cookies.remove("bma_mt_mdss_token_expire_time");
  // Cookies.remove("bma_mt_mdss_workspace");
  // QA cookies
  // Cookies.remove("qa_mt_mdss_accesstoken");
  // Cookies.remove("qa_mt_mdss_disabled_audio");
  // Cookies.remove("qa_mt_mdss_refreshtoken");
  // Cookies.remove("qa_mt_mdss_token_expire_time");
  // Cookies.remove("qa_mt_mdss_workspace");
  // Staging cookies
  // Cookies.remove("stg_mt_mdss_accesstoken");
  // Cookies.remove("stg_mt_mdss_disabled_audio");
  // Cookies.remove("stg_mt_mdss_refreshtoken");
  // Cookies.remove("stg_mt_mdss_token_expire_time");
  // Cookies.remove("stg_mt_mdss_workspace");
}

export const isSSOAvailable = (): string | null => {
  const sso = getSSOCookie();
  if (sso.accessToken && sso.refreshToken && sso.tokenExpireTime && sso.workspace) {
    return sso.accessToken;
  }
  forceSSOLogout();
  return null;

  // const MT_MDSS = getSSOCookie();
  // if (MT_MDSS.accessToken && MT_MDSS.refreshToken && MT_MDSS.tokenExpireTime && MT_MDSS.workspace) {
  //   return MT_MDSS.accessToken;
  // }
  // forceSSOLogout();
  // return null;
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
