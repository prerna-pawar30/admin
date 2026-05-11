import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { dismissToast } from "../../store/slices/uiSlice";

const variantStyles = {
  success:
    "bg-white border-l-4 border-[#E68736] text-gray-900 shadow-lg shadow-black/5",
  error: "bg-white border-l-4 border-red-600 text-gray-900 shadow-lg shadow-black/5",
  warning:
    "bg-white border-l-4 border-amber-500 text-gray-900 shadow-lg shadow-black/5",
  info: "bg-white border border-gray-200 text-gray-900 shadow-md",
};

function ToastItem({ id, message, variant, duration }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const t = window.setTimeout(() => dispatch(dismissToast(id)), duration);
    return () => clearTimeout(t);
  }, [id, duration, dispatch]);

  return (
    <div
      className={`pointer-events-auto relative flex items-start gap-3 rounded-lg px-4 py-3 pr-10 ${variantStyles[variant] || variantStyles.info}`}
    >
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button
        type="button"
        className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-black/5 hover:text-gray-800"
        onClick={() => dispatch(dismissToast(id))}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function ToastHost() {
  const toasts = useSelector((state) => state.ui.toasts);

  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-24 z-[200] flex max-w-md flex-col gap-2 md:right-8"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
}
