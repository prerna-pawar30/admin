import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronRight, Home } from "lucide-react";
import { labelForSegment, BREADCRUMB_OMIT_SEGMENTS } from "../../constants/breadcrumbLabels";

export default function Breadcrumb({ className = "" }) {
  const { pathname } = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isAdmin =
    Number(user?.role) === 0 || Number(user?.role) === 1 || user?.permissions?.includes("admin.dashboard.read");

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const list = [{ label: isAdmin ? "Home" : "My Dashboard", to: isAdmin ? "/" : "/workforce/dashboard" }];

    let current = "";
    segments.forEach((segment, i) => {
      current += `/${segment}`;
      if (BREADCRUMB_OMIT_SEGMENTS.has(segment)) return;
      if (!isAdmin && segment === "dashboard") return;
      list.push({ label: labelForSegment(segment, segments[i - 1]), to: current });
    });
    return list;
  }, [pathname, isAdmin]);

  // Nothing useful to show on the home page itself
  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={`min-w-0 overflow-x-auto ${className}`}>
      <ol className="flex w-max items-center gap-1 text-[13px]">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.to} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />}
              {isLast ? (
                <span className="font-medium text-slate-800" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-slate-500 transition-colors hover:text-brand-600"
                >
                  {index === 0 && <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />}
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
