// /src/utils/tokenManager.ts
export class TokenManager {
  private static STORAGE_KEY = 'cms_auth_token';
  private static REFRESH_KEY = 'cms_refresh_token';
  
  static setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false) {
    if (rememberMe) {
      localStorage.setItem(this.STORAGE_KEY, accessToken);
      localStorage.setItem(this.REFRESH_KEY, refreshToken);
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
  
  static isTokenExpired(token: string): boolean {
    try {
      // Handle both real JWTs and mock tokens
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT format:', token);
        return true;
      }

      const payload = JSON.parse(atob(parts[1]));

      // Check if token has expiration
      if (!payload.exp) {
        console.warn('Token missing expiration:', payload);
        return true;
      }
      
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        console.log('Token expired at:', new Date(payload.exp * 1000));
      }
      
      return isExpired;
    }
    catch (error) {
      console.error('Token validation error:', error);
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
