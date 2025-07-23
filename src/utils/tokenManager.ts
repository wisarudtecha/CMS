// /src/utils/tokenManager.ts
// Updated: [06-07-2025] v0.1.1
import type { JWTPayload, JWTHeader, DecodedJWT, TokenValidationResult, User } from "@/types/auth";
import { JWTUtils } from "@/utils/jwt";

export class TokenManager {
  private static STORAGE_KEY = 'cms_auth_token';
  private static REFRESH_KEY = 'cms_refresh_token';
  // Updated: [06-07-2025] v0.1.1
  // private static SECRET_KEY = 'my-secret-key'; // In production, this should be from environment
  
  static setTokens(
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean = false,
    profile: string = "",
    
  ) {
    if (rememberMe) {
      localStorage.setItem(this.STORAGE_KEY, accessToken);
      localStorage.setItem(this.REFRESH_KEY, refreshToken);
      localStorage.setItem("profile", profile);
    }
    else {
      sessionStorage.setItem(this.STORAGE_KEY, accessToken);
      sessionStorage.setItem(this.REFRESH_KEY, refreshToken);
    }
  }
  
  static getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
  }
  
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY) || sessionStorage.getItem(this.REFRESH_KEY);
  }
  
  static clearTokens() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.REFRESH_KEY);
  }

  // Updated: [06-07-2025] v0.1.1
  /**
   * Decode JWT token without verification (for client-side use)
   */
  static decodeToken(token: string): DecodedJWT {
    console.log('🔓 Decoding JWT token...');
    
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format - must have 3 parts');
    }

    try {
      const header = JSON.parse(JWTUtils.base64UrlDecode(parts[0])) as JWTHeader;
      const payload = JSON.parse(JWTUtils.base64UrlDecode(parts[1])) as JWTPayload;
      const signature = parts[2];

      console.log('✅ Token decoded successfully:', {
        header,
        payload: { ...payload, exp: new Date(payload.exp * 1000) },
        hasSignature: !!signature
      });

      return {
        header,
        payload,
        signature,
        raw: {
          header: parts[0],
          payload: parts[1],
          signature: parts[2]
        }
      };
    } catch (error) {
      console.error('❌ Token decoding failed:', error);
      throw new Error(`Failed to decode token: ${error}`);
    }
  }

  // Updated: [06-07-2025] v0.1.1
  /**
   * Validate JWT token comprehensively
   */
  static validateToken(token: string): TokenValidationResult {
    console.log('🔍 Validating JWT token...');
    
    const result: TokenValidationResult = {
      isValid: false,
      isExpired: false,
      errors: []
    };

    try {
      if (!token) {
        result.errors.push('Token is missing');
        return result;
      }

      const decoded = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);

      // Check token structure
      if (!decoded.header.alg || !decoded.header.typ) {
        result.errors.push('Invalid token header');
      }

      if (!decoded.payload.sub || !decoded.payload.exp) {
        result.errors.push('Invalid token payload - missing required fields');
      }

      // Check expiration
      if (decoded.payload.exp < now) {
        result.isExpired = true;
        result.errors.push('Token has expired');
      }

      // Check issued at time (not in future)
      if (decoded.payload.iat && decoded.payload.iat > now + 300) { // 5 min tolerance
        result.errors.push('Token issued in the future');
      }

      // In a real app, you would verify signature here
      // For demo purposes, we'll mock signature validation
      if (!decoded.signature || decoded.signature.length < 10) {
        result.errors.push('Invalid token signature');
      }

      // If no errors and not expired, token is valid
      result.isValid = result.errors.length === 0;

      // Extract user information
      if (result.isValid || (!result.isExpired && result.errors.length <= 1)) {
        result.user = {
          id: decoded.payload.sub,
          username: decoded.payload.username || "admin",
          // email: decoded.payload.email,
          name: decoded.payload.name || 'Unknown User',
          role: (["viewer", "admin", "manager", "agent"].includes(decoded.payload.role as string) 
            ? decoded.payload.role 
            : "viewer") as "viewer" | "admin" | "manager" | "agent",
          department: 'IT', // Default for demo
          lastLogin: new Date(),
          permissions: decoded.payload.permissions || ['read'],
          organization: decoded.payload.organization || "1",
        };
        
        result.expiresAt = new Date(decoded.payload.exp * 1000);
        result.issuedAt = decoded.payload.iat ? new Date(decoded.payload.iat * 1000) : undefined;
      }

      console.log('🔍 Token validation result:', {
        isValid: result.isValid,
        isExpired: result.isExpired,
        errors: result.errors,
        expiresAt: result.expiresAt,
        user: result.user?.email
      });

      return result;

    } catch (error) {
      result.errors.push(`Token validation failed: ${error}`);
      console.error('❌ Token validation error:', error);
      return result;
    }
  }
  
  /**
   * Check if token is expired (legacy method for backward compatibility)
   */
  static isTokenExpired(token: string): boolean {
    try {
      // // Handle both real JWTs and mock tokens
      // const parts = token.split('.');
      // if (parts.length !== 3) {
      //   console.warn('Invalid JWT format:', token);
      //   return true;
      // }
      // const payload = JSON.parse(atob(parts[1]));
      // // Check if token has expiration
      // if (!payload.exp) {
      //   console.warn('Token missing expiration:', payload);
      //   return true;
      // }
      // const isExpired = payload.exp * 1000 < Date.now();
      // if (isExpired) {
      //   console.log('Token expired at:', new Date(payload.exp * 1000));
      // }
      // return isExpired;

      // Updated: [06-07-2025] v0.1.1
      const validation = this.validateToken(token);
      return validation.isExpired;
    }
    catch (error) {
      // console.error('Token validation error:', error);
      // Updated: [06-07-2025] v0.1.1
      console.log('❌ Token expiry check failed:', error);
      return true;
    }
  }

  // Updated: [06-07-2025] v0.1.1
  /**
   * Get user information from token
   */
  static getUserFromToken(token: string): User | null {
    try {
      const validation = this.validateToken(token);
      return validation.user || null;
    }
    catch (error) {
      console.error('❌ Failed to extract user from token:', error);
      return null;
    }
  }

  // Updated: [06-07-2025] v0.1.1
  /**
   * Get token expiration info
   */
  static getTokenExpiry(token: string): { expiresAt: Date; timeLeft: number; isExpired: boolean } | null {
    try {
      const decoded = this.decodeToken(token);
      const expiresAt = new Date(decoded.payload.exp * 1000);
      const timeLeft = decoded.payload.exp * 1000 - Date.now();
      const isExpired = timeLeft <= 0;

      return {
        expiresAt,
        timeLeft: Math.max(0, timeLeft),
        isExpired
      };
    }
    catch (error) {
      console.error('❌ Failed to get token expiry:', error);
      return null;
    }
  }

  // Updated: [06-07-2025] v0.1.1
  /**
   * Refresh token if it's about to expire (within 5 minutes)
   */
  static shouldRefreshToken(token: string): boolean {
    try {
      const expiry = this.getTokenExpiry(token);
      if (!expiry) return true;

      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      return expiry.timeLeft < fiveMinutes && !expiry.isExpired;
    }
    catch (error) {
      console.error('❌ Failed to check if token should be refreshed:', error);
      return true;
    }
  }

  // Helper method to decode token payload for debugging
  static getTokenPayload(token: string): unknown {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      return JSON.parse(atob(parts[1]));
    }
    catch {
      return null;
    }
  }
}
