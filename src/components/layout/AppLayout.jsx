import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";
import ToastHost from "../ui/ToastHost";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role } = useSelector((state) => state.auth);

  return (
    <div
      className="admin-shell min-h-screen overflow-x-hidden bg-white text-gray-900"
      data-sidebar={collapsed ? "collapsed" : "expanded"}
    >
      <ToastHost />

      <Header
        toggleSidebar={() => setMobileOpen(!mobileOpen)}
        isSidebarOpen={mobileOpen}
      />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        role={role}
      />

      <main className="admin-main min-h-[calc(100vh-5rem)] min-w-0 pt-20">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 md:px-6 lg:px-8 md:py-8">
          <Breadcrumb className="overflow-x-auto pb-2" />
          <Outlet />
        </div>
      </main>
    </div>
  );
}