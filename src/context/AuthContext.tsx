// /src/context/AuthContext.tsx
import { createContext } from "react";
import type { AuthState, LoginCredentials, RegisterData } from "@/types/auth";

export const AuthContext = createContext<{
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
} | null>(null);
