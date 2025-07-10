// /src/services/api.ts
class ApiService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string = "/api", headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      "Content-Type": "application/json",
      ...headers
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error (${response.status}): ${error}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data:
    // any
    unknown
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async put<T>(endpoint: string, data:
    // any
    unknown
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async bulkDelete<T>(endpoint: string, ids: string[]): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: JSON.stringify({ ids })
    });
  }

  async export(endpoint: string, format: string, filters?:
    // any
    // unknown
    Record<string, string | number | boolean | null>
  ): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      ...(filters && { filters: JSON.stringify(filters) })
    });

    const response = await fetch(`${this.baseUrl}${endpoint}?${params}`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }
}

export const apiService = new ApiService();
