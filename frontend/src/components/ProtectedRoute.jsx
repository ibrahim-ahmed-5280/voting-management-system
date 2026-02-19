import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ allowRole }) {
  const { user, loading } = useAuth();

  const loginRoute = allowRole === "voter" ? "/login" : "/admin/login";
  const homeRoute = user?.role === "voter" ? "/voter/dashboard" : "/admin/dashboard";

  if (loading) return <div className="page-wrap">Loading...</div>;
  if (!user) return <Navigate to={loginRoute} replace />;
  if (allowRole && user.role !== allowRole) return <Navigate to={homeRoute} replace />;
  return <Outlet />;
}

