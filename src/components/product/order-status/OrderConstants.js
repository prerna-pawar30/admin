// OrderConstants.js (NO JSX version)
export const FILTER_STATUS_OPTIONS = ["All orders", "pending", "placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];

export const STATUS_PROGRESSION = {
  pending: ["confirmed", "cancelled"],
  placed: ["confirmed", "cancelled"],
  confirmed: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: []
};

// Store only strings/data, not components
export const getStatusConfig = (status) => {
  const map = {
    delivered: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500", iconName: "check" },
    shipped: { color: "text-blue-600 bg-blue-50 border-blue-100", dot: "bg-blue-500", iconName: "truck" },
    packed: { color: "text-purple-600 bg-purple-50 border-purple-100", dot: "bg-purple-500", iconName: "box" },
    confirmed: { color: "text-cyan-600 bg-cyan-50 border-cyan-100", dot: "bg-cyan-500", iconName: "check" },
    pending: { color: "text-orange-600 bg-orange-50 border-orange-100", dot: "bg-orange-500", iconName: "clock" },
    placed: { color: "text-orange-600 bg-orange-50 border-orange-100", dot: "bg-orange-500", iconName: "clock" },
    cancelled: { color: "text-rose-600 bg-rose-50 border-rose-100", dot: "bg-rose-500", iconName: "x" },
  };
  return map[status] || { color: "text-slate-600 bg-slate-50 border-slate-100", dot: "bg-slate-400", iconName: "clock" };
};