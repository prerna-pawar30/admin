import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/AuthSlice";
import logoDefault from "../../assets/home/digident-logo.png";
import { User, LogOut, ChevronDown, Bell, Menu, X, BellOff, Trash2, Check, KeyRound } from "lucide-react";
import {
  markNotificationRead,
  setNotifications,
  removeNotification,
  clearNotifications,
} from "../../store/slices/NotificationSlice";
import { NotificationService } from "../../backend/ApiService";

const timeAgo = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const bellRef = useRef(null);

  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const { user, role, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = Number(role) === 0 || Number(role) === 1;
  const homePath = isAdmin ? "/" : "/workforce/dashboard";
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await NotificationService.getNotifications();
        if (response.success) {
          dispatch(setNotifications(response.data.notifications || []));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotifications();
  }, [dispatch]);

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
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus with Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    navigate("/login");
  };

  const clearSingleNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await NotificationService.markAsRead(id);
      dispatch(markNotificationRead(id));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSingleNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await NotificationService.deleteNotification(id);
      dispatch(removeNotification(id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await NotificationService.markAllAsRead();
      const response = await NotificationService.getNotifications();
      if (response.success) {
        dispatch(setNotifications(response.data.notifications || []));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const purgeAllNotifications = async () => {
    try {
      await NotificationService.deleteAllNotifications();
      dispatch(clearNotifications());
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    }
  };

  const displayName = (() => {
    if (!user) return "Guest";
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;
    if (user.email) return user.email;
    return "Guest";
  })();

  const initials = (() => {
    if (!user) return "G";
    const f = user.firstName?.[0] || "";
    const l = user.lastName?.[0] || "";
    return (f + l).toUpperCase() || user.email?.[0]?.toUpperCase() || "U";
  })();

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-[140] flex h-[var(--app-header-h)] items-center justify-between gap-3 bg-white/95 backdrop-blur",
        "border-b px-3 sm:px-5 transition-shadow duration-200",
        isScrolled ? "border-slate-200 shadow-[0_1px_12px_rgba(15,23,42,0.06)]" : "border-slate-200/70",
      ].join(" ")}
    >
      {/* Left — menu + logo */}
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          to={homePath}
          className="flex shrink-0 items-center rounded-lg px-1 lg:w-[calc(var(--app-sidebar-w)-1.25rem)]"
          onClick={() => setShowDropdown(false)}
        >
          <img src={logoDefault} alt="Digident" className="h-9 w-auto object-contain sm:h-10" />
        </Link>
      </div>

      {/* Right — actions */}
      {isAuthenticated && (
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              ref={bellRef}
              type="button"
              onClick={() => {
                setShowNotifications((v) => !v);
                setShowDropdown(false);
              }}
              className={[
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                showNotifications ? "bg-brand-50 text-brand-600" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                bellAnimating ? "animate-[wiggle_0.8s_ease]" : "",
              ].join(" ")}
              aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
              aria-expanded={showNotifications}
            >
              <Bell size={19} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-[130]" aria-hidden onClick={() => setShowNotifications(false)} />
                <div className="fixed inset-x-3 top-[calc(var(--app-header-h)+0.5rem)] z-[150] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.15)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={clearAllNotifications}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        >
                          Mark all read
                        </button>
                        <button
                          type="button"
                          onClick={purgeAllNotifications}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-50"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="max-h-[min(420px,70vh)] divide-y divide-slate-100 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <BellOff size={20} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">You&apos;re all caught up</p>
                        <p className="mt-0.5 text-xs text-slate-500">New alerts will show up here.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isRead = notif.isRead === true || notif.read === true;
                        return (
                          <div
                            key={notif._id}
                            onClick={(e) => {
                              if (!isRead) clearSingleNotification(e, notif._id);
                            }}
                            className={`group relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${
                              isRead ? "hover:bg-slate-50" : "bg-brand-50/40 hover:bg-brand-50/70"
                            }`}
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isRead ? "bg-transparent" : "bg-brand-500"}`}
                              aria-hidden
                            />
                            <div className="min-w-0 flex-1 pr-14">
                              {notif.title && (
                                <p className={`truncate text-[13px] ${isRead ? "font-medium text-slate-600" : "font-semibold text-slate-900"}`}>
                                  {notif.title}
                                </p>
                              )}
                              <p className={`mt-0.5 break-words text-[12.5px] leading-snug ${isRead ? "text-slate-400" : "text-slate-600"}`}>
                                {notif.message || "New notification"}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-400">{timeAgo(notif.createdAt)}</p>
                            </div>
                            <div className="absolute right-3 top-3 flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                              {!isRead && (
                                <button
                                  type="button"
                                  title="Mark as read"
                                  onClick={(e) => clearSingleNotification(e, notif._id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800"
                                >
                                  <Check size={13} />
                                </button>
                              )}
                              <button
                                type="button"
                                title="Delete"
                                onClick={(e) => deleteSingleNotification(e, notif._id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowDropdown((v) => !v);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 transition-colors sm:pr-2 ${
                showDropdown ? "bg-slate-100" : "hover:bg-slate-100"
              }`}
              aria-expanded={showDropdown}
              aria-haspopup="menu"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${
                  isAdmin ? "bg-slate-800" : "bg-brand-500"
                }`}
              >
                {initials}
              </span>
              <span className="hidden min-w-0 flex-col text-left sm:flex">
                <span className="max-w-[160px] truncate text-[13px] font-semibold leading-tight text-slate-900">{displayName}</span>
                <span className="text-[11px] leading-tight text-slate-500">{isAdmin ? "Administrator" : "Employee"}</span>
              </span>
              <ChevronDown
                size={15}
                className={`hidden text-slate-400 transition-transform duration-200 sm:block ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-[130]" aria-hidden onClick={() => setShowDropdown(false)} />
                <div
                  className="absolute right-0 top-full z-[150] mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.15)]"
                  role="menu"
                >
                  <div className="mb-1 border-b border-slate-100 px-3 pb-3 pt-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email || ""}</p>
                  </div>
                  <Link
                    to="/account/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    <User size={16} className="text-slate-400" /> My Profile
                  </Link>
                  <Link
                    to="/account/change-password"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    <KeyRound size={16} className="text-slate-400" /> Change Password
                  </Link>
                  <div className="my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50"
                    role="menuitem"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
