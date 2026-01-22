import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequireAuth({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="card">Loading...</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
