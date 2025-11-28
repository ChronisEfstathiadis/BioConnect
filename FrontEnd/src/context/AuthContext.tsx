import { createContext, useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  loginWithRedirect: () => void;
  logout: () => void;
  getAccessTokenSilently: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const value = {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
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
