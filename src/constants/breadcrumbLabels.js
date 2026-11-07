export const SEGMENT_LABELS = {
  "": "Home",
  dashboard: "Dashboard",
  products: "Products",
  add: "Add New",
  "add-blog": "Add Blog",
  blogs: "Blogs",
  career: "Careers",
  jobs: "Job Listings",
  "invoice-list": "Invoices",
  "create-invoice": "Create Invoice",
  reviews: "Product Reviews",
  testimonials: "Testimonials",
  scanbridge: "ScanBridge",
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
  payroll: "Payroll",
  "my-salary": "My Salary",
  holidays: "Holidays",
  "team-leaves": "Team Leave Calendar",
  "tasks-assign": "Task Management",
  "my-tasks": "My Tasks",
  edit: "Edit Information",
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

const ADD_LABELS = {
  products: "Add Product",
  categories: "Add Category",
  brands: "Add Brand",
  banners: "Add Banner",
  videos: "Add Video",
};

export function labelForSegment(segment, previous) {
  if (segment === "add" && ADD_LABELS[previous]) return ADD_LABELS[previous];

  if (SEGMENT_LABELS[segment]) {
    return SEGMENT_LABELS[segment];
  }

  const isId = /^[a-f\d]{24}$/i.test(segment) || /^\d+$/.test(segment);
  if (isId) return "Details";

  return formatSegment(segment);
}
