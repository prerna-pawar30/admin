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
  HiOutlineUser,
} from "react-icons/hi";

// Removed 'role' from props because we will get it directly from Redux state
export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  // Pull the entire user object from Redux
  const { user } = useSelector((state) => state.auth);
  
  // Calculate role and admin status inside the component to ensure it updates on login
  const numericRole = user ? Number(user.role) : null;
  const isAdmin = numericRole === 0 || numericRole === 1;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDropdown, setOpenDropdown] = useState(null);

  // Helper to check for specific permission string
  const hasPermission = (perm) => isAdmin || user?.permissions?.includes(perm);

  // Helper to check if user has ANY of the permissions in an array
  const hasAnyPermission = (perms) => isAdmin || perms.some(p => user?.permissions?.includes(p));

  const toggleDropdown = (name) => {
    if (collapsed) setCollapsed(false);
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = () => {
    dispatch(logout());
    if (setMobileOpen) setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
     ${isActive ? "bg-[#E68736] text-white shadow-md" : "text-gray-700 hover:bg-[#E68736]/10 hover:text-[#E68736]"}`;

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-[13px] transition-all
     ${isActive ? "text-[#E68736] font-bold bg-orange-50" : "text-gray-500 hover:text-[#E68736] hover:bg-gray-50"}`;

  const dropdownBtnClass = `w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all
    ${openDropdown ? "text-[#E68736]" : "text-gray-700 hover:bg-[#E68736]/10"}`;

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[145] md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR ASIDE */}
      <aside
        className={`
        fixed left-0 top-20 z-[150] flex h-[calc(100vh-5rem)] flex-col border-r border-orange-100 bg-[#F7E6DC] shadow-2xl
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-72 max-w-[85vw]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-orange-100/80 p-4 md:p-5">
          {!collapsed && (
            <div className="animate-fadeIn">
              <h3 className="font-black text-xl text-gray-800 tracking-tight">
                {isAdmin ? "ADMIN" : "EMPLOYEE"}
              </h3>
              <div className="h-1 w-8 bg-[#E68736] rounded-full mt-1" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-orange-100 hover:text-[#E68736] transition-colors"
          >
            {collapsed ? <HiChevronRight className="text-lg" /> : <HiChevronLeft className="text-lg" />}
          </button>

          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 hover:bg-orange-100 rounded-lg">
            <HiX className="text-2xl text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-2 pb-10 scrollbar-hide">
         
            <NavLink to="/" className={linkClass} onClick={() => setMobileOpen(false)}>
              <HiOutlineHome className="text-xl flex-shrink-0" />
              {!collapsed && <span>Analysis</span>}
            </NavLink>
          

          <NavLink to="/workforce/dashboard" className={linkClass} onClick={() => setMobileOpen(false)}>
            <HiOutlineUserGroup className="text-xl flex-shrink-0" />
            {!collapsed && <span>My Dashboard</span>}
          </NavLink>

          {/* ADMIN CONTROL DROPDOWN */}
          {hasAnyPermission(["auth.account.create", "permission_assign_access", "employee.listing.read"]) && (
            <div className="space-y-1">
              <button onClick={() => toggleDropdown('admin')} className={dropdownBtnClass}>
                <span className="flex items-center gap-3">
                  <HiOutlineKey className={`text-xl ${openDropdown === 'admin' ? "text-[#E68736]" : "text-gray-500"}`} />
                  {!collapsed && <span>Admin Control</span>}
                </span>
                {!collapsed && <HiChevronDown className={`transition-transform duration-300 ${openDropdown === 'admin' ? "rotate-180" : ""}`} />}
              </button>
              {openDropdown === 'admin' && !collapsed && (
                <div className="ml-6 pl-4 border-l-2 border-orange-200 flex flex-col gap-1 py-1">
                  {hasPermission("employee.listing.read") && <NavLink to="/workforce/employees" className={subLinkClass} onClick={() => setMobileOpen(false)}>Employee List</NavLink>}
                  {hasPermission("auth.account.create") && <NavLink to="/workforce/employees/create" className={subLinkClass} onClick={() => setMobileOpen(false)}>Create Employee</NavLink>}
                  <NavLink to="/account/change-password" className={subLinkClass} onClick={() => setMobileOpen(false)}>Change Password</NavLink>
                  {hasPermission("permission_assign_access") && <NavLink to="/workforce/permissions" className={subLinkClass} onClick={() => setMobileOpen(false)}>Permissions</NavLink>}
                  <NavLink to="/workforce/attendance/logs" className={subLinkClass} onClick={() => setMobileOpen(false)}>Attendance & Leaves</NavLink>
                </div>
              )}
            </div>
          )}

          <NavLink to="/workforce/attendance/portal" className={linkClass} onClick={() => setMobileOpen(false)}>
            <HiOutlineBell className="text-xl flex-shrink-0" />
            {!collapsed && <span>My Attendance</span>}
          </NavLink>

          {/* FRONTEND UI DROPDOWN */}
          {hasAnyPermission(["banner.listing.read", "video.listing.read"]) && (
            <div className="space-y-1">
              <button onClick={() => toggleDropdown('ui')} className={dropdownBtnClass}>
                <span className="flex items-center gap-3">
                  <HiOutlineLibrary className="text-xl text-gray-500" />
                  {!collapsed && <span>Frontend UI</span>}
                </span>
                {!collapsed && <HiChevronDown className={`transition-transform ${openDropdown === 'ui' ? "rotate-180" : ""}`} />}
              </button>
              {openDropdown === 'ui' && !collapsed && (
                <div className="ml-6 pl-4 border-l-2 border-orange-200 flex flex-col gap-1 py-1">
                  {hasPermission("banner.listing.create") && <NavLink to="/marketing/banners/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Banner</NavLink>}
                  {hasPermission("banner.listing.read") && <NavLink to="/marketing/banners" className={subLinkClass} onClick={() => setMobileOpen(false)}>Banner List</NavLink>}
                  {hasPermission("video.listing.create") && <NavLink to="/marketing/videos/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Video</NavLink>}
                  {hasPermission("video.listing.read") && <NavLink to="/marketing/videos" className={subLinkClass} onClick={() => setMobileOpen(false)}>Video List</NavLink>}
                  {hasPermission("blog.listing.read") && <NavLink to="/catalog/blogs" className={subLinkClass} onClick={() => setMobileOpen(false)}>Blog List</NavLink>}
                  {hasPermission("blog.listing.create") && <NavLink to="/catalog/blogs/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>Add Blog</NavLink>}
                </div>
              )}
            </div>
          )}

          {/* INVENTORY DROPDOWN */}
          {hasAnyPermission(["product.listing.read", "stock.listing.read", "product.listing.create"]) && (
            <div className="space-y-1">
              <button onClick={() => toggleDropdown('product')} className={dropdownBtnClass}>
                <span className="flex items-center gap-3">
                  <HiOutlineCube className="text-xl text-gray-500" />
                  {!collapsed && <span>Inventory</span>}
                </span>
                {!collapsed && <HiChevronDown className={`transition-transform ${openDropdown === 'product' ? "rotate-180" : ""}`} />}
              </button>
              {openDropdown === 'product' && !collapsed && (
                <div className="ml-6 pl-4 border-l-2 border-orange-200 flex flex-col gap-1 py-1">
                  {hasPermission("product.listing.create") && <NavLink to="/catalog/products/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>
                    Add Product
                  </NavLink>}
                  {hasAnyPermission([
                    "product.listing.read",
                    "product.listing.delete",
                    "product.listing.remove"
                  ]) && (
                    <NavLink to="/catalog/products" className={subLinkClass} onClick={() => setMobileOpen(false)}>Product List</NavLink>
                  )}
                  {hasPermission("stock.listing.read") && <NavLink to="/catalog/products/stock" className={subLinkClass} onClick={() => setMobileOpen(false)}>Stock Control</NavLink>}
                </div>
              )}
            </div>
          )}

          {/* BRAND DROPDOWN */}
          {hasPermission("brand.listing.read") && (
            <div className="space-y-1">
              <button onClick={() => toggleDropdown('brand')} className={dropdownBtnClass}>
                <span className="flex items-center gap-3">
                  <HiOutlineTag className="text-xl text-gray-500" />
                  {!collapsed && <span>Brand</span>}
                </span>
                {!collapsed && <HiChevronDown className={`transition-transform ${openDropdown === 'brand' ? "rotate-180" : ""}`} />}
              </button>
              {openDropdown === 'brand' && !collapsed && (
                <div className="ml-6 pl-4 border-l-2 border-orange-200 flex flex-col gap-1 py-1">
                  {hasPermission("brand.listing.create") && <NavLink to="/catalog/brands/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>
                    Add Brand
                  </NavLink>}
                  <NavLink to="/catalog/brands" className={subLinkClass} onClick={() => setMobileOpen(false)}>Brand List</NavLink>
                </div>
              )}
            </div>
          )}

          {/* CATEGORY DROPDOWN */}
          {hasPermission("category.listing.read") && (
            <div className="space-y-1">
              <button onClick={() => toggleDropdown('category')} className={dropdownBtnClass}>
                <span className="flex items-center gap-3">
                  <HiOutlineCollection className="text-xl text-gray-500" />
                  {!collapsed && <span>Category</span>}
                </span>
                {!collapsed && <HiChevronDown className={`transition-transform ${openDropdown === 'category' ? "rotate-180" : ""}`} />}
              </button>
              {openDropdown === 'category' && !collapsed && (
                <div className="ml-6 pl-4 border-l-2 border-orange-200 flex flex-col gap-1 py-1">
                  {hasPermission("category.listing.create") && <NavLink to="/catalog/categories/add" className={subLinkClass} onClick={() => setMobileOpen(false)}>
                    Add Category
                  </NavLink>}
                  <NavLink to="/catalog/categories" className={subLinkClass} onClick={() => setMobileOpen(false)}>Category List</NavLink>
                </div>
              )}
            </div>
          )}

          {!collapsed && <div className="pt-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Sales & Support</div>}

          {/* SALES MANAGEMENT */}
          {hasPermission("order.status.listing.read") && (
            <NavLink to="/sales/orders/tracking" className={linkClass} onClick={() => setMobileOpen(false)}>
              <HiOutlineCash className="text-xl" />
              {!collapsed && <span>Order Tracking</span>}
            </NavLink>
          )}

          {hasPermission("order.return.listing.read") && (
            <NavLink to="/sales/orders/returns" className={linkClass} onClick={() => setMobileOpen(false)}>
              <HiOutlineArrowCircleLeft className="text-xl" />
              {!collapsed && <span>Return Requests</span>}
            </NavLink>
          )}


          {/* CAREER MANAGEMENT DROPDOWN */}
          {hasAnyPermission(["career.job.read", "career.job.create"]) && (
            <div className="space-y-1">
              <button onClick={() => toggleDropdown('career')} className={dropdownBtnClass}>
                <span className="flex items-center gap-3">
                  <HiOutlineUserGroup className={`text-xl ${openDropdown === 'career' ? "text-[#E68736]" : "text-gray-500"}`} />
                  {!collapsed && <span>Career Management</span>}
                </span>
                {!collapsed && (
                  <HiChevronDown 
                    className={`transition-transform duration-300 ${openDropdown === 'career' ? "rotate-180" : ""}`} 
                  />
                )}
              </button>
              
              {openDropdown === 'career' && !collapsed && (
                <div className="ml-6 pl-4 border-l-2 border-orange-200 flex flex-col gap-1 py-1">
                  {hasPermission("career.job.create") && (
                    <NavLink to="/catalog/career" className={subLinkClass} onClick={() => setMobileOpen(false)}>
                      Add Job
                    </NavLink>
                  )}
                  {hasPermission("career.job.read") && (
                    <NavLink to="/catalog/career/jobs" className={subLinkClass} onClick={() => setMobileOpen(false)}>
                      Job Listings
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          <NavLink to="/catalog/products/best-selling" className={linkClass} onClick={() => setMobileOpen(false)}>
            <HiOutlineGift className="text-xl" />
            {!collapsed && <span>Best Selling</span>}
          </NavLink>

          {/* MARKETING DROPDOWN */}
          {hasPermission("coupan.listing.read") && (
            <div className="space-y-1">
              <button onClick={() => toggleDropdown('marketing')} className={dropdownBtnClass}>
                <span className="flex items-center gap-3">
                  <HiOutlineTag className={`text-xl ${openDropdown === 'marketing' ? "text-[#E68736]" : "text-gray-500"}`} />
                  {!collapsed && <span>Marketing</span>}
                </span>
                {!collapsed && <HiChevronDown className={`transition-transform duration-300 ${openDropdown === 'marketing' ? "rotate-180" : ""}`} />}
              </button>
              {openDropdown === 'marketing' && !collapsed && (
                <div className="ml-6 pl-4 border-l-2 border-orange-200 flex flex-col gap-1 py-1">
                  <NavLink to="/sales/coupons" className={subLinkClass} onClick={() => setMobileOpen(false)}>Coupon Manager</NavLink>
                </div>
              )}
            </div>
          )}

          {/* CUSTOMER/SUPPORT */}
          {hasAnyPermission(["customer.listing.read", "library.listing.read", "inquiries.listing.read"]) && (
            <>
              {hasPermission("customer.listing.read") && (
                <NavLink to="/crm/customers" className={linkClass} onClick={() => setMobileOpen(false)}>
                  <HiOutlineUserGroup className="text-xl" />
                  {!collapsed && <span>Customers</span>}
                </NavLink>
              )}
              {hasPermission("library.listing.read") && (
                <NavLink to="/crm/contacts" className={linkClass} onClick={() => setMobileOpen(false)}>
                  <HiOutlineChatAlt className="text-xl" />
                  {!collapsed && <span>Library Contact</span>}
                </NavLink>
              )}
              {hasPermission("inquiries.listing.read") && (
                <NavLink to="/crm/inquiries" className={linkClass} onClick={() => setMobileOpen(false)}>
                  <HiOutlineBell className="text-xl" />
                  {!collapsed && <span>Inquiries</span>}
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-orange-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
          >
            <HiOutlineLogout className="text-xl flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}