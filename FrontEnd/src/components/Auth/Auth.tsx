import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

export default function Auth() {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className={styles.authContainer}>Loading...</div>;
  }

  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleLogin = async () => {
    try {
      console.log("Attempting to login with Auth0...");
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please check the console for details.");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h3 className={styles.authTitle}>Welcome to BioConnect</h3>
        <p style={{ marginBottom: "2rem", color: "var(--text-secondary)" }}>
          Sign in to continue
        </p>
        {error && (
          <div
            style={{
              padding: "0.75rem",
              marginBottom: "1rem",
              backgroundColor: "#ff4444",
              color: "white",
              borderRadius: "8px",
              fontSize: "0.9rem",
            }}>
            Error: {error.message}
          </div>
        )}
        <button className={styles.authButton} onClick={handleLogin}>
          Log In with Auth0
        </button>
      </div>
    </div>
  );
}
