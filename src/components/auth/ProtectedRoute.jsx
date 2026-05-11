import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Pass isAppLoading as a prop from App.js
const ProtectedRoute = ({ children, allowedRoles, isAppLoading }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const numericRole = Number(role);

  // 1. Wait! Don't redirect yet if we are still checking the session
if (isAppLoading) {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E68736]"></div>
    </div>
  );
}

  // 2. Now that loading is done, check if user is actually logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role check
  if (allowedRoles && !allowedRoles.includes(numericRole)) {
    const defaultPath = (numericRole === 0 || numericRole === 1) ? "/" : "/employeedashboard";
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default ProtectedRoute;