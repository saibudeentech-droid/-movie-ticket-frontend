import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

export default function AdminRoute({ children }) {
  const { isLoggedIn, user } = useContext(AuthContext);

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
