// /src/providers/AuthProvider.tsx
import React, { useReducer, useEffect, useState } from "react";
import type {
  // User,
  LoginCredentials,
  RegisterData
} from "@/types/auth";
import { AuthContext } from "@/context/AuthContext";
import { AuthService } from "@/services/authService";
import { TokenManager } from "@/utils/tokenManager";
import { authReducer } from "@/hooks/useAuthContext";
// Updated: [06-07-2025] v0.1.1
import type { AuthState } from "@/types/auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Updated: [06-07-2025] v0.1.1
  const getInitialAuthState = (): AuthState => {
    console.log('🔍 Pre-checking auth state...');
    const token = TokenManager.getToken();
    
    if (token) {
      const validation = TokenManager.validateToken(token);
      console.log('🔍 Token validation result:', validation);
      
      if (validation.isValid && !validation.isExpired && validation.user) {
        console.log('✅ Valid token found during initialization');
        return {
          user: validation.user,
          token: token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          sessionTimeout: null,
          failedAttempts: 0,
          isLocked: false
        };
      }
      else {
        console.log('❌ Invalid or expired token found:', validation.errors);
        TokenManager.clearTokens();
      }
    }
    else {
      console.log('❌ No token found during initialization');
    }
    
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionTimeout: null,
      failedAttempts: 0,
      isLocked: false
    };
  };

  // const [state, dispatch] = useReducer(authReducer, {
  //   user: null,
  //   token: null,
  //   isAuthenticated: false,
  //   isLoading: true, // Start with loading true to check stored tokens
  //   error: null,
  //   sessionTimeout: null,
  //   failedAttempts: 0,
  //   isLocked: false
  // });

  // Updated: [06-07-2025] v0.1.1
  const [state, dispatch] = useReducer(authReducer, getInitialAuthState());

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
  // useEffect(() => {
  //   const initializeAuth = async () => {
  //     try {
  //       const token = TokenManager.getToken();

  //       if (token && !TokenManager.isTokenExpired(token)) {
  //         // In real app, validate token with server
  //         // For demo, we'll simulate server validation
  //         await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call

  //         const mockUser: User = {
  //           id: '1',
  //           email: 'admin@cms.com',
  //           name: 'Admin User',
  //           role: 'admin',
  //           department: 'IT',
  //           lastLogin: new Date(),
  //           permissions: ['read', 'write', 'delete', 'admin']
  //         };

  //         dispatch({ type: 'LOGIN_SUCCESS', payload: { user: mockUser, token } });
  //       }
  //       else {
  //         // Token doesn't exist or is expired
  //         TokenManager.clearTokens();
  //       }
  //     }
  //     catch (error) {
  //       console.error('Auth initialization error:', error);
  //       TokenManager.clearTokens();
  //     }
  //     finally {
  //       // Always complete initialization
  //       dispatch({ type: 'INIT_COMPLETE' });
  //     }
  //   };

  //   initializeAuth();
  // }, []);

  // Auto token refresh when about to expire
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (state.isAuthenticated && state.token) {
      refreshInterval = setInterval(() => {
        const token = TokenManager.getToken();
        if (token && TokenManager.shouldRefreshToken(token)) {
          console.log('🔄 Token about to expire, refreshing...');
          refreshToken();
        }
      }, 60000); // Check every minute
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.isAuthenticated
  ]);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const { user, token, refreshToken } = await AuthService.login(credentials);

      // Updated: [06-07-2025] v0.1.1
      // Validate the received token
      const validation = TokenManager.validateToken(token);
      if (!validation.isValid) {
        throw new Error('Received invalid token from server');
      }

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
      // Updated: [06-07-2025] v0.1.1
      console.log('❌ No refresh token available');

      logout();
      return;
    }

    try {
      const { token: newToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(refreshToken);

      // Updated: [06-07-2025] v0.1.1
      // Validate new token
      const validation = TokenManager.validateToken(newToken);
      if (!validation.isValid || !validation.user) {
        throw new Error('Received invalid token during refresh');
      }

      TokenManager.setTokens(newToken, newRefreshToken);

      // Updated: [06-07-2025] v0.1.1
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: validation.user, token: newToken } });
      
      // Updated: [06-07-2025] v0.1.1
      console.log('✅ Token refreshed successfully');
    }
    catch (error) {
      // console.error(error);
      // Updated: [06-07-2025] v0.1.1
      console.error('❌ Token refresh failed:', error);
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
