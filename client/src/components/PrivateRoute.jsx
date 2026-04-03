import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles, adminOnly }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    return <Navigate to="/login" />;
  }

  // admin
  if (adminOnly && user?.es_admin !== 1) {
    return <Navigate to="/login" />;
  }

  // roles
  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;