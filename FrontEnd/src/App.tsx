// src/App.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ThemeButton from "./components/ThemeButton/ThemeButton";
import HomePage from "./pages/HomePage";
import PublicProfilePage from "./pages/PublicProfilePage";

function App() {
  return (
    <>
      <ThemeButton />
      <Routes>
        <Route path="/profile/:profileId" element={<PublicProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
