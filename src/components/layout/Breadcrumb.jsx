import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  labelForSegment,
  BREADCRUMB_OMIT_SEGMENTS,
} from "../../constants/breadcrumbLabels";

export default function Breadcrumb({ className = "" }) {
  const { pathname } = useLocation();

  // Memoize crumbs calculation so it only runs when pathname changes
  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Home", to: "/" }];

    let currentLink = "";
    segments.forEach((segment) => {
      currentLink += `/${segment}`;
      if (BREADCRUMB_OMIT_SEGMENTS.has(segment)) return;
      breadcrumbs.push({
        label: labelForSegment(segment),
        to: currentLink,
      });
    });

    return breadcrumbs;
  }, [pathname]);

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
              {/* Separator Icon (Don't show before the first item) */}
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 shrink-0 text-gray-400" />
              )}

              {isLast ? (
                // Last Item: Active page (Not a link)
                <span className="text-sm font-semibold text-gray-900" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                // Middle Items: Links
                <Link
                  to={crumb.to}
                  className="group flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-[#E68736]"
                >
                  {index === 0 && (
                    <Home className="mr-1.5 h-4 w-4 shrink-0 transition-colors group-hover:text-[#E68736]" />
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