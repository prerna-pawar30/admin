import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * RBAC wrapper for route segments. Use with nested routes + Outlet.
 *
 * @example
 * <Route path="admin-only" element={
 *   <RoleRoute allowedRoles={[0, 1]}><Outlet /></RoleRoute>
 * }>
 */
export default function RoleRoute({
  children,
  allowedRoles,
  fallbackTo = "/workforce/dashboard",
}) {
  const role = Number(useSelector((s) => s.auth.role));
  const location = useLocation();

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={fallbackTo} state={{ from: location }} replace />;
  }

  return children;
}
