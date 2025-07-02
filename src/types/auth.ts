// /src/types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'agent' | 'viewer';
  department: string;
  lastLogin: Date;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionTimeout: number | null;
  failedAttempts: number;
  isLocked: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
  captcha?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  role: string;
}
