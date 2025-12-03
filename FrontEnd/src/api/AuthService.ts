import { API_URL } from "../config/api";

class AuthService {
  private async authFetch(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }

    return res.json();
  }

  async getProtected() {
    return this.authFetch(`${API_URL}/protected`);
  }

  async getUsers() {
    return this.authFetch(`${API_URL}/users`);
  }
}

export const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: "DELETE",
    credentials: "include",
  });
  window.location.href = "/login";
};

export const authService = new AuthService();
export default authService;
