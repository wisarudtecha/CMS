// /src/providers/AuthProvider.tsx
import React, { useReducer, useEffect, useState } from "react";
import type { User, LoginCredentials, RegisterData } from "@/types/auth";
import { AuthContext } from "@/context/AuthContext";
import { AuthService } from "@/services/authService";
import { TokenManager } from "@/utils/tokenManager";
import { authReducer } from "@/hooks/useAuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading true to check stored tokens
    error: null,
    sessionTimeout: null,
    failedAttempts: 0,
    isLocked: false
  });

  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  const logout = React.useCallback(async () => {
    try {
      await AuthService.logout();
    }
    catch (error) {
      console.error('Logout error:', error);
    }
    finally {
      TokenManager.clearTokens();
      dispatch({ type: 'LOGOUT' });
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    }
  }, [sessionTimer]);

  // Session timeout management
  useEffect(() => {
    const setupSessionTimeout = () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }

      const timer = setTimeout(() => {
        dispatch({ type: 'SET_SESSION_TIMEOUT', payload: Date.now() + 60000 }); // 1 minute warning

        setTimeout(() => {
          logout();
        }, 60000);
      }, 15 * 60 * 1000); // 15 minutes

      setSessionTimer(timer);
    };

    if (state.isAuthenticated) {
      setupSessionTimeout();
    }

    return () => {
      if (sessionTimer) clearTimeout(sessionTimer);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.isAuthenticated,
    // logout,
    // sessionTimer
  ]);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = TokenManager.getToken();

        if (token && !TokenManager.isTokenExpired(token)) {
          // In real app, validate token with server
          // For demo, we'll simulate server validation
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call

          const mockUser: User = {
            id: '1',
            email: 'admin@cms.com',
            name: 'Admin User',
            role: 'admin',
            department: 'IT',
            lastLogin: new Date(),
            permissions: ['read', 'write', 'delete', 'admin']
          };

          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: mockUser, token } });
        }
        else {
          // Token doesn't exist or is expired
          TokenManager.clearTokens();
        }
      }
      catch (error) {
        console.error('Auth initialization error:', error);
        TokenManager.clearTokens();
      }
      finally {
        // Always complete initialization
        dispatch({ type: 'INIT_COMPLETE' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const { user, token, refreshToken } = await AuthService.login(credentials);

      TokenManager.setTokens(token, refreshToken, credentials.rememberMe);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      dispatch({ type: 'RESET_FAILED_ATTEMPTS' });
    }
    catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: (error as Error).message });
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const { user, token, refreshToken } = await AuthService.register(data);

      TokenManager.setTokens(token, refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    }
    catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: (error as Error).message });
    }
  };

  const refreshToken = async () => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const { token: newToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(refreshToken);
      TokenManager.setTokens(newToken, newRefreshToken);
    }
    catch (error) {
      console.error(error);
      logout();
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      register,
      logout,
      refreshToken,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
