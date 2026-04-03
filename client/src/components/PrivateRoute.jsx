import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles, adminOnly }) => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  const esAdmin = localStorage.getItem("es_admin") === "1";

  if (!token) {
    return <Navigate to="/login" />;
  }

  // 🔐 solo admin
  if (adminOnly && !esAdmin) {
    return <Navigate to="/login" />;
  }

  // 🔐 roles normales
  if (allowedRoles && !allowedRoles.includes(rol)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;