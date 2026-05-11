export const SEGMENT_LABELS = {
  "": "Home",
  dashboard: "Dashboard",
  products: "Products",
  add: "Add Product",
  "best-selling": "Best Selling",
  stock: "Stock Control",
  categories: "Categories",
  brands: "Brands",
  orders: "Orders",
  tracking: "Order Tracking",
  returns: "Return Requests",
  coupons: "Coupons",
  employees: "Employees",
  create: "Create Employee",
  attendance: "Attendance",
  portal: "My Attendance",
  logs: "Logs & Leaves",
  permissions: "Permissions",
  inquiries: "Inquiries",
  customers: "Customers",
  contacts: "Contact Library",
  banners: "Banners",
  videos: "Videos",
  profile: "Profile",
  "change-password": "Change Password",
};

export const BREADCRUMB_OMIT_SEGMENTS = new Set([
  "catalog",
  "sales",
  "workforce",
  "crm",
  "marketing",
  "account",
]);

const formatSegment = (segment) => {
  if (!segment) return "";
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function labelForSegment(segment) {
  if (SEGMENT_LABELS[segment]) {
    return SEGMENT_LABELS[segment];
  }

  const isId = /^[a-f\d]{24}$/i.test(segment) || /^\d+$/.test(segment);
  if (isId) return "Details";

  return formatSegment(segment);
}
