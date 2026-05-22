/* eslint-disable no-unused-vars */
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/AuthSlice";
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiOutlineCash,
  HiOutlineLogout,
  HiChevronDown,
  HiOutlineChatAlt,
  HiOutlineLibrary,
  HiOutlineKey,
  HiOutlineCollection,
  HiOutlineBell,
  HiOutlineGift,
  HiOutlineArrowCircleLeft,
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiOutlineMicrophone,
} from "react-icons/hi";

// ─── Injected styles (no external CSS file needed) ───────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .sidebar-root * { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* scrollbar */
  .sidebar-nav::-webkit-scrollbar { width: 3px; }
  .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
  .sidebar-nav::-webkit-scrollbar-thumb { background: #E68736; border-radius: 10px; }

  /* Smooth dropdown slide */
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .dropdown-enter { animation: slideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  /* active indicator pill */
  @keyframes pipIn {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }

  /* icon bounce on hover */
  .nav-icon { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .nav-link-item:hover .nav-icon { transform: scale(1.2) rotate(-4deg); }

  /* glow on active */
  .nav-link-active { position: relative; }
  .nav-link-active::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 10px;
    background: #E68736;
    opacity: 0.15;
    filter: blur(8px);
    z-index: -1;
  }

  /* section label fade */
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .section-label { animation: fadeSlideUp 0.3s ease forwards; }

  /* tooltip for collapsed state */
  .tooltip-wrapper { position: relative; }
  .tooltip-wrapper .tooltip-text {
    position: absolute;
    left: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%);
    background: #1a1a1a;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 9999;
    letter-spacing: 0.03em;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  }
  .tooltip-wrapper .tooltip-text::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: #1a1a1a;
  }
  .tooltip-wrapper:hover .tooltip-text { opacity: 1; }

  /* logout shimmer */
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .logout-btn {
    background-size: 200% auto;
    transition: all 0.3s ease;
  }
  .logout-btn:hover {
    background-image: linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%);
    background-size: 200% auto;
    animation: shimmer 1.5s linear infinite;
    color: #fff !important;
  }

  /* collapse button spin */
  .collapse-btn svg { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }

  /* mobile overlay fade */
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .mobile-overlay { animation: overlayIn 0.25s ease forwards; }

  /* sidebar slide-in on mobile */
  @keyframes sidebarSlideIn {
    from { transform: translateX(-100%); opacity: 0.6; }
    to   { transform: translateX(0); opacity: 1; }
  }

  /* brand dot pulse */
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.4); opacity: 0.7; }
  }
  .status-dot { animation: pulse 2.4s ease-in-out infinite; }
