// /src/hooks/useAuthContext.ts
import type { User, AuthState } from "@/types/auth";

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INCREMENT_FAILED_ATTEMPTS' }
  | { type: 'RESET_FAILED_ATTEMPTS' }
  | { type: 'SET_SESSION_TIMEOUT'; payload: number }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INIT_COMPLETE' }; // Initialization completion

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        failedAttempts: 0,
        isLocked: false
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        failedAttempts: state.failedAttempts + 1,
        isLocked: state.failedAttempts >= 2 // Lock after 3 failed attempts
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        sessionTimeout: null
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INCREMENT_FAILED_ATTEMPTS':
      return { ...state, failedAttempts: state.failedAttempts + 1 };
    case 'RESET_FAILED_ATTEMPTS':
      return { ...state, failedAttempts: 0, isLocked: false };
    case 'SET_SESSION_TIMEOUT':
      return { ...state, sessionTimeout: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'INIT_COMPLETE':
      return { ...state, isLoading: false };
    default:
      return state;
  }
};
