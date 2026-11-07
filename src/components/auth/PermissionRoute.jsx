import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Shows the page only when the user has ANY of the permissions (Super Admin / Admin always pass,
 * matching the sidebar). This only hides screens; the server checks every request again.
 *
 * @example
 * <Route path="payroll" element={<PermissionRoute anyOf={["payroll.salary.read"]}><PayrollPage /></PermissionRoute>} />
 */
export default function PermissionRoute({ anyOf = [], children, fallbackTo = "/workforce/dashboard" }) {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const isAdmin = [0, 1].includes(Number(user?.role));
  const allowed = isAdmin || anyOf.some((permission) => user?.permissions?.includes(permission));
  if (!allowed) return <Navigate to={fallbackTo} state={{ from: location }} replace />;
  return children;
}
