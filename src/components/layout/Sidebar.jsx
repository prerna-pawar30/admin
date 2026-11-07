import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/AuthSlice";
import {
  HiOutlineChartPie,
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineCash,
  HiOutlineLogout,
  HiChevronDown,
  HiOutlineChatAlt2,
  HiOutlineTemplate,
  HiOutlineShieldCheck,
  HiOutlineCollection,
  HiOutlineFingerPrint,
  HiOutlineGift,
  HiOutlineReceiptRefund,
  HiOutlineTruck,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineTicket,
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineQrcode,
  HiOutlineInboxIn,
  HiOutlineStar,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiX,
  HiOutlineClipboardCheck,
} from "react-icons/hi";

/**
 * Navigation config. Each item is visible when `show(ctx)` returns true.
 * Groups render as a collapsible section; their children use the same `show`.
 * Permission strings are unchanged from the previous sidebar.
 */
const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Analysis", icon: HiOutlineChartPie, end: true, show: (c) => c.has("admin.dashboar.access") },
      { to: "/workforce/dashboard", label: "My Dashboard", icon: HiOutlineViewGrid },
    ],
  },
  {
    label: "My Workspace",
    items: [
      { to: "/workforce/portal", label: "My Attendance", icon: HiOutlineFingerPrint },
      { to: "/workforce/my-tasks", label: "My Tasks", icon: HiOutlineClipboardCheck },
      { to: "/workforce/my-salary", label: "My Salary", icon: HiOutlineCash },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        id: "admin",
        label: "Admin Control",
        icon: HiOutlineShieldCheck,
        show: (c) =>
          c.any([
            "auth.account.create",
            "system.permission.read",
            "employee.listing.read",
            "payroll.salary.read",
            "attendance.holiday.manage",
            "attendance.team.read",
            "task.manage.read",
          ]),
        children: [
          { to: "/workforce/employees", label: "Employee List", end: true, show: (c) => c.has("employee.listing.read") },
          { to: "/workforce/employees/create", label: "Create Employee", show: (c) => c.has("auth.account.create") },
          { to: "/workforce/permissions", label: "Permissions", show: (c) => c.has("system.permission.read") },
          { to: "/workforce/logs", label: "Attendance & Leaves", show: (c) => c.isAdmin },
          { to: "/workforce/team-leaves", label: "Team Leave Calendar", show: (c) => c.has("attendance.team.read") },
          { to: "/workforce/holidays", label: "Holidays", show: (c) => c.has("attendance.holiday.manage") },
          { to: "/workforce/payroll", label: "Payroll", show: (c) => c.has("payroll.salary.read") },
          { to: "/workforce/tasks-assign", label: "Task Management", show: (c) => c.has("task.manage.read") },
          { to: "/account/change-password", label: "Change Password" },
        ],
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        id: "product",
        label: "Inventory",
        icon: HiOutlineCube,
        show: (c) =>
          c.any([
            "product.listing.read",
            "inventory.stock.read",
            "product.listing.create",
            "product.listing.update",
            "inventory.stock.update",
            "product.listing.delete",
          ]),
        children: [
          { to: "/catalog/products/add", label: "Add Product", show: (c) => c.has("product.listing.create") },
          { to: "/catalog/products", label: "Product List", end: true, show: (c) => c.any(["product.listing.read", "product.listing.delete"]) },
          { to: "/catalog/products/stock", label: "Stock Control", show: (c) => c.has("inventory.stock.update") },
        ],
      },
      {
        id: "brand",
        label: "Brands",
        icon: HiOutlineTag,
        show: (c) => c.any(["product.brand.read", "product.brand.create"]),
        children: [
          { to: "/catalog/brands/add", label: "Add Brand", show: (c) => c.has("product.brand.create") },
          { to: "/catalog/brands", label: "Brand List", end: true },
        ],
      },
      {
        id: "category",
        label: "Categories",
        icon: HiOutlineCollection,
        show: (c) => c.any(["product.category.read", "product.category.create"]),
        children: [
          { to: "/catalog/categories/add", label: "Add Category", show: (c) => c.has("product.category.create") },
          { to: "/catalog/categories", label: "Category List", end: true },
        ],
      },
      { to: "/catalog/best-selling", label: "Best Selling", icon: HiOutlineGift },
    ],
  },
  {
    label: "Content",
    items: [
      {
        id: "ui",
        label: "Website Content",
        icon: HiOutlineTemplate,
        show: (c) => c.any(["marketing.banner.read", "cms.blog.read", "cms.blog.create", "cms.video.create", "cms.video.read"]),
        children: [
          { to: "/marketing/banners/add", label: "Add Banner", show: (c) => c.has("marketing.banner.create") },
          { to: "/marketing/banners", label: "Banner List", end: true, show: (c) => c.has("marketing.banner.read") },
          { to: "/marketing/videos/add", label: "Add Video", show: (c) => c.has("cms.video.create") },
          { to: "/marketing/videos", label: "Video List", end: true, show: (c) => c.has("cms.video.read") },
          { to: "/catalog/blogs/add-blog", label: "Add Blog", show: (c) => c.has("cms.blog.create") },
          { to: "/catalog/blogs", label: "Blog List", end: true, show: (c) => c.has("cms.blog.read") },
        ],
      },
      { to: "/crm/reviews", label: "Product Reviews", icon: HiOutlineChatAlt2, show: (c) => c.has("crm.review.read") },
      { to: "/crm/testimonials", label: "Testimonials", icon: HiOutlineStar },
      {
        id: "career",
        label: "Careers",
        icon: HiOutlineBriefcase,
        show: (c) => c.any(["hr.career.read", "hr.career.create"]),
        children: [
          { to: "/catalog/career", label: "Add Job", end: true, show: (c) => c.has("hr.career.create") },
          { to: "/catalog/career/jobs", label: "Job Listings", show: (c) => c.has("hr.career.read") },
        ],
      },
    ],
  },
  {
    label: "Sales",
    items: [
      { to: "/sales/tracking", label: "Order Tracking", icon: HiOutlineTruck, show: (c) => c.has("sales.order.read") },
      { to: "/sales/returns", label: "Return Requests", icon: HiOutlineReceiptRefund, show: (c) => c.has("sales.order.read") },
      {
        id: "billing",
        label: "Billing",
        icon: HiOutlineDocumentText,
        show: (c) => c.any(["sales.invoice.read", "sales.invoice.generate"]),
        children: [
          { to: "/sales/create-invoice", label: "Create Invoice", show: (c) => c.has("sales.invoice.generate") },
          { to: "/sales/invoice-list", label: "Invoice List", show: (c) => c.has("sales.invoice.read") },
        ],
      },
      { to: "/sales/coupons", label: "Coupons", icon: HiOutlineTicket, show: (c) => c.any(["marketing.coupon.read", "marketing.coupon.create"]) },
    ],
  },
  {
    label: "Customers",
    items: [
      { to: "/crm/customers", label: "Customers", icon: HiOutlineUsers, show: (c) => c.has("crm.customers.read") },
      { to: "/crm/contacts", label: "Library Contact", icon: HiOutlineBookOpen, show: (c) => c.has("media.library.read") },
      { to: "/crm/scanbridge", label: "ScanBridge Requests", icon: HiOutlineQrcode, show: (c) => c.has("library.scanbridge.read") },
      { to: "/crm/inquiries", label: "Inquiries", icon: HiOutlineInboxIn, show: (c) => c.has("crm.inquiries.read") },
    ],
  },
];

