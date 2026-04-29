import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux"; // Added to access auth state
import { ChevronRight, Home, LayoutDashboard } from "lucide-react";
import {
  labelForSegment,
  BREADCRUMB_OMIT_SEGMENTS,
} from "../../constants/breadcrumbLabels";

export default function Breadcrumb({ className = "" }) {
  const { pathname } = useLocation();
  
  // Access auth state to check permissions/role
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 0 || user?.role === 1 || user?.permissions?.includes("admin.dashboard.read");

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    
    // Logic: If Admin/Has Permission, first link is "Home" (Analysis)
    // If Employee, first link is "My Dashboard"
    const breadcrumbs = [
      { 
        label: isAdmin ? "Home" : "My Dashboard", 
        to: isAdmin ? "/" : "/workforce/dashboard" 
      }
    ];

    let currentLink = "";
    segments.forEach((segment) => {
      currentLink += `/${segment}`;
      
      // Prevent duplicate breadcrumb if employee is already on /workforce/dashboard
      if (BREADCRUMB_OMIT_SEGMENTS.has(segment)) return;
      if (!isAdmin && segment === "dashboard") return;

      breadcrumbs.push({
        label: labelForSegment(segment),
        to: currentLink,
      });
    });

    return breadcrumbs;
  }, [pathname, isAdmin]); // Re-calculate if pathname or admin status changes

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 py-4 ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.to} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 shrink-0 text-gray-400" />
              )}

              {isLast ? (
                <span className="text-sm font-semibold text-gray-900" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="group flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-[#E68736]"
                >
                  {index === 0 && (
                    isAdmin ? (
                      <Home className="mr-1.5 h-4 w-4 shrink-0 transition-colors group-hover:text-[#E68736]" />
                    ) : (
                      <LayoutDashboard className="mr-1.5 h-4 w-4 shrink-0 transition-colors group-hover:text-[#E68736]" />
                    )
                  )}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}