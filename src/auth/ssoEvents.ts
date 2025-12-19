// src/auth/ssoEvents.ts
export type SSOEvent =
  | { type: "SSO_LOGIN" }
  | { type: "SSO_LOGOUT" };
