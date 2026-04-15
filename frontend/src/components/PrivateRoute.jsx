import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ children, allowedRoles, adminOnly }) => {
  const token = localStorage.getItem("token");
  const { user, loading } = useAuth();

  // 🔴 sin token
  if (!token) {
    return <Navigate to="/login" />;
  }

  // ⏳ esperar a que cargue el usuario
  if (loading) {
    return <div>Cargando...</div>; // o spinner
  }

  // 🔴 admin
  if (adminOnly && user?.es_admin !== 1) {
    return <Navigate to="/login" />;
  }

  // 🔴 roles
  if (allowedRoles && !allowedRoles.includes(user?.rol?.toLowerCase())) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;