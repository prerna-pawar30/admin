import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/AuthSlice";
import logoDefault from "../../assets/home/digident-png .png";
import { User, LogOut, ChevronDown, ShieldCheck, Bell, Menu, X, BellOff, Settings } from "lucide-react";
import {
  clearNotifications,
  markNotificationRead,
} from "../../store/slices/NotificationSlice";
import "../../App";

// ─── Injected styles ───────────────────────────────────────────────────────────
const headerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .header-root * { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── Page-load entrance ── */
  @keyframes headerSlideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }
  .header-root { animation: headerSlideDown 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  /* ── Logo float ── */
  @keyframes logoFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-2px); }
  }
  .logo-img { animation: logoFloat 4s ease-in-out infinite; }
  .logo-img:hover { animation: none; transform: scale(1.04); transition: transform 0.2s ease; }

  /* ── Dropdown pop ── */
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.94) translateY(-6px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);    }
  }
  .dropdown-pop { animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: top right; }

  /* ── Notification badge pulse ── */
  @keyframes badgePulse {
    0%   { box-shadow: 0 0 0 0 rgba(244,63,94,0.6); }
    70%  { box-shadow: 0 0 0 6px rgba(244,63,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); }
  }
  .badge-pulse { animation: badgePulse 2s ease infinite; }

  /* ── Bell ring ── */
  @keyframes bellRing {
    0%, 100% { transform: rotate(0deg); }
    10%       { transform: rotate(14deg); }
    20%       { transform: rotate(-12deg); }
    30%       { transform: rotate(10deg); }
    40%       { transform: rotate(-8deg); }
    50%       { transform: rotate(0deg); }
  }
  .bell-ring { animation: bellRing 0.8s ease; }

  /* ── Avatar ring spin ── */
  @keyframes ringRotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .avatar-ring-spin { animation: ringRotate 3s linear infinite; }

  /* ── Notification item slide ── */
  @keyframes notifSlide {
    from { opacity: 0; transform: translateX(10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .notif-item { animation: notifSlide 0.2s ease forwards; }

  /* ── Scrollbar ── */
  .notif-scroll::-webkit-scrollbar { width: 3px; }
  .notif-scroll::-webkit-scrollbar-track { background: transparent; }
  .notif-scroll::-webkit-scrollbar-thumb { background: #E68736; border-radius: 10px; }

  /* ── Hamburger morph ── */
  .ham-icon { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  .ham-open  { transform: rotate(90deg) scale(1.1); }

  /* ── Profile btn hover glow ── */
  .profile-btn { transition: all 0.25s ease; }
  .profile-btn:hover { box-shadow: 0 0 0 3px rgba(230,135,54,0.2); }

  /* ── Shrink transition ── */
  .header-shrink { transition: height 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease; }

  /* ── Dropdown item hover ── */
  .dd-item { position: relative; overflow: hidden; }
  .dd-item::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 0;
    background: linear-gradient(90deg, rgba(230,135,54,0.12), transparent);
    transition: width 0.2s ease;
    border-radius: 0 8px 8px 0;
  }
  .dd-item:hover::before { width: 100%; }

  /* scrolled glass effect */
  .header-scrolled {
    background: rgba(247, 230, 220, 0.92) !important;
    backdrop-filter: blur(16px) saturate(1.4) !important;
    -webkit-backdrop-filter: blur(16px) saturate(1.4) !important;
  }

  /* name truncation */
  .display-name { max-width: 140px; }
  @media (min-width: 768px) { .display-name { max-width: 200px; } }
`;

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const bellRef = useRef(null);
const {
  notifications,
  unreadCount,
} = useSelector((state) => state.notifications);

  const { user, role, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = Number(role) === 0 || Number(role) === 1;
  const homePath = isAdmin ? "/" : "/workforce/dashboard";
  const [showNotifications, setShowNotifications] = useState(false);

useEffect(() => {
  if (unreadCount > 0) {
    setBellAnimating(true);

    const timer = setTimeout(() => {
      setBellAnimating(false);
    }, 900);

    return () => clearTimeout(timer);
  }
}, [unreadCount]);


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

  const clearSingleNotification = (e, id) => {
    e.stopPropagation();
    dispatch(markNotificationRead(id));
  };

 const clearAllNotifications = () => {
  dispatch(clearNotifications());
};

  const displayName = (() => {
    if (!user) return "Guest";
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;
    if (user.email) return user.email;
    return "Guest";
  })();

  // Initials for avatar
  const initials = (() => {
    if (!user) return "G";
    const f = user.firstName?.[0] || "";
    const l = user.lastName?.[0] || "";
    return (f + l).toUpperCase() || user.email?.[0]?.toUpperCase() || "U";
  })();

  return (
    <>
      <style>{headerStyles}</style>

      <header
        className={[
          "header-root header-shrink",
          "fixed left-0 right-0 top-0 z-[140]",
          "flex w-full max-w-[100vw] items-center justify-between",
          "border-b border-orange-100/80 px-3 sm:px-6 md:px-8",
          isScrolled
            ? "header-scrolled h-16 shadow-[0_4px_24px_rgba(230,135,54,0.12)]"
            : "h-20 bg-[#F7E6DC]",
        ].join(" ")}
      >
        {/* ─── Left — Hamburger + Logo ─── */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
            className="relative z-[160] shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-white/60 border border-orange-100 shadow-sm hover:bg-white hover:border-[#E68736] hover:shadow-[0_0_0_3px_rgba(230,135,54,0.15)] transition-all duration-200 md:hidden"
            aria-expanded={isSidebarOpen}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <span className={`ham-icon ${isSidebarOpen ? "ham-open" : ""}`}>
              {isSidebarOpen ? (
                <X size={18} className="text-[#E68736]" />
              ) : (
                <Menu size={18} className="text-gray-600" />
              )}
            </span>
          </button>

          {/* Logo */}
          <Link
            to={homePath}
            className="min-w-0 shrink-0 flex items-center"
            onClick={() => setShowDropdown(false)}
          >
            <img
              src={logoDefault}
              alt="Logo"
              className={`logo-img h-auto object-contain transition-all duration-300
                ${isScrolled ? "max-h-8" : "max-h-15"}
                max-w-[min(140px,40vw)] sm:max-w-[180px]`}
            />
          </Link>

          
      
        </div>

        {/* ─── Right — Actions ─── */}
        {isAuthenticated && (
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">

            {/* ── Notification Bell ── */}
            <div className="relative">
              <button
                ref={bellRef}
                type="button"
                onClick={() => {
                  setShowNotifications((v) => !v);
                  setShowDropdown(false);
                }}
                className={[
                  "relative flex h-9 w-9 items-center justify-center rounded-xl",
                  "border border-transparent transition-all duration-200",
                  "hover:bg-white hover:border-orange-200 hover:shadow-[0_0_0_3px_rgba(230,135,54,0.12)]",
                  showNotifications ? "bg-white border-orange-200 text-[#E68736]" : "text-gray-500",
                  bellAnimating ? "bell-ring" : "",
                ].join(" ")}
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={2} />

                {notifications.length > 0 && (
                  <span className="badge-pulse absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black leading-none text-white ring-2 ring-[#F7E6DC]">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-[130] cursor-default"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="dropdown-pop absolute right-0 z-[150] mt-2.5 w-80 overflow-hidden rounded-2xl border border-orange-100/80 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">

                    {/* Notif header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/80 bg-gradient-to-r from-[#FDF0E8] to-white">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#E68736]/15 flex items-center justify-center">
                          <Bell size={12} className="text-[#E68736]" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-800">Notifications</span>
                        {notifications.length > 0 && (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#E68736]">
                            {notifications.length}
                          </span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllNotifications}
                          className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Notif list */}
                    <div className="notif-scroll max-h-72 divide-y divide-gray-50/80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                          <div className="mb-3 w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                            <BellOff size={22} />
                          </div>
                          <p className="text-[13px] font-semibold text-gray-500">All caught up!</p>
                          <p className="mt-0.5 text-[11px] text-gray-400">No new notifications yet.</p>
                        </div>
                      ) : (
                        notifications.map((notif, index) => (
                          <div
                            key={notif.id}
                            className="notif-item group relative flex items-start gap-3 px-4 py-3.5 hover:bg-orange-50/40 transition-colors"
                            style={{ animationDelay: `${index * 0.04}s` }}
                          >
                            {/* Dot */}
                            <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-[#E68736] shadow-[0_0_4px_rgba(230,135,54,0.5)]" />
                            <div className="min-w-0 flex-1 pr-6">
                              {notif.title && (
                                <p className="mb-0.5 truncate text-[12px] font-bold text-gray-800">
                                  {notif.title}
                                </p>
                              )}
                              <p className="text-[11.5px] leading-relaxed text-gray-500 break-words">
                                {notif.message || JSON.stringify(notif)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => clearSingleNotification(e, index)}
                              className="absolute right-3 top-3.5 flex h-6 w-6 items-center justify-center rounded-lg bg-transparent text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-500 transition-all duration-150"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="hidden sm:block w-px h-6 bg-orange-200/60 mx-1 rounded-full" />

            {/* ── Profile Dropdown ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowDropdown((v) => !v);
                  setShowNotifications(false);
                }}
                className={[
                  "profile-btn flex items-center gap-2 rounded-xl px-2 py-1.5",
                  "border transition-all duration-200",
                  showDropdown
                    ? "bg-white border-orange-200 shadow-[0_0_0_3px_rgba(230,135,54,0.12)]"
                    : "border-transparent hover:bg-white/70 hover:border-orange-100",
                ].join(" ")}
              >
                {/* Name + role — desktop */}
                <div className="hidden min-w-0 flex-col text-right sm:flex">
                  <span className="display-name truncate text-[12.5px] font-bold leading-none text-gray-800">
                    {displayName}
                  </span>
                  <span className="mt-[3px] text-[9px] font-extrabold uppercase tracking-wider text-[#E68736]">
                    {isAdmin ? "Administrator" : "Employee"}
                  </span>
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                  {/* Spinning ring for admin */}
                  {isAdmin && (
                    <svg
                      className="avatar-ring-spin absolute -inset-[3px] z-0"
                      viewBox="0 0 44 44"
                      style={{ width: 42, height: 42 }}
                    >
                      <circle
                        cx="21" cy="21" r="19"
                        fill="none"
                        stroke="url(#adminGrad)"
                        strokeWidth="1.5"
                        strokeDasharray="8 4"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="adminGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#E68736" />
                          <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}

                  <div
                    className={[
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white text-[12px] font-black shadow-md",
                      isAdmin
                        ? "bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-700/30"
                        : "bg-gradient-to-br from-[#E68736] to-[#d4722b] shadow-orange-500/30",
                    ].join(" ")}
                  >
                    {isAdmin ? <ShieldCheck size={15} /> : initials}
                  </div>
                </div>

                <ChevronDown
                  size={13}
                  className={[
                    "hidden text-gray-400 transition-transform duration-300 md:block",
                    showDropdown ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {/* Profile dropdown menu */}
              {showDropdown && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-[130] cursor-default"
                    aria-hidden
                    onClick={() => setShowDropdown(false)}
                  />
                  <div
                    className="dropdown-pop absolute right-0 z-[150] mt-2.5 w-52 overflow-hidden rounded-2xl border border-orange-100/80 bg-white py-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                    role="menu"
                  >
                    {/* User info banner */}
                    <div className="px-4 py-3 mb-1 border-b border-gray-50 bg-gradient-to-r from-[#FDF0E8] to-white">
                      <p className="text-[12.5px] font-bold text-gray-800 truncate">{displayName}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">
                        {user?.email || ""}
                      </p>
                    </div>

                    <Link
                      to="/account/profile"
                      onClick={() => setShowDropdown(false)}
                      className="dd-item flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:text-[#E68736] transition-colors"
                    >
                      <User size={14} /> My Profile
                    </Link>

                    <div className="my-1 mx-3 h-px bg-gray-100 rounded-full" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dd-item flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}