// /src/providers/AuthProvider.tsx
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { caseApiSetup } from "@/components/case/uitls/CaseApiManager";
import { useToastContext } from "@/components/crud/ToastGlobal";
import { AuthContext } from "@/context/AuthContext";
import { authReducer } from "@/hooks/useAuthContext";
import { AuthService } from "@/utils/authService";
import { AUTH_LOCK_KEY, SESSION_TIMEOUT_TIMER, SESSION_TIMEOUT_WARNING } from "@/utils/constants";
import { TokenManager } from "@/utils/tokenManager";
import type { AuthState, LoginCredentials, RegisterData } from "@/types/auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialAuthState = (): AuthState => {
    // console.log("🔍 Initializing auth state...");
    const isAuthLocked = sessionStorage.getItem(AUTH_LOCK_KEY) === "true";
    if (isAuthLocked) {
      return {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isRefreshing: false,
        error: null,
        sessionTimeout: null,
        failedAttempts: 0,
        isLocked: true, // <-- true so UI can detect locked state if needed
        networkStatus: navigator.onLine ? "online" : "offline",
        lastActivity: Date.now()
      };
    }

    const token = TokenManager.getToken();
    const user = TokenManager.getStoredUser();
    if (token && user && !TokenManager.isTokenExpired(token)) {
      // console.log("✅ Valid session found during initialization");
      // If user doesn't have the new structure, create it with proper permissions
      if (!user.orgId || !user.roleId) {
        const updatedUser = AuthService.createMockUser(user.username);
        TokenManager.setTokens(
          token,
          TokenManager.getRefreshToken() || "",
          // false,
          true,
          updatedUser
        );
        return {
          user: updatedUser,
          token,
          refreshToken: TokenManager.getRefreshToken(),
          isAuthenticated: true,
          isLoading: false,
          isRefreshing: false,
          error: null,
          sessionTimeout: null,
          failedAttempts: 0,
          isLocked: false,
          networkStatus: navigator.onLine ? "online" : "offline",
          lastActivity: Date.now()
        };
      }
      return {
        user,
        token,
        refreshToken: TokenManager.getRefreshToken(),
        isAuthenticated: true,
        isLoading: false,
        isRefreshing: false,
        error: null,
        sessionTimeout: null,
        failedAttempts: 0,
        isLocked: false,
        networkStatus: navigator.onLine ? "online" : "offline",
        lastActivity: Date.now()
      };
    }
    else {
      // console.log("❌ No valid session found during initialization");
      if (token) {
        // TokenManager.clearTokens();
      }
      return {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isRefreshing: false,
        error: null,
        sessionTimeout: null,
        failedAttempts: 0,
        isLocked: false,
        networkStatus: navigator.onLine ? "online" : "offline",
        lastActivity: Date.now()
      };
    }
  };

  const [state, dispatch] = useReducer(authReducer, getInitialAuthState());
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const {addToast}=useToastContext();
  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => dispatch({ type: "SET_NETWORK_STATUS", payload: "online" });
    const handleOffline = () => dispatch({ type: "SET_NETWORK_STATUS", payload: "offline" });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Activity tracking
  useEffect(() => {
    const updateActivity = () => dispatch({ type: "UPDATE_LAST_ACTIVITY" });
    
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // const logout = React.useCallback(async () => {
  //   try {
  //     // await AuthService.logout();
  //   }
  //   catch (error) {
  //     console.error("Logout error:", error);
  //   }
  //   finally {
  //     TokenManager.clearTokens();
  //     dispatch({ type: "LOGOUT" });
  //     if (sessionTimer) {
  //       clearTimeout(sessionTimer);
  //     }
  //     if (refreshTimer) {
  //       clearTimeout(refreshTimer);
  //     }
  //   }
  // }, [sessionTimer, refreshTimer]);

  const logout = useCallback(async (mode: "manual" | "sso" | "takeover" = "manual") => {
    try {
      if (mode === "sso") {
        sessionStorage.setItem(AUTH_LOCK_KEY, "true");
      }
      else {
        sessionStorage.removeItem(AUTH_LOCK_KEY);
      }
    }
    catch (error) {
      console.error("Logout error:", error);
    }
    finally {
      TokenManager.clearTokens();
      dispatch({ type: "LOGOUT" });
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    }
  }, [sessionTimer, refreshTimer]);

  // Session timeout management
  useEffect(() => {
    const setupSessionTimeout = () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }

      const minutes = SESSION_TIMEOUT_TIMER;
      const logoutInMinutes = minutes * 60 * 1000;
      const warningInMinutes = SESSION_TIMEOUT_WARNING * 60 * 1000;

      const timer = setTimeout(() => {
        // dispatch({ type: "SET_SESSION_TIMEOUT", payload: Date.now() + 60000 }); // 1 minute warning
        dispatch({ type: "SET_SESSION_TIMEOUT", payload: Date.now() + warningInMinutes });

        // setTimeout(() => {
        //   logout();
        // }, 60000);
        setTimeout(() => {
          logout();
        }, warningInMinutes);
      },
        // minutes * 60 * 1000
        logoutInMinutes
      );

      setSessionTimer(timer);
    };

    if (state.isAuthenticated && state.token) {
      setupSessionTimeout();
    }
    else {
      logout();
    }

    return () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.isAuthenticated,
    // state.lastActivity
  ]);

  // Token refresh management
  useEffect(() => {
    const setupTokenRefresh = () => {
      if (refreshTimer) {
        console.log("🔄 Clearing existing refresh timer.", refreshTimer);
        clearTimeout(refreshTimer);
      }
      
      if (!state.token) {
        console.log("🔄 No token to refresh.");
        return;
      }

      const expiryTime = TokenManager.getTokenExpiryTime(state.token);
      if (!expiryTime) {
        console.log("🔄 Token has no expiry time.");
        return;
      }
      // console.log(`🔄 Token expires in: ${((expiryTime - Date.now()) / 1000 / 60).toFixed(2)} minutes`);

      // Refresh token 5 minutes before expiry
      // const refreshTime = expiryTime - Date.now() - (5 * 60 * 1000);

      // Refresh token 1 minute before expiry
      // const refreshTime = expiryTime - Date.now() - (1 * 60 * 1000);
      const refreshTime = expiryTime - Date.now() - (SESSION_TIMEOUT_WARNING * 60 * 1000);
      
      if (refreshTime > 0) {
        // console.log("🔄 Refreshing token in:", (refreshTime / 1000 / 60).toFixed(2), "minutes");
        const timer = setTimeout(() => {
          refreshToken();
        }, refreshTime);
        
        setRefreshTimer(timer);
      }
    };

    if (state.isAuthenticated && state.token) {
      // console.log("🔄 Setting up token refresh.", state?.isAuthenticated);
      setupTokenRefresh();
    }
    else {
      logout();
    }

    return () => {
      if (refreshTimer) {
        console.log("🔄 Clearing refresh timer.", refreshTimer);
        clearTimeout(refreshTimer);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token, state.isAuthenticated]);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await AuthService.login(credentials);

      TokenManager.setTokens(
        response.accessToken, 
        response.refreshToken || response.accessToken, 
        // credentials.rememberMe,
        true,
        response.user,
        credentials?.language || ""
      );

      const err = (await caseApiSetup()).filter(item => { return item != "" });
      
      if (err.length != 0) {
        err.map(item => { addToast("error", item, 5000, true) })
      }

      dispatch({ 
        type: "LOGIN_SUCCESS", 
        payload: { 
          user: response.user, 
          token: response.accessToken,
          refreshToken: response.refreshToken
        }
      });

      dispatch({ type: "RESET_FAILED_ATTEMPTS" });
    }
    catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await AuthService.register(data);
      
      TokenManager.setTokens(
        response.accessToken, 
        response.refreshToken, 
        false,
        response.user
      );
      
      dispatch({ 
        type: "LOGIN_SUCCESS", 
        payload: { 
          user: response.user, 
          token: response.accessToken,
          refreshToken: response.refreshToken
        } 
      });
    }
    catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
    }
  };

  const refreshToken = useCallback(async () => {
    if (!state.isAuthenticated) {
      console.warn("⛔ Refresh blocked: not authenticated");
      return;
    }

    const currentRefreshToken = TokenManager.getRefreshToken();
    if (!currentRefreshToken || state.isRefreshing) {
      console.log("🔄 Token refresh already in progress.");
      return;
    }

    if (state.isRefreshing) {
      console.log("🔄 Token refresh already in progress.");
      return;
    }

    // console.log("🔄 Refreshing token...");
    dispatch({ type: "REFRESH_START" });

    try {
      const response = await AuthService.refreshToken(currentRefreshToken);
      
      // const storage = localStorage || sessionStorage;
      // const profile = JSON.parse(storage.getItem("profile") || "{}");
      const profile = state.user;

      if (!profile) {
        throw new Error("User profile not available for token refresh");
      }

      TokenManager.setTokens(
        response.accessToken,
        response.refreshToken,
        true,
        profile
      );

      dispatch({ 
        type: "REFRESH_SUCCESS", 
        payload: {
          user: profile,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        } 
      });
      console.log("✅ Token refresh successful");
    }
    catch (error) {
      console.error("Token refresh failed:", error);
      dispatch({ type: "REFRESH_FAILURE" });
      
      // logout();
      // Only logout if it's not a cancellation error
      if (error instanceof Error && !error.message.includes("cancelled")) {
        logout();
      }
    }
  }, [
    state.isAuthenticated,
    state.isRefreshing,
    state.user,
    logout
  ]);

  const forgotPassword = async (email: string) => {
    try {
      await AuthService.forgotPassword(email);
    }
    catch (error) {
      console.error(error);
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      register,
      logout,
      refreshToken,
      forgotPassword,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
