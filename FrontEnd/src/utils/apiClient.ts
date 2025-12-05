import { API_URL } from "../config/api";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Use sessionStorage to persist redirect state across page reloads
const REDIRECT_KEY = "auth_redirecting";

function isRedirecting(): boolean {
  return sessionStorage.getItem(REDIRECT_KEY) === "true";
}

function setRedirecting(value: boolean): void {
  if (value) {
    sessionStorage.setItem(REDIRECT_KEY, "true");
  } else {
    sessionStorage.removeItem(REDIRECT_KEY);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, wait for that promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  // If already redirecting, don't try to refresh again
  if (isRedirecting()) {
    return false;
  }

  // Check if we're already on login page
  if (window.location.pathname === "/login") {
    return false;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      console.log("🔄 Attempting to refresh token...");
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("✅ Token refresh successful");
        return true;
      } else {
        // Refresh failed - get error message
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || "Token refresh failed";
        console.error("❌ Token refresh failed:", errorMessage);

        // If refresh fails, immediately redirect (don't retry)
        if (!isRedirecting() && window.location.pathname !== "/login") {
          setRedirecting(true);
          console.log("🔄 Redirecting to login page...");
          window.location.href = "/login";
        }
        return false;
      }
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      // Redirect to login (only once)
      if (!isRedirecting() && window.location.pathname !== "/login") {
        setRedirecting(true);
        console.log("🔄 Redirecting to login page due to error...");
        window.location.href = "/login";
      }
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Don't block API calls if we're checking the protected endpoint (auth check)
  // This allows the auth check to work after successful login
  const isAuthCheck =
    endpoint === "/protected" || endpoint.includes("/protected");

  // If already redirecting, don't make any more API calls (except auth check)
  if (isRedirecting() && !isAuthCheck) {
    return new Response(null, { status: 401, statusText: "Unauthorized" });
  }

  // Don't make API calls if we're on login page (except auth check)
  if (window.location.pathname === "/login" && !isAuthCheck) {
    return new Response(null, { status: 401, statusText: "Unauthorized" });
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  });

  // If 401, try to refresh token and retry (only once)
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    // Only retry if refresh was successful
    if (refreshed && !isRedirecting()) {
      // Retry the original request only if refresh succeeded
      response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
        },
      });

      // If retry still returns 401, redirect (shouldn't happen if refresh worked)
      if (
        response.status === 401 &&
        !isRedirecting() &&
        window.location.pathname !== "/login"
      ) {
        setRedirecting(true);
        window.location.href = "/login";
      }
    }
    // If refresh failed, it already redirected, so just return the 401 response
  }

  return response;
}

// Clear redirect flag when successfully authenticated (call this after successful login)
export function clearRedirectFlag(): void {
  setRedirecting(false);
}
