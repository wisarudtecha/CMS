// /src/utils/httpClient.ts
import { API_CONFIG } from "@/config/api";
import { TokenManager } from "@/utils/tokenManager";
import type { ApiResponse } from "@/types";

export class HttpClient {
  private static instance: HttpClient;
  private abortController: AbortController | null = null;

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const fullUrl = `${API_CONFIG.BASE_URL}${url}`;
    
    // Cancel previous request if still pending
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    
    const defaultHeaders = new Headers({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    });

    // Merge headers from options
    if (options.headers) {
      new Headers(options.headers).forEach((value, key) => {
        defaultHeaders.set(key, value);
      });
    }

    // Add auth token if available
    const token = TokenManager.getToken();
    if (token) {
      defaultHeaders.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers: defaultHeaders,
      signal: this.abortController.signal,
      credentials: "include" // Include cookies for CSRF
    };

    try {
      const response = await fetch(fullUrl, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.handleTokenRefresh();
          if (refreshed) {
            // Retry original request with new token
            return this.makeRequest(url, options);
          }
          else {
            throw new Error("Authentication failed");
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    }
    catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Request cancelled");
      }
      
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error("Network error - please check your connection");
      }
      
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
      
      return false;
    }
    catch {
      return false;
    }
  }

  async get<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: "GET" });
  }

  async post<T>(url: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(url: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: "DELETE" });
  }
}
