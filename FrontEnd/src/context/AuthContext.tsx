import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { apiFetch, clearRedirectFlag } from "../utils/apiClient";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  loginWithRedirect: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth if we're on login page
      if (window.location.pathname === "/login") {
        setIsAuthenticated(false);
        setIsLoading(false);
        // Clear redirect flag when on login page
        clearRedirectFlag();
        return;
      }

      // Clear redirect flag when checking auth (user might have just logged in)
      clearRedirectFlag();

      try {
        const response = await apiFetch("/protected");

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user);
          // Clear redirect flag on successful auth
          clearRedirectFlag();
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginWithRedirect = () => {
    // Clear any existing redirect flag before starting login
    clearRedirectFlag();
    window.location.href = `${API_URL}/auth/login`;
  };

  const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: "DELETE",
      credentials: "include",
    });
    setIsAuthenticated(false);
    setUser(null);
    clearRedirectFlag();
    window.location.href = "/login";
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