`;

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user } = useSelector((state) => state.auth);
  const numericRole = user ? Number(user.role) : null;
  const isAdmin = numericRole === 0 || numericRole === 1;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDropdown, setOpenDropdown] = useState(null);

  const hasPermission = (perm) => isAdmin || user?.permissions?.includes(perm);
  const hasAnyPermission = (perms) => isAdmin || perms.some((p) => user?.permissions?.includes(p));

  const toggleDropdown = (name) => {
    if (collapsed) setCollapsed(false);
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = () => {
    dispatch(logout());
    if (setMobileOpen) setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  // ── Link class factories ────────────────────────────────────────────────────
  const linkClass = ({ isActive }) =>
    [
      "nav-link-item tooltip-wrapper",
      "flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[13px] font-semibold",
      "transition-all duration-200 relative group",
      isActive
        ? "nav-link-active bg-[#E68736] text-white shadow-[0_4px_14px_rgba(230,135,54,0.45)]"
        : "text-gray-600 hover:bg-[#E68736]/10 hover:text-[#E68736]",
    ].join(" ");

  const subLinkClass = ({ isActive }) =>
    [
      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium",
      "transition-all duration-150 relative",
      isActive
        ? "text-[#E68736] font-bold bg-gradient-to-r from-orange-50 to-transparent pl-3 border-l-2 border-[#E68736]"
        : "text-gray-500 hover:text-[#E68736] hover:bg-orange-50/70 hover:pl-4",
    ].join(" ");

  const dropdownBtnBase =
    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all duration-200 group";

  const dropdownBtnClass = (name) =>
    [
      dropdownBtnBase,
      openDropdown === name
        ? "bg-[#E68736]/10 text-[#E68736]"
        : "text-gray-600 hover:bg-[#E68736]/10 hover:text-[#E68736]",
    ].join(" ");

  // ── Dropdown wrapper ────────────────────────────────────────────────────────
  const Dropdown = ({ name, icon: Icon, label, children }) => (
    <div className="space-y-0.5">
      <button onClick={() => toggleDropdown(name)} className={dropdownBtnClass(name)}>
        <span className="flex items-center gap-3">
          <Icon
            className={[
              "nav-icon text-[18px] flex-shrink-0 transition-colors",
              openDropdown === name ? "text-[#E68736]" : "text-gray-400 group-hover:text-[#E68736]",
            ].join(" ")}
          />
          {!collapsed && <span>{label}</span>}
        </span>
        {!collapsed && (
          <HiChevronDown
            className={[
              "text-[15px] transition-transform duration-300",
              openDropdown === name ? "rotate-180 text-[#E68736]" : "text-gray-400",
            ].join(" ")}
          />
        )}
      </button>

      {openDropdown === name && !collapsed && (
        <div className="dropdown-enter ml-5 pl-3.5 border-l-2 border-orange-200/70 flex flex-col gap-0.5 py-1.5 mr-1">
          {children}
        </div>
      )}
    </div>
  );

  // ── Collapsed tooltip ───────────────────────────────────────────────────────
  const CollapseTooltip = ({ label }) =>
    collapsed ? <span className="tooltip-text">{label}</span> : null;

  return (
    <>
      <style>{styles}</style>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="mobile-overlay fixed inset-0 bg-black/40 backdrop-blur-[3px] z-[145] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={[
          "sidebar-root fixed left-0 top-20 z-[150] flex flex-col",
          "h-[calc(100vh-5rem)] border-r border-orange-100/60",
          "bg-gradient-to-b from-[#FDF0E8] via-[#F7E6DC] to-[#F2DDD0]",
          "shadow-[4px_0_24px_rgba(230,135,54,0.1)]",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "w-[72px]" : "w-72 max-w-[85vw]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
      >
        {/* ── Header ── */}
        <div
          className={[
            "flex flex-shrink-0 items-center border-b border-orange-100/80 px-4 py-4",
            collapsed ? "justify-center" : "justify-between",
          ].join(" ")}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              {/* Avatar / Brand dot */}
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-[#E68736] flex items-center justify-center shadow-[0_3px_10px_rgba(230,135,54,0.5)]">
                  <span className="text-white font-black text-[15px]">
                    {isAdmin ? "A" : "E"}
                  </span>
                </div>
                <span className="status-dot absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-[#F7E6DC] rounded-full" />
              </div>
              <div>
                <p className="font-black text-[15px] text-gray-800 tracking-tight leading-none">
                  {isAdmin ? "ADMIN" : "EMPLOYEE"}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wide">
                  {isAdmin ? "Full Access" : "Limited Access"}
                </p>
              </div>
            </div>
          )}

          {/* Collapse toggle — desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={[
              "collapse-btn hidden md:flex items-center justify-center",
              "w-8 h-8 rounded-xl bg-white/80 shadow-sm border border-orange-100",
              "hover:border-[#E68736] hover:text-[#E68736] hover:shadow-[0_0_0_3px_rgba(230,135,54,0.15)]",
              "transition-all duration-200",
              collapsed ? "mx-auto" : "",
            ].join(" ")}
          >
            {collapsed ? (
              <HiChevronRight className="text-[15px] text-gray-500" />
            ) : (
              <HiChevronLeft className="text-[15px] text-gray-500" />
            )}
          </button>

          {/* Close — mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl hover:bg-orange-100/60 transition-colors"
          >
            <HiX className="text-lg text-gray-500" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-0.5 pb-10">

          {/* Analysis */}
          {hasPermission("admin.dashboard.read") && (
            <NavLink to="/" className={linkClass} onClick={() => setMobileOpen(false)}>
              <HiOutlineHome className="nav-icon text-[18px] flex-shrink-0" />
              {!collapsed && <span>Analysis</span>}
              <CollapseTooltip label="Analysis" />
            </NavLink>
          )}

          {/* My Dashboard */}
          <NavLink to="/workforce/dashboard" className={linkClass} onClick={() => setMobileOpen(false)}>
            <HiOutlineUserGroup className="nav-icon text-[18px] flex-shrink-0" />
            {!collapsed && <span>My Dashboard</span>}
            <CollapseTooltip label="My Dashboard" />
          </NavLink>

          {/* Admin Control */}
          {hasAnyPermission(["auth.account.create", "permission_assign_access", "employee.listing.read"]) && (
            <Dropdown name="admin" icon={HiOutlineKey} label="Admin Control">
              {hasPermission("employee.listing.read") && <NavLink to="/workforce/employees" className={subLinkClass} onClick={() => setMobileOpen(false)}>Employee List</NavLink>}
              {hasPermission("auth.account.create") && <NavLink to="/workforce/employees/create" className={subLinkClass} onClick={() => setMobileOpen(false)}>Create Employee</NavLink>}
              <NavLink to="/account/change-password" className={subLinkClass} onClick={() => setMobileOpen(false)}>Change Password</NavLink>
              {hasPermission("permission_assign_access") && <NavLink to="/workforce/permissions" className={subLinkClass} onClick={() => setMobileOpen(false)}>Permissions</NavLink>}
              <NavLink to="/workforce/logs" className={subLinkClass} onClick={() => setMobileOpen(false)}>Attendance & Leaves</NavLink>
            </Dropdown>
          )}

          {/* My Attendance */}
          <NavLink to="/workforce/portal" className={linkClass} onClick={() => setMobileOpen(false)}>
            <HiOutlineBell className="nav-icon text-[18px] flex-shrink-0" />
            {!collapsed && <span>My Attendance</span>}
            <CollapseTooltip label="My Attendance" />
          </NavLink>

          {/* Frontend UI */}
          {hasAnyPermission(["banner.listing.read","blog.listing.read","blog.listing.create","video.listing.create",   "video.listing.read"]) && (
            <Dropdown name="ui" icon={HiOutlineLibrary} label="Frontend UI">
              {hasPermission("banner.listing.create") && <NavLink to="/marketing/banners/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Banner</NavLink>}
              {hasPermission("banner.listing.read") && <NavLink to="/marketing/banners" className={subLinkClass} onClick={() => setMobileOpen(false)}>Banner List</NavLink>}
              {hasPermission("video.listing.create") && <NavLink to="/marketing/videos/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Video</NavLink>}
              {hasPermission("video.listing.read") && <NavLink to="/marketing/videos" className={subLinkClass} onClick={() => setMobileOpen(false)}>Video List</NavLink>}
              {hasPermission("blog.listing.read") && <NavLink to="/catalog/blogs" className={subLinkClass} onClick={() => setMobileOpen(false)}>Blog List</NavLink>}
              {hasPermission("blog.listing.create") && <NavLink to="/catalog/blogs/add-blog" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Blog</NavLink>}
            </Dropdown>
          )}

          {/* Inventory */}
          {hasAnyPermission(["product.listing.read", "stock.listing.read", "product.listing.create"]) && (
            <Dropdown name="product" icon={HiOutlineCube} label="Inventory">
              {hasPermission("product.listing.create") && <NavLink to="/catalog/products/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Product</NavLink>}
              {hasAnyPermission(["product.listing.read", "product.listing.delete", "product.listing.remove"]) && (
                <NavLink to="/catalog/products" className={subLinkClass} onClick={() => setMobileOpen(false)}>Product List</NavLink>
              )}
              {hasPermission("stock.listing.read") && <NavLink to="/catalog/products/stock" className={subLinkClass} onClick={() => setMobileOpen(false)}>Stock Control</NavLink>}
            </Dropdown>
          )}

          {/* Brand */}
          {hasPermission("brand.listing.read", "brand.listing.create") && (
            <Dropdown name="brand" icon={HiOutlineTag} label="Brand">
              {hasPermission("brand.listing.create") && <NavLink to="/catalog/brands/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Brand</NavLink>}
              <NavLink to="/catalog/brands" className={subLinkClass} onClick={() => setMobileOpen(false)}>Brand List</NavLink>
            </Dropdown>
          )}

          {/* Category */}
          {hasPermission("category.listing.read", "category.listing.create") && (
            <Dropdown name="category" icon={HiOutlineCollection} label="Category">
              {hasPermission("category.listing.create") && <NavLink to="/catalog/categories/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Category</NavLink>}
              <NavLink to="/catalog/categories" className={subLinkClass} onClick={() => setMobileOpen(false)}>Category List</NavLink>
            </Dropdown>
          )}

          {/* Product Reviews */}
          {hasPermission("product.review.listing.read") && (
            <NavLink to="/crm/reviews" className={linkClass} onClick={() => setMobileOpen(false)}>
              <HiOutlineChatAlt className="nav-icon text-[18px] flex-shrink-0" />
              {!collapsed && <span>Product Reviews</span>}
              <CollapseTooltip label="Product Reviews" />
            </NavLink>
          )}

          {/* ── Section Label ── */}
          {!collapsed && (
            <div className="section-label pt-5 pb-2 px-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-orange-200/60 to-transparent" />
              <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-[0.12em]">
                Sales & Support
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-orange-200/60 to-transparent" />
            </div>
          )}
          {collapsed && <div className="my-2 mx-3 h-px bg-orange-200/50 rounded-full" />}

          {/* Order Tracking */}
          {hasPermission("order.status.listing.read") && (
            <NavLink to="/sales/tracking" className={linkClass} onClick={() => setMobileOpen(false)}>
              <HiOutlineCash className="nav-icon text-[18px] flex-shrink-0" />
              {!collapsed && <span>Order Tracking</span>}
              <CollapseTooltip label="Order Tracking" />
            </NavLink>
          )}

          {/* Return Requests */}
          {hasPermission("order.return.listing.read") && (
            <NavLink to="/sales/returns" className={linkClass} onClick={() => setMobileOpen(false)}>
              <HiOutlineArrowCircleLeft className="nav-icon text-[18px] flex-shrink-0" />
              {!collapsed && <span>Return Requests</span>}
              <CollapseTooltip label="Return Requests" />
            </NavLink>
          )}

          {/* Career Management */}
          {hasAnyPermission(["career.job.read", "career.job.create"]) && (
            <Dropdown name="career" icon={HiOutlineUserGroup} label="Career Management">
              {hasPermission("career.job.create") && <NavLink to="/catalog/career" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Job</NavLink>}
              {hasPermission("career.job.read") && <NavLink to="/catalog/career/jobs" className={subLinkClass} onClick={() => setMobileOpen(false)}>Job Listings</NavLink>}
            </Dropdown>
          )}

          {/* Best Selling */}
          <NavLink to="/catalog/best-selling" className={linkClass} onClick={() => setMobileOpen(false)}>
            <HiOutlineGift className="nav-icon text-[18px] flex-shrink-0" />
            {!collapsed && <span>Best Selling</span>}
            <CollapseTooltip label="Best Selling" />
          </NavLink>

          {/* Billing */}
          {hasAnyPermission(["invoice.listing.read", "invoice.listing.create"]) && (
            <Dropdown name="billing" icon={HiOutlineCash} label="Billing">
              {hasPermission("invoice.listing.create") && <NavLink to="/sales/create-invoice" className={subLinkClass} onClick={() => setMobileOpen(false)}>Create Invoice</NavLink>}
              {hasPermission("invoice.listing.read") && <NavLink to="/sales/invoice-list" className={subLinkClass} onClick={() => setMobileOpen(false)}>Invoice List</NavLink>}
            </Dropdown>
          )}

          {/* Marketing */}
          {hasPermission("coupan.listing.read") && (
            <Dropdown name="marketing" icon={HiOutlineTag} label="Marketing">
              <NavLink to="/sales/coupons" className={subLinkClass} onClick={() => setMobileOpen(false)}>Coupon Manager</NavLink>
            </Dropdown>
          )}

          {/* Customer / Support */}
          {hasAnyPermission(["customer.listing.read", "library.listing.read", "inquiries.listing.read"]) && (
            <>
              {hasPermission("customer.listing.read") && (
                <NavLink to="/crm/customers" className={linkClass} onClick={() => setMobileOpen(false)}>
                  <HiOutlineUserGroup className="nav-icon text-[18px] flex-shrink-0" />
                  {!collapsed && <span>Customers</span>}
                  <CollapseTooltip label="Customers" />
                </NavLink>
              )}
              {hasPermission("library.listing.read") && (
                <NavLink to="/crm/contacts" className={linkClass} onClick={() => setMobileOpen(false)}>
                  <HiOutlineChatAlt className="nav-icon text-[18px] flex-shrink-0" />
                  {!collapsed && <span>Library Contact</span>}
                  <CollapseTooltip label="Library Contact" />
                </NavLink>
              )}
              {hasPermission("scanbridge.listing.read") && (
                <NavLink to="/crm/scanbridge" className={linkClass} onClick={() => setMobileOpen(false)}>
                  <HiOutlineMicrophone className="nav-icon text-[18px] flex-shrink-0" />
                  {!collapsed && <span>ScanBridge Requests</span>}
                  <CollapseTooltip label="ScanBridge" />
                </NavLink>
              )}
              {hasPermission("inquiries.listing.read") && (
                <NavLink to="/crm/inquiries" className={linkClass} onClick={() => setMobileOpen(false)}>
                  <HiOutlineBell className="nav-icon text-[18px] flex-shrink-0" />
                  {!collapsed && <span>Inquiries</span>}
                  <CollapseTooltip label="Inquiries" />
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* ── Footer / Logout ── */}
        <div className="flex-shrink-0 p-3 border-t border-orange-100/80">
          <button
            onClick={handleLogout}
            className={[
              "logout-btn flex items-center gap-3 w-full px-3.5 py-2.5 rounded-[10px]",
              "text-[13px] font-bold text-red-500 bg-red-50/80",
              "border border-red-100 shadow-sm",
              "transition-all duration-300",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <HiOutlineLogout className="text-[18px] flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
            {collapsed && <span className="tooltip-text">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}