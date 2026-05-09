import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("finely-user");
  const user = userStr ? JSON.parse(userStr) : {};

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (user.emailVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