const visible = (node, ctx) => (node.show ? node.show(ctx) : true);

/** True when `pathname` is the link itself (exact) or, for non-`end` links, a sub-route of it. */
const matches = (pathname, to, end) => {
  if (to === "/") return pathname === "/";
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
};

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user } = useSelector((state) => state.auth);
  const numericRole = user ? Number(user.role) : null;
  const isAdmin = numericRole === 0 || numericRole === 1;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const ctx = useMemo(() => {
    const perms = user?.permissions || [];
    return {
      isAdmin,
      has: (p) => isAdmin || perms.includes(p),
      any: (ps) => isAdmin || ps.some((p) => perms.includes(p)),
    };
  }, [isAdmin, user?.permissions]);

  // Filter config down to what this user can see; drop empty groups/sections.
  const sections = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items
          .filter((item) => visible(item, ctx))
          .map((item) => (item.children ? { ...item, children: item.children.filter((ch) => visible(ch, ctx)) } : item))
          .filter((item) => !item.children || item.children.length > 0),
      })).filter((section) => section.items.length > 0),
    [ctx]
  );

  // The group that owns the current route (used for auto-open + highlighting).
  const activeGroupId = useMemo(() => {
    for (const s of sections)
      for (const item of s.items)
        if (item.children?.some((ch) => matches(pathname, ch.to, ch.end))) return item.id;
    return null;
  }, [sections, pathname]);

  const [openGroup, setOpenGroup] = useState(activeGroupId);
  useEffect(() => {
    if (activeGroupId) setOpenGroup(activeGroupId);
  }, [activeGroupId]);

  // Collapsed-mode tooltip, rendered as fixed so the scrolling nav can't clip it.
  const [tip, setTip] = useState(null);
  const showTip = (e, label) => {
    if (!collapsed) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ label, top: r.top + r.height / 2, left: r.right + 10 });
  };
  const hideTip = () => setTip(null);
  useEffect(() => {
    if (!collapsed) setTip(null);
  }, [collapsed]);

  const closeMobile = () => setMobileOpen?.(false);

  const toggleGroup = (id) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroup(id);
      return;
    }
    setOpenGroup((cur) => (cur === id ? null : id));
  };

  const handleLogout = () => {
    dispatch(logout());
    closeMobile();
    navigate("/login", { replace: true });
  };

  // On mobile the drawer is always full width, regardless of desktop collapse state.
  const isCollapsed = collapsed && !mobileOpen;

  const itemBase =
    "group relative flex w-full items-center gap-3 rounded-xl text-[13.5px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-300";
  const itemPad = isCollapsed ? "h-10 justify-center px-0" : "h-10 px-3";

  const linkClass = ({ isActive }) =>
    [
      itemBase,
      itemPad,
      isActive
        ? "bg-brand-50 text-brand-700 font-semibold"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  const subLinkClass = ({ isActive }) =>
    [
      "relative flex h-9 items-center rounded-lg pl-3 pr-2 text-[13px] transition-colors duration-150",
      isActive
        ? "bg-brand-50 font-semibold text-brand-700 before:absolute before:-left-[13px] before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-brand-500"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  const iconClass = (active) =>
    `h-[19px] w-[19px] shrink-0 transition-colors ${active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"}`;

  const initials = (() => {
    const f = user?.firstName?.[0] || "";
    const l = user?.lastName?.[0] || "";
    return (f + l).toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  })();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "User";

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[145] bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobile}
        aria-hidden
      />

      <aside
        className={[
          "fixed bottom-0 left-0 z-[150] flex flex-col border-r border-slate-200/80 bg-white",
          "top-0 lg:top-[var(--app-header-h)]",
          "transition-[width,transform] duration-[280ms] ease-[cubic-bezier(0.2,0.9,0.2,1)]",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          "lg:translate-x-0 lg:shadow-none",
          isCollapsed ? "w-[var(--app-sidebar-w-collapsed)]" : "w-[min(var(--app-sidebar-w),85vw)]",
        ].join(" ")}
        aria-label="Main navigation"
      >
        {/* Mobile drawer head */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4 lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{isAdmin ? "Administrator" : "Employee"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-3" onScroll={hideTip}>
          {sections.map((section, si) => (
            <div key={section.label} className={si > 0 ? "mt-5" : ""}>
              {isCollapsed ? (
                si > 0 && <div className="mx-auto mb-3 h-px w-6 bg-slate-200" />
              ) : (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.label}
                </p>
              )}

              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  if (!item.children) {
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={linkClass}
                          onClick={closeMobile}
                          onMouseEnter={(e) => showTip(e, item.label)}
                          onMouseLeave={hideTip}
                          aria-label={isCollapsed ? item.label : undefined}
                        >
                          {({ isActive }) => (
                            <>
                              <Icon className={iconClass(isActive)} />
                              {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </>
                          )}
                        </NavLink>
                      </li>
                    );
                  }

                  const isOpen = openGroup === item.id && !isCollapsed;
                  const groupActive = activeGroupId === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.id)}
                        onMouseEnter={(e) => showTip(e, item.label)}
                        onMouseLeave={hideTip}
                        aria-expanded={isOpen}
                        aria-label={isCollapsed ? item.label : undefined}
                        className={[
                          itemBase,
                          itemPad,
                          groupActive
                            ? isCollapsed
                              ? "bg-brand-50 text-brand-700"
                              : "text-slate-900 font-semibold"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        ].join(" ")}
                      >
                        <Icon className={iconClass(groupActive)} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate text-left">{item.label}</span>
                            <HiChevronDown
                              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <ul className="relative my-1 ml-[21px] space-y-0.5 border-l border-slate-200 pl-3">
                            {item.children.map((ch) => (
                              <li key={ch.to}>
                                <NavLink to={ch.to} end={ch.end} className={subLinkClass} onClick={closeMobile} tabIndex={isOpen ? 0 : -1}>
                                  <span className="truncate">{ch.label}</span>
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 space-y-1 border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={(e) => showTip(e, "Logout")}
            onMouseLeave={hideTip}
            className={`${itemBase} ${itemPad} text-slate-600 hover:bg-red-50 hover:text-red-600`}
            aria-label={isCollapsed ? "Logout" : undefined}
          >
            <HiOutlineLogout className="h-[19px] w-[19px] shrink-0 text-slate-400 transition-colors group-hover:text-red-500" />
            {!isCollapsed && <span>Logout</span>}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            onMouseEnter={(e) => showTip(e, "Expand sidebar")}
            onMouseLeave={hideTip}
            className={`${itemBase} ${itemPad} hidden text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:flex`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <HiOutlineChevronDoubleRight className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <>
                <HiOutlineChevronDoubleLeft className="h-[18px] w-[18px] shrink-0 text-slate-400 group-hover:text-slate-600" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Collapsed tooltip */}
      {tip && (
        <div
          className="pointer-events-none fixed z-[200] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          style={{ top: tip.top, left: tip.left }}
          role="tooltip"
        >
          {tip.label}
        </div>
      )}
    </>
  );
}
