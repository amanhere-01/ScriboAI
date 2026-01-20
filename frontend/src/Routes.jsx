import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import OAuthSuccess from "./pages/OAuthSuccess";
import Auth from "./pages/Auth";
import Home from "./pages/Home";

export default function AppRoutes() {
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          isAuthenticated ? <Navigate to="/" /> : <Auth />
        }
      />

      <Route
        path="/"
        element={
          isAuthenticated ? <Home /> : <Navigate to="/auth" />
        }
      />

      <Route 
        path="/oauth/success" element={<OAuthSuccess/>}
      />
    </Routes>
  );
}
