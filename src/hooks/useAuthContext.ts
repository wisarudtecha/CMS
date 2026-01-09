// /src/hooks/useAuthContext.ts
import type { User, AuthState } from "@/types/auth";

type AuthAction = 
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string; refreshToken: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "REFRESH_START" }
  | { type: "REFRESH_SUCCESS"; payload: { user: User; token: string; refreshToken: string } }
  | { type: "REFRESH_FAILURE" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "INCREMENT_FAILED_ATTEMPTS" }
  | { type: "RESET_FAILED_ATTEMPTS" }
  | { type: "SET_SESSION_TIMEOUT"; payload: number }
  | { type: "SET_NETWORK_STATUS"; payload: "online" | "offline" }
  | { type: "UPDATE_LAST_ACTIVITY" }
  | { type: "CLEAR_ERROR" }
  | { type: "INIT_COMPLETE" }; // Initialization completion

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        failedAttempts: 0,
        isLocked: false,
        lastActivity: Date.now()
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        failedAttempts: state.failedAttempts + 1,
        isLocked: state.failedAttempts >= 2
      };
    case "REFRESH_START":
      return { ...state, isRefreshing: true };
    case "REFRESH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isRefreshing: false,
        lastActivity: Date.now()
      };
    case "REFRESH_FAILURE":
      return {
        ...state,
        isRefreshing: false,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
        sessionTimeout: null,
        failedAttempts: 0,
        isLocked: false
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "INCREMENT_FAILED_ATTEMPTS":
      return { ...state, failedAttempts: state.failedAttempts + 1 };
    case "RESET_FAILED_ATTEMPTS":
      return { ...state, failedAttempts: 0, isLocked: false };
    case "SET_SESSION_TIMEOUT":
      return { ...state, sessionTimeout: action.payload };
    case "SET_NETWORK_STATUS":
      return { ...state, networkStatus: action.payload };
    case "UPDATE_LAST_ACTIVITY":
      return { ...state, lastActivity: Date.now() };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "INIT_COMPLETE":
      return { ...state, isLoading: false };
    default:
      return state;
  }
};
