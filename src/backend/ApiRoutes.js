const BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const VERSION = "/api/v1";
const FULL_API_PATH = `${BASE_URL}${VERSION}`;

export const API_ROUTES = {
 
   AUTH: {
    LOGIN: `${FULL_API_PATH}/employee/login`,
    REFRESH_TOKEN: `${FULL_API_PATH}/employee/refresh-token`,
  },

  EMPLOYEE: {
    CREATE: `${FULL_API_PATH}/employee/create`,
    UPDATE: `${FULL_API_PATH}/employee/role-update`, 
    GET_ALL: `${FULL_API_PATH}/employee/get`,
    CHANGE_PASSWORD: `${FULL_API_PATH}/employee/change-password`,
    FORGOT_PASSWORD: `${FULL_API_PATH}/employee/forget-password`,
    // Dynamic routes using functions
    RESET_PASSWORD: (token) => `${FULL_API_PATH}/employee/reset-password/${token}`,
    VERIFY_EMAIL: (token) => `${FULL_API_PATH}/employee/verify-email/${token}`,
    GET_PROFILE: (email) => `${FULL_API_PATH}/employee/get/${email}`,
  },
  
 ATTENDANCE: {
    // EMPLOYEE SECTION
    PUNCH_IN: `${FULL_API_PATH}/attendance/punch-in`,
    PUNCH_OUT: `${FULL_API_PATH}/attendance/punch-out`,
    PUNCH_OUT_REQUEST: `${FULL_API_PATH}/attendance/punch-out/request`,
    MY_ATTENDANCE: `${FULL_API_PATH}/attendance/my-attendance`,
    LEAVE_REQUEST: `${FULL_API_PATH}/attendance/leave-request`,
    MY_DASHBOARD: `${FULL_API_PATH}/attendance/my-dashboard`,
    HOLIDAYS: `${FULL_API_PATH}/attendance/holidays`,
    // Get specific leave status
    GET_LEAVE_DETAILS: (id) => `${FULL_API_PATH}/attendance/leave-request/${id}`,

    // ADMIN SECTION
    ADMIN: {
      GET_ALL_ATTENDANCES: `${FULL_API_PATH}/attendance/admin/attendances`,
      FILTER_APPROVALS: `${FULL_API_PATH}/attendance/admin/attendance-approvals/filter`,
      LEAVE_REQUESTS: `${FULL_API_PATH}/attendance/admin/leave-requests`,
      PUNCHOUT_REQUESTS: `${FULL_API_PATH}/attendance/admin/punchout-requests`,
      // Action Routes (Approve/Reject)
      PUNCHOUT_ACTION: (id) => `${FULL_API_PATH}/attendance/admin/punchout-requests/action/${id}`,
      LEAVE_ACTION: (id) => `${FULL_API_PATH}/attendance/admin/leave-requests/action/${id}`,
      // Holiday Management
      MANAGE_HOLIDAY: `${FULL_API_PATH}/attendance/admin/holiday`,
    }
  },

  PERMISSION: {
    CREATE: `${FULL_API_PATH}/permission/create`,
    GET_ALL: `${FULL_API_PATH}/permission/all`,
    AUDIT_LOGS: `${FULL_API_PATH}/permission/audit-logs`,
    ASSIGN: `${FULL_API_PATH}/permission/assign`,
    REMOVE: `${FULL_API_PATH}/permission/remove`,
    // Dynamic ID for deleting a specific permission
    DELETE: (id) => `${FULL_API_PATH}/permission/delete/${id}`, 
  },

  ANALYTICS: {
    // Customer usage stats (GEN, SCR, ABT)
    CUSTOMER_USAGE: `${FULL_API_PATH}/librarylog/dashboard`,
    
    // IP and Geo-location traffic
    IP_TRAFFIC: `${FULL_API_PATH}/ipAnalytics`,
    
    IP_DASHBOARD: `${FULL_API_PATH}/ipAnalytics/dashboard`,
    
    // Regional Order insights
    ORDER_INSIGHTS: `${FULL_API_PATH}/order/dashboard`,
    
    // Product performance
    BEST_SELLING: `${FULL_API_PATH}/product/best-selling`,
  },

  PRODUCT: {
    ADD: `${FULL_API_PATH}/product/add`,
    GET_ACTIVE: `${FULL_API_PATH}/product/get/status/active`,
    UPDATE: (id) => `${FULL_API_PATH}/product/update/${id}`,
    DELETE: (id) => `${FULL_API_PATH}/product/delete/${id}`,
    GET_BY_ID: (id) => `${FULL_API_PATH}/product/getById/${id}`,
    GET_ALL: `${FULL_API_PATH}/product/get/status/all`,
    DUPLICATE: `${FULL_API_PATH}/product/duplicate`,
    UPDATE_STOCK: (id) => `${FULL_API_PATH}/product/stock/${id}`,
  },

  BRAND: {
    CREATE: `${FULL_API_PATH}/brand/create`,
    UPDATE: (id) => `${FULL_API_PATH}/brand/update/${id}`,
    DELETE: (id) => `${FULL_API_PATH}/brand/delete/${id}`,
    GET_ALL: `${FULL_API_PATH}/brand/all?limit=100`, // Assuming you want to fetch all brands without pagination
  },

  CATEGORY: {
    GET: `${FULL_API_PATH}/category/get`,
    CREATE: `${FULL_API_PATH}/category/create`,
    UPDATE: (id) => `${FULL_API_PATH}/category/update/${id}`,
    DELETE: (id) => `${FULL_API_PATH}/category/delete/${id}`,
  },

  BANNER: {
    CREATE: `${FULL_API_PATH}/banner/create`,
    GET_ALL: `${FULL_API_PATH}/banner/get`,
    GET_BY_FILTERS: `${FULL_API_PATH}/banner/get/status`,
    UPDATE: (id) => `${FULL_API_PATH}/banner/update/${id}`,
    DELETE: (id) => `${FULL_API_PATH}/banner/delete/${id}`,
  },

  VIDEO: {
    ADD: `${FULL_API_PATH}/video/add`,
    GET_ALL: `${FULL_API_PATH}/video/get`,
    UPDATE: (id) => `${FULL_API_PATH}/video/update/${id}`,
    DELETE: (id) => `${FULL_API_PATH}/video/delete/${id}`,
  },

  COUPON: {
    CREATE: `${FULL_API_PATH}/coupons/create`,
    FILTER: (status = 'all') => `${FULL_API_PATH}/coupons/filter/${status}`,
    GET_BY_ID: (id) => `${FULL_API_PATH}/coupons/get/${id}`,
    UPDATE: (id) => `${FULL_API_PATH}/coupons/update/${id}`,
    DELETE: (id) => `${FULL_API_PATH}/coupons/delete/${id}`,
  },

 ORDER: {
    GET_ALL: `${FULL_API_PATH}/order/get/all`,
    GET_BY_ID: (id) => `${FULL_API_PATH}/order/get/${id}`,
    GET_BY_STATUS: (status) => `${FULL_API_PATH}/order/get/status/${status}`,
    UPDATE_STATUS: (orderId) => `${FULL_API_PATH}/order/${orderId}/status`,
    UPDATE_COURIER: (orderId) => `${FULL_API_PATH}/order/courier/${orderId}`,
    
    // Return & Refund Routes
    GET_RETURN_REQUESTS: `${FULL_API_PATH}/order/return-req/get`,
    UPDATE_RETURN_STATUS: (orderId, requestId) => `${FULL_API_PATH}/order/return/update/status/${orderId}/${requestId}`,
    EXECUTE_REFUND: (orderId) => `${FULL_API_PATH}/order/refund/complete/admin/${orderId}`,
  },

  CONTACT: {
    GET_ALL: `${FULL_API_PATH}/contact/get`,
    GET_BY_ID: (id) => `${FULL_API_PATH}/contact/get/${id}`,
  },

  CUSTOMER: {
    GET_ALL: `${FULL_API_PATH}/librarylog/getAll`,
    GET_BY_ID: (id) => `${FULL_API_PATH}/librarylog/getById/${id}`,
    PATCH :`${FULL_API_PATH}/librarylog/scanbridge`
  },

  USER:{
    GET_ALL: `${FULL_API_PATH}/user/get`,
  },

  CAREER: {
    CREATE_JOB: `${FULL_API_PATH}/career/manage/jobs`,
    GET_ALL: `${FULL_API_PATH}/career/manage/jobs`,
    GET_BY_ID: (id) => `${FULL_API_PATH}/career/manage/jobs/${id}`,
    UPDATE: (id) => `${FULL_API_PATH}/career/manage/jobs/${id}`,
    DELETE: (id) => `${FULL_API_PATH}/career/manage/jobs/${id}`,
    GET_APPLICATIONS: `${FULL_API_PATH}/career/manage/applications/career.application.read`,
    GET_APPLICATION_BY_ID: (id) => `${FULL_API_PATH}/career/manage/applications/${id}/career.application.read`,
    UPDATE_STATUS: (id) => `${FULL_API_PATH}/career/manage/applications/${id}/status`,
  },

  BLOG: {
    CREATE: `${FULL_API_PATH}/blog/create`,
    GET_ALL: (permission) => `${FULL_API_PATH}/blog/manage/get/${permission}`,
    GET_SINGLE: (blogId, permission) => `${FULL_API_PATH}/blog/manage/get/${blogId}/${permission}`,
    UPDATE: (blogId) => `${FULL_API_PATH}/blog/update/${blogId}`,
    DELETE: (blogId) => `${FULL_API_PATH}/blog/manage/delete/${blogId}`,
  },

INVOICE: {
    CREATE: `${FULL_API_PATH}/invoice/create`,
    GET_ALL: `${FULL_API_PATH}/invoice/get`,
    GET_BY_ID: (id) => `${FULL_API_PATH}/invoice/get/${id}`,
    UPDATE: (id) => `${FULL_API_PATH}/invoice/update/${id}`,
    DELETE: (id) => `${FULL_API_PATH}/invoice/delete/${id}`,
  },
};

