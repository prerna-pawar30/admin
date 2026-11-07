import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";
import ToastHost from "../ui/ToastHost";

const COLLAPSE_KEY = "admin.sidebarCollapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  // Remember the desktop collapse preference
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  }, [collapsed]);

  // Close the mobile drawer on navigation and lock body scroll while it is open
  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div
      className="admin-shell min-h-screen overflow-x-hidden bg-surface text-slate-900"
      data-sidebar={collapsed ? "collapsed" : "expanded"}
    >
      <ToastHost />

      <Header toggleSidebar={() => setMobileOpen((v) => !v)} isSidebarOpen={mobileOpen} />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        role={role}
      />

      <main className="admin-main min-h-screen min-w-0">
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-5">
          <Breadcrumb className="mb-4" />
          <div key={pathname} className="page-enter min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
