// /src/types/auth.ts
export interface User {
  id: string;
  // Updated: [17-07-2025] v0.1.2
  username: string;
  email?: string;
  name: string;
  role: "admin" | "manager" | "agent" | "viewer";
  department: string;
  lastLogin: Date;
  permissions: string[];
  // Updated: [17-07-2025] v0.1.2
  organization: string;
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
  // Updated: [17-07-2025] v0.1.2
  username: string;
  email?: string;
  password: string;
  // Updated: [17-07-2025] v0.1.2
  organization?: string;
  rememberMe: boolean;
  captcha?: string;
}

export interface RegisterData {
  name: string;
  // Updated: [17-07-2025] v0.1.2
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  role: string;
  // Updated: [17-07-2025] v0.1.2
  organization: string;
}

// Updated: [04-07-2025] v0.1.1
// JWT Token Interfaces
export interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
}

// Updated: [04-07-2025] v0.1.1
export interface JWTPayload {
  sub: string;
  // Updated: [17-07-2025] v0.1.2
  username: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  // Updated: [17-07-2025] v0.1.2
  organization: string;
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
  jti?: string;
}

// Updated: [04-07-2025] v0.1.1
export interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}

// Updated: [04-07-2025] v0.1.1
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  user?: User;
  errors: string[];
  expiresAt?: Date;
  issuedAt?: Date;
}
