const API_URL = "http://localhost:8000";

class AuthService {
  private tokenGetter: ((options?: any) => Promise<string>) | null = null;

  setTokenGetter(getter: (options?: any) => Promise<string>) {
    this.tokenGetter = getter;
  }

  async getToken(): Promise<string> {
    if (!this.tokenGetter) {
      throw new Error("Token getter not set. Make sure App.tsx sets it up.");
    }
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

    try {
      const token = await this.tokenGetter({
        authorizationParams: {
          audience: audience,
        },
      });

      // Debug: Check token format
      console.log(
        "Token received:",
        token ? `${token.substring(0, 50)}...` : "null"
      );
      console.log("Token parts:", token ? token.split(".").length : 0);

      if (!token) {
        throw new Error("No token received from Auth0");
      }

      // Validate token format (JWT should have 3 parts)
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error(
          `Invalid token format. Expected 3 parts, got ${parts.length}`
        );
      }

      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      throw error;
    }
  }

  private async authFetch(endpoint: string, options: RequestInit = {}) {
    // Don't send token in header - backend will read from cookie
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: include cookies
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }

    return res.json();
  }

  async getProtected() {
    return this.authFetch("/api/protected");
  }

  async getUsers() {
    return this.authFetch("/api/users");
  }
}

export const logout = async () => {
  await fetch("http://localhost:8000/api/auth/logout", {
    method: "DELETE",
    credentials: "include",
  });
  window.location.href = "/login";
};

export const authService = new AuthService();
export default authService;
