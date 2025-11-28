// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

if (!domain || !clientId || !audience) {
  throw new Error("Missing Auth0 environment variables");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Auth0Provider
          domain={domain}
          clientId={clientId}
          authorizationParams={{
            redirect_uri: window.location.origin,
            audience: audience,
            scope: "openid profile email",
          }}
          cacheLocation="memory"
          useRefreshTokens={true}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Auth0Provider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
