import authService from "./AuthService";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    };

    if (!skipAuth) {
      try {
        const token = await authService.getToken();
        (headers as Record<string, string>)["Authorization"] =
          `Bearer ${token}`;
      } catch (error) {
        console.error("Failed to get token:", error);
        window.location.href = "/login";
        throw new Error("Authentication failed. Please login again.");
      }
    }

    try {
      let response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (response.status === 401 && !skipAuth) {
        // Token expired, redirect to login
        window.location.href = "/login";
        throw new Error("Authentication failed. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }

  async patch<T>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
