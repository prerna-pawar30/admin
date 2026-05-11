import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/AuthSlice";
import logoDefault from "../../assets/home/digident-png .png";
import { User, LogOut, ChevronDown, ShieldCheck, Bell, Menu, X } from "lucide-react";

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { user, role, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = Number(role) === 0 || Number(role) === 1;
  const homePath = isAdmin ? "/" : "/workforce/dashboard";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    navigate("/login");
  };

  // Prefer full name; if login API only returned token/email, show email (never fake "Loading...").
  const displayName = (() => {
    if (!user) return "Guest";
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;
    if (user.email) return user.email;
    return "Guest";
  })();

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[140] flex w-full max-w-[100vw] items-center justify-between border-b border-orange-100 px-3 transition-all duration-300 sm:px-6 md:px-8 ${
        isScrolled
          ? "h-16 bg-[#F7E6DC] shadow-md backdrop-blur-md"
          : "h-20 bg-[#F7E6DC]"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          className="relative z-[160] shrink-0 rounded-lg p-2 text-gray-700 transition-colors hover:bg-white/50 md:hidden"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link
          to={homePath}
          className="min-w-0 shrink-0"
          onClick={() => setShowDropdown(false)}
        >
          <img
            src={logoDefault}
            alt="Logo"
            className={`h-auto max-h-10 w-auto max-w-[min(140px,40vw)] object-contain transition-all duration-300 sm:max-w-[180px] ${
              isScrolled ? "max-h-8" : "max-h-10"
            }`}
          />
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
        {isAuthenticated && (
          <>
            <button
              type="button"
              className="relative hidden rounded-full p-2 text-gray-600 transition-colors hover:bg-white/50 sm:inline-flex"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-transparent p-1 transition-all hover:border-orange-200 hover:bg-white/50 sm:gap-2"
                aria-expanded={showDropdown}
                aria-haspopup="menu"
              >
                <div className="hidden min-w-0 flex-col text-right sm:flex">
                  <span className="max-w-[140px] truncate text-xs font-bold leading-none text-gray-800 md:max-w-[200px]">
                    {displayName}
                  </span>
                  <span className="mt-1 text-[8px] font-bold uppercase text-[#E68736]">
                    {isAdmin ? "Admin" : "Employee"}
                  </span>
                </div>
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                    isAdmin ? "bg-slate-800" : "bg-[#E68736]"
                  }`}
                >
                  {isAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
                </div>
                <ChevronDown
                  size={14}
                  className={`hidden text-gray-400 transition-transform duration-300 md:block ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDropdown && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-[130] cursor-default bg-black/20 md:bg-black/10"
                    aria-hidden
                    onClick={() => setShowDropdown(false)}
                  />
                  <div
                    className="absolute right-0 z-[150] mt-3 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-2xl"
                    role="menu"
                  >
                    <Link
                      to="/account/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50"
                    >
                      <User size={16} /> My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}