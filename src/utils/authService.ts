// /src/utils/authService.ts
import { API_CONFIG } from "@/config/api";
import { HttpClient } from "@/utils/httpClient";
import { TokenManager } from "@/utils/tokenManager";
import type { LoginCredentials, LoginResponse, RegisterData, User } from "@/types/auth";

export class AuthService {
  private static httpClient = HttpClient.getInstance();

  // Mock responses for demo mode
  private static createMockUser(username: string, role: string = "admin"): User {
    return {
      id: "1",
      username: username,
      name: username === "admin" ? "Admin Sky AI" : "Demo User",
      role: role as User["role"],
      department: "IT",
      lastLogin: new Date(),
      permissions: role === "admin" ? ["read", "write", "delete", "admin"] : ["read", "write"],
      organization: "SKY-AI",
      avatar: undefined,
      isEmailVerified: true,
      twoFactorEnabled: false
    };
  }

  private static createMockJWT(user: User): string {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ 
      sub: user.id, 
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
    }));
    const signature = btoa("mock_signature_" + Date.now());
    return `${header}.${payload}.${signature}`;
  }

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // console.log("🔐 Attempting login for:", credentials.username);
    
    try {
      if (API_CONFIG.DEMO_MODE) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (credentials.email === "admin@cms.com" && credentials.password === "admin123") {
          const mockUser = this.createMockUser(credentials.email, "admin");
          const accessToken = this.createMockJWT(mockUser);
          
          console.log("✅ Demo login successful");
          return {
            user: mockUser,
            accessToken: accessToken,
            refreshToken: "mock_refresh_token_" + Date.now(),
            expiresIn: 86400, // 24 hours
            tokenType: "Bearer"
          };
        }
        else {
          throw new Error("Invalid credentials. Use admin@cms.com / admin123");
        }
      }
      else {
        // Real API mode
        const params = {
          username: credentials.username,
          password: credentials.password,
          organization: String(credentials.organization),
          rememberMe: String(credentials.rememberMe),
          twoFactorCode: credentials.twoFactorCode || "",
          captcha: credentials.captcha || ""
        };

        // METHOD GET (suspended)
        // const queryParams = new URLSearchParams(params).toString();
        // const response = await this.httpClient.get<LoginResponse>(
        //   `${API_CONFIG.ENDPOINTS.LOGIN}?${queryParams}`
        // );

        // METHOD POST
        const response = await this.httpClient.post<LoginResponse>(
          API_CONFIG.ENDPOINTS.LOGIN, params
        );

        if (!response.data) {
          throw new Error(response.message || "Login failed");
        }

        // console.log("✅ API login successful");
        return response.data;
      }
    }
    catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  }
  
  static async register(data: RegisterData): Promise<LoginResponse> {
    console.log("📝 Attempting registration for:", data.email);
    
    if (data.password !== data.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (!data.acceptTerms) {
      throw new Error("You must accept the terms and conditions");
    }

    try {
      if (API_CONFIG.DEMO_MODE) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockUser = this.createMockUser(data.email, data.role);
        const accessToken = this.createMockJWT(mockUser);
        
        console.log("✅ Demo registration successful");
        return {
          user: mockUser,
          accessToken: accessToken,
          refreshToken: "mock_refresh_token_" + Date.now(),
          expiresIn: 86400,
          tokenType: "Bearer"
        };
      }
      else {
        // Real API mode
        const response = await this.httpClient.post<LoginResponse>(
          API_CONFIG.ENDPOINTS.REGISTER,
          {
            name: data.name,
            email: data.email,
            password: data.password,
            department: data.department,
            role: data.role,
            acceptTerms: data.acceptTerms
          }
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || "Registration failed");
        }

        console.log("✅ API registration successful");
        return response.data;
      }
    }
    catch (error) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  }
  
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    console.log("🔄 Refreshing token...");
    
    try {
      if (API_CONFIG.DEMO_MODE) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUser = this.createMockUser("admin@cms.com", "admin");
        const newAccessToken = this.createMockJWT(mockUser);
        
        console.log("✅ Demo token refreshed successfully");
        return {
          accessToken: newAccessToken,
          refreshToken: "new_mock_refresh_token_" + Date.now()
        };
      }
      else {
        // Real API mode
        const response = await this.httpClient.post<{ accessToken: string; refreshToken: string }>(
          API_CONFIG.ENDPOINTS.REFRESH,
          { refreshToken }
        );

        if (!response.status || !response.data) {
          throw new Error(response.message || "Token refresh failed");
        }

        console.log("✅ API token refreshed successfully");
        return response.data;
      }
    }
    catch (error) {
      console.error("❌ Token refresh failed:", error);
      throw error;
    }
  }
  
  static async logout(): Promise<void> {
    console.log("🚪 Logging out...");
    
    try {
      if (API_CONFIG.DEMO_MODE) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log("✅ Demo logout successful");
      }
      else {
        // Real API mode
        await this.httpClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
        console.log("✅ API logout successful");
      }
    }
    catch (error) {
      console.error("❌ Logout failed:", error);
      // Don"t throw error on logout failure - still clear local data
    }
  }

  static async verifyToken(token: string): Promise<User> {
    console.log("🔍 Verifying token...");
    
    try {
      if (API_CONFIG.DEMO_MODE) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (TokenManager.isTokenExpired(token)) {
          throw new Error("Token expired");
        }
        
        const mockUser = this.createMockUser("admin@cms.com", "admin");
        console.log("✅ Demo token verified successfully");
        return mockUser;
      }
      else {
        // Real API mode
        const response = await this.httpClient.post<User>(
          API_CONFIG.ENDPOINTS.VERIFY,
          { token }
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || "Token verification failed");
        }

        console.log("✅ API token verified successfully");
        return response.data;
      }
    }
    catch (error) {
      console.error("❌ Token verification failed:", error);
      throw error;
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    console.log("📧 Sending password reset email to:", email);
    
    try {
      if (API_CONFIG.DEMO_MODE) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("✅ Demo password reset email sent");
      }
      else {
        // Real API mode
        const response = await this.httpClient.post(
          API_CONFIG.ENDPOINTS.FORGOT_PASSWORD,
          { email }
        );

        if (!response.success) {
          throw new Error(response.message || "Failed to send reset email");
        }

        console.log("✅ API password reset email sent");
      }
    }
    catch (error) {
      console.error("❌ Failed to send reset email:", error);
      throw error;
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    console.log("🔑 Resetting password...");
    
    try {
      if (API_CONFIG.DEMO_MODE) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("✅ Demo password reset successful");
      }
      else {
        // Real API mode
        const response = await this.httpClient.post(
          API_CONFIG.ENDPOINTS.RESET_PASSWORD,
          { token, newPassword }
        );

        if (!response.success) {
          throw new Error(response.message || "Password reset failed");
        }

        console.log("✅ API password reset successful");
      }
    }
    catch (error) {
      console.error("❌ Password reset failed:", error);
      throw error;
    }
  }
}
