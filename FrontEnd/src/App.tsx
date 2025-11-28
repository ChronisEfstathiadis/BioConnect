// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./Pages/LoginPage.tsx";
import ThemeButton from "./components/ThemeButton/ThemeButton.tsx";
import Home from "./components/Home/Home.tsx";
import authService from "./api/AuthService";

function App() {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const cookieSetRef = useRef(false);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useEffect(() => {
    authService.setTokenGetter(getAccessTokenSilently);
  }, [getAccessTokenSilently]);

  // Set token cookie when authenticated
  const setTokenCookie = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      const response = await fetch(
        "http://localhost:8000/api/auth/set-cookie",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ token }),
        }
      );

      if (response.ok) {
        cookieSetRef.current = true;
        console.log("Token cookie refreshed");
      }
    } catch (error) {
      console.error("Error setting token cookie:", error);
      cookieSetRef.current = false;
    }
  };

  // Ensure token cookie is set whenever user is authenticated
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // Set cookie immediately
      if (!cookieSetRef.current) {
        setTokenCookie();
      }

      // Refresh cookie every 50 minutes (before 1 hour expiry)
      refreshIntervalRef.current = setInterval(
        () => {
          setTokenCookie();
        },
        50 * 60 * 1000
      ); // 50 minutes
    } else {
      // Clear interval when logged out
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      cookieSetRef.current = false;
    }

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return (
    <>
      <ThemeButton />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
