// /src/services/authService.ts
import type { User, LoginCredentials, RegisterData } from "@/types/auth";
// Updated: [06-07-2025] v0.1.1
import { JWTUtils } from "@/utils/jwt";
import { TokenManager } from "@/utils/tokenManager";

export class AuthService {
  // Updated: [06-07-2025] v0.1.1
  // private static BASE_URL = "/api/auth";

  // Helper to create mock JWT tokens
  // private static createMockJWT(userId: string, email: string, role: string): string {
  //   const header = {
  //     "alg": "HS256",
  //     "typ": "JWT"
  //   };
    
  //   const payload = {
  //     "sub": userId,
  //     "email": email,
  //     "role": role,
  //     "iat": Math.floor(Date.now() / 1000),
  //     "exp": Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
  //   };
    
  //   const encodedHeader = btoa(JSON.stringify(header));
  //   const encodedPayload = btoa(JSON.stringify(payload));
  //   const mockSignature = btoa("mock_signature_" + Date.now());
    
  //   return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
  // }
  
  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string; refreshToken: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Updated: [17-07-2025] v0.1.2
    // Mock organization mapping
    const organizations = [
      { label: "skyai", value: "1"},
      { label: "bma", value: "2"},
    ];
    const organization = organizations?.find((o) => o.label === credentials.organization) || null;
    
    // Mock validation
    if (
      // credentials.email === "admin@cms.com"
      // Updated: [17-07-2025] v0.1.2
      credentials.username === "admin"
      &&
      // credentials.password === "admin123"
      // Updated: [17-07-2025] v0.1.2
      credentials.password === "P@ssw0rd"
      &&
      // Updated: [17-07-2025] v0.1.2
      (credentials.organization === "skyai" || credentials.organization === "bma")
    ) {
      const mockUser: User = {
        id: "1",
        // Updated: [17-07-2025] v0.1.2
        username: credentials.username,
        // email: credentials.email,
        name: "Admin User",
        role: "admin",
        department: "IT",
        lastLogin: new Date(),
        permissions: ["read", "write", "delete", "admin"],
        // Updated: [17-07-2025] v0.1.2
        organization: organization?.value || "1"
      };

      // Updated: [06-07-2025] v0.1.1
      // Create proper JWT token using JWTUtils
      const token = JWTUtils.createToken({
        sub: mockUser.id,
        // Updated: [17-07-2025] v0.1.2
        username: mockUser.username,
        // email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        permissions: mockUser.permissions,
        // Updated: [17-07-2025] v0.1.2
        organization: mockUser.organization
      }, 24); // 24 hours expiry
      
      // Updated: [06-07-2025] v0.1.1
      const refreshToken = JWTUtils.createToken({
        sub: mockUser.id,
        // Updated: [17-07-2025] v0.1.2
        username: mockUser.username,
        // email: mockUser.email,
        role: "refresh",
        // Updated: [17-07-2025] v0.1.2
        organization: mockUser.organization
      }, 168); // 7 days expiry
      
      // Updated: [06-07-2025] v0.1.1
      console.log("✅ Login successful - JWT token created:", {
        user: mockUser.email,
        tokenLength: token.length,
        hasValidStructure: token.split(".").length === 3
      });
      
      return {
        user: mockUser,
        // token: this.createMockJWT(mockUser.id, mockUser.email, mockUser.role),
        // Updated: [06-07-2025] v0.1.1
        token: token,
        // refreshToken: this.createMockJWT(mockUser.id, mockUser.email, "refresh")
        // Updated: [06-07-2025] v0.1.1
        refreshToken: refreshToken,
      };
    }
    
    throw new Error("Invalid credentials");
  }
  
  static async register(data: RegisterData): Promise<{ user: User; token: string; refreshToken: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (data.password !== data.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    
    const mockUser: User = {
      id: Date.now().toString(),
      // Updated: [17-07-2025] v0.1.2
      username: data.username,
      email: data.email,
      name: data.name,
      role: data.role as User["role"],
      department: data.department,
      lastLogin: new Date(),
      permissions: ["read", "write"],
      // Updated: [17-07-2025] v0.1.2
      organization: data.organization,
    };

    // Updated: [06-07-2025] v0.1.1
    // Create JWT token for new user
    const token = JWTUtils.createToken({
      sub: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      permissions: mockUser.permissions
    }, 24);
    
    // Updated: [06-07-2025] v0.1.1
    const refreshToken = JWTUtils.createToken({
      sub: mockUser.id,
      email: mockUser.email,
      role: "refresh"
    }, 168);
    
    return {
      user: mockUser,
      // token: this.createMockJWT(mockUser.id, mockUser.email, mockUser.role),
      // Updated: [06-07-2025] v0.1.1
      token: token,
      // refreshToken: this.createMockJWT(mockUser.id, mockUser.email, "refresh")
      // Updated: [06-07-2025] v0.1.1
      refreshToken: refreshToken
    };
  }
  
  static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // console.log(refreshToken);
    
    // return {
    //   token: this.createMockJWT("1", "admin@cms.com", "admin"),
    //   refreshToken: this.createMockJWT("1", "admin@cms.com", "refresh")
    // };

    // Updated: [06-07-2025] v0.1.1
    try {
      // Validate the refresh token first
      const validation = TokenManager.validateToken(refreshToken);
      
      if (!validation.isValid || validation.isExpired) {
        throw new Error("Invalid or expired refresh token");
      }
      
      // Create new access token
      const newToken = JWTUtils.createToken({
        sub: validation.user!.id,
        email: validation.user!.email,
        name: validation.user!.name,
        role: validation.user!.role,
        permissions: validation.user!.permissions
      }, 24);
      
      // Create new refresh token
      const newRefreshToken = JWTUtils.createToken({
        sub: validation.user!.id,
        email: validation.user!.email,
        role: "refresh"
      }, 168);
      
      console.log("🔄 Token refreshed successfully");
      
      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    }
    catch (error) {
      console.error("❌ Token refresh failed:", error);
      throw new Error("Token refresh failed");
    }
  }
  
  static async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
