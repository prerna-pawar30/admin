import apiClient from '../utils/apiClient';
import { API_ROUTES } from './ApiRoutes';

export const loginUser = async (credentials) => {
  const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, credentials);
  return response.data;
};

export const AuthService = {
  login: async (formData) => {
    const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, formData);
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post(API_ROUTES.AUTH.REFRESH_TOKEN);
    return response.data;
  }
};

export const EmployeeService = {
  getAllEmployees: async () => {
    const response = await apiClient.get(API_ROUTES.EMPLOYEE.GET_ALL);
    return response.data;
  },

  // Fetch single employee by email
  getEmployeeByEmail: async (email) => {
    const response = await apiClient.get(API_ROUTES.EMPLOYEE.GET_PROFILE(email));
    return response.data;
  },

  // Create new employee (POST)
  createEmployee: async (employeeData) => {
    // employeeData includes: firstName, lastName, email, password, role, etc.
    const response = await apiClient.post(API_ROUTES.EMPLOYEE.CREATE, employeeData);
    return response.data;
  },

  updateEmployee: async (updateData) => {
    // updateData should be { email, role, permission }
    const response = await apiClient.put(API_ROUTES.EMPLOYEE.UPDATE, updateData);
    return response.data;
  },

  // Logged in user changing their password
  changePassword: async (passwords) => {
    const response = await apiClient.post(API_ROUTES.EMPLOYEE.CHANGE_PASSWORD, passwords);
    return response.data;
  },

  // Request a password reset link
  forgotPassword: async (email) => {
    const response = await apiClient.post(API_ROUTES.EMPLOYEE.FORGOT_PASSWORD, { email });
    return response.data;
  },

  // Submit new password using the token from URL
  resetPassword: async (token, passwordData) => {
    const url = API_ROUTES.EMPLOYEE.RESET_PASSWORD(token);
    const response = await apiClient.post(url, passwordData);
    return response.data;
  },

  // Verify email via token
  verifyEmail: async (token) => {
    const response = await apiClient.post(API_ROUTES.EMPLOYEE.VERIFY_EMAIL(token));
    return response.data;
  }
};

export const AttendanceService = {
  getMyAttendance: async () => (await apiClient.get(API_ROUTES.ATTENDANCE.MY_ATTENDANCE)).data,
  punchIn: async () => (await apiClient.post(API_ROUTES.ATTENDANCE.PUNCH_IN)).data,
  punchOut: async () => (await apiClient.post(API_ROUTES.ATTENDANCE.PUNCH_OUT)).data,
  getDashboardStats: async () => 
    (await apiClient.get(API_ROUTES.ATTENDANCE.MY_DASHBOARD)).data,
// From your provided code:
    submitPunchOutRequest: async (data) => 
    (await apiClient.post(API_ROUTES.ATTENDANCE.PUNCH_OUT_REQUEST, data)).data,

  submitLeaveRequest: async (leaveData) => 
    (await apiClient.post(API_ROUTES.ATTENDANCE.LEAVE_REQUEST, leaveData)).data,

  getLeaveStatus: async (id) => 
    (await apiClient.get(API_ROUTES.ATTENDANCE.GET_LEAVE_DETAILS(id))).data,

  getHolidays: async () => (await apiClient.get(API_ROUTES.ATTENDANCE.HOLIDAYS)).data,
};

export const AdminAttendanceService = {
  // Fetching Lists
  getAllEmployeeAttendances: async () => 
    (await apiClient.get(API_ROUTES.ATTENDANCE.ADMIN.GET_ALL_ATTENDANCES)).data,

  getPendingLeaves: async () => 
    (await apiClient.get(API_ROUTES.ATTENDANCE.ADMIN.LEAVE_REQUESTS)).data,

  getPendingPunchouts: async () => 
    (await apiClient.get(API_ROUTES.ATTENDANCE.ADMIN.PUNCHOUT_REQUESTS)).data,

  filterApprovals: async (filters) => 
    (await apiClient.post(API_ROUTES.ATTENDANCE.ADMIN.FILTER_APPROVALS, filters)).data,

  // Decision Logic (Approve/Reject)
  processPunchout: async (id, action) => {
    // action: "APPROVED" or "REJECTED"
    const url = API_ROUTES.ATTENDANCE.ADMIN.PUNCHOUT_ACTION(id);
    const response = await apiClient.post(url, { action });
    return response.data;
  },

  processLeave: async (id, action) => {
    // action: "APPROVED" or "REJECTED"
    const url = API_ROUTES.ATTENDANCE.ADMIN.LEAVE_ACTION(id);
    const response = await apiClient.post(url, { action });
    return response.data;
  },

  // Holiday Management
  addHoliday: async (holidayData) => {
    // holidayData: { date: "2026-01-18", title: "Holi" }
    const response = await apiClient.post(API_ROUTES.ATTENDANCE.ADMIN.MANAGE_HOLIDAY, holidayData);
    return response.data;
  }
};

export const PermissionService = {

getPermissionDashboardData: async () => {
  try {
    const [permRes, auditRes, userRes] = await Promise.all([
      apiClient.get(`${API_ROUTES.PERMISSION.GET_ALL}?limit=all`),
      apiClient.get(API_ROUTES.PERMISSION.AUDIT_LOGS),
      apiClient.get(API_ROUTES.EMPLOYEE.GET_PROFILE('')), 
    ]);

    // 1. Extract the raw permissions array
    const rawPermissions = permRes.data?.data?.permissions || [];

    // 2. Sort Alphabetically by the 'name' property
    const sortedPermissions = [...rawPermissions].sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return {
      success: true,
      permissions: sortedPermissions, 
      auditLogs: auditRes.data?.data?.logs || [],
      users: (userRes.data?.data || []).filter(u => !u.isDeleted)
    };
  } catch (error) {
    console.error("Permission Dashboard Fetch Error:", error);
    return { success: false, permissions: [], auditLogs: [], users: [] };
  }
},

  createPermission: async (name) => {
    const response = await apiClient.post(API_ROUTES.PERMISSION.CREATE, { name });
    return response.data;
  },

  // Combined function for assign/remove logic
  handleAccess: async (actionType, payload) => {
    // actionType is either 'assign' or 'remove'
    const url = actionType === 'assign' 
      ? API_ROUTES.PERMISSION.ASSIGN 
      : API_ROUTES.PERMISSION.REMOVE;
      
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  deletePermission: async (id) => {
    const response = await apiClient.delete(API_ROUTES.PERMISSION.DELETE(id));
    return response.data;
  }
};

export const AnalyticsService = {
  // 1. Library Analytics (Customer Usage)
getLibraryStats: async (category, timeframe) => {
  const res = await apiClient.get(API_ROUTES.ANALYTICS.CUSTOMER_USAGE, {
    params: { category, days: timeframe }
  });
  
  const rawData = res.data.data.data || [];
  
  // FIXED: Grouping by brandName instead of name
  const grouped = rawData.reduce((acc, item) => {
    // Look for existing brand entry
    const existing = acc.find(d => d.brandName === item.brandName);
    
    if (existing) {
      existing.usageCount += item.usageCount;
    } else {
      // Push a clean copy of the item
      acc.push({ ...item });
    }
    return acc;
  }, []);

  // Optional: Sort by usageCount descending so the chart looks organized
  return grouped.sort((a, b) => b.usageCount - a.usageCount);
},

// 2. IP & Geo-Traffic Analytics
getIpStats: async (params) => {
  // Use the dashboard endpoint explicitly
  const res = await apiClient.get(`${API_ROUTES.ANALYTICS.IP_TRAFFIC}/dashboard`, { params });
  
  if (res.data.success) {
    const dash = res.data.data.dashboard;
    
    // Map topIps to the format your Chart component expects
    const displayData = (dash.topIps || []).map(item => ({
      _id: item._id, // This is the IP address
      city: item.city,
      state: item.state,
      country: item.country,
      hits: item.hits 
    }));

    return {
      displayData,
      stats: {
        totalIps: dash.totalIps || 0,
        totalHits: dash.totalHits || 0,
        thisMonth: dash.thisMonthHits || 0
      }
    };
  }
  throw new Error("Failed to fetch IP dashboard stats");
},

  // 3. Order & Regional Analysis
  getOrderInsights: async (country, state = "") => {
    let url = `${API_ROUTES.ANALYTICS.ORDER_INSIGHTS}?country=${country}`;
    if (state) url += `&state=${state}`;

    const { data } = await apiClient.get(url);
    return {
    reportData: data?.data?.analytics || [], 
    level: data?.data?.level || "state"
  };
  },

  // 4. Product Performance
  getBestSelling: async () => {
    const res = await apiClient.get(API_ROUTES.ANALYTICS.BEST_SELLING);
    return res.data.success ? res.data.data : [];
  }
};

export const ProductService = {

getAllProducts: async (limit = 1000) => {
  // If you call ProductService.getAllProducts(), it uses 10 and 1
  const res = await apiClient.get(`${API_ROUTES.PRODUCT.GET_ALL}`, {
    params: {
      limit,
    }
  });
  
  return res.data; 
},

  // 2. Get Single Product Details
  getProductById: async (productId) => {
    const res = await apiClient.get(API_ROUTES.PRODUCT.GET_BY_ID(productId));
    return res.data.data;
  },

  // 3. Create Product (Handles Complex FormData)
  createProduct: async (formData) => {
    return await apiClient.post(API_ROUTES.PRODUCT.ADD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 4. Update Product
  updateProduct: async (productId, formData) => {
    return await apiClient.put(API_ROUTES.PRODUCT.UPDATE(productId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 5. Delete Product
  deleteProduct: async (productId) => {
    return await apiClient.delete(API_ROUTES.PRODUCT.DELETE(productId), {
      data: { permission: "product.listing.delete" }
    });
  },

  // 6. Duplicate Product
  duplicateProduct: async (productId) => {
    return await apiClient.post(API_ROUTES.PRODUCT.DUPLICATE, {
      productId,
      permission: "product.listing.create"
    });
  },

  // 7. Update Stock (Product or Variant Mode)
  updateStock: async (productId, stockData) => {
    // stockData should follow the structure: 
    // { permission: "stock_update", stockType: "VARIANT", variantStocks: [...] }
    return await apiClient.put(API_ROUTES.PRODUCT.UPDATE_STOCK(productId), stockData);
  }
};

export const BrandService = {
  // 1. Fetch all brands
getAllBrands: async () => {
  try {
    const res = await apiClient.get(API_ROUTES.BRAND.GET_ALL);
    // Return the full data object instead of just the brands array
    return res?.data?.data || { brands: [], pagination: { totalBrands: 0 } };
  } catch (error) {
    console.error("Fetch brands error:", error);
    return { brands: [], pagination: { totalBrands: 0 } };
  }
},

  // 2. Create Brand
  createBrand: async (formData) => {
    if (formData instanceof FormData && !formData.has("permission")) {
      formData.append("permission", "brand.listing.create");
    }

    const res = await apiClient.post(API_ROUTES.BRAND.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 3. Update Brand
updateBrand: async (brandId, formData) => {
    // BUG FIX: Ensure brandId is not undefined/null
    if (!brandId) {
      console.error("updateBrand error: No brandId provided");
      return { success: false, message: "Brand ID is required" };
    }

    if (formData instanceof FormData && !formData.has("permission")) {
      formData.append("permission", "brand.listing.update"); // Ensure permission is included for backend authorization

    }

    // This calls the function in your API_ROUTES
    const res = await apiClient.put(API_ROUTES.BRAND.UPDATE(brandId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 4. Delete Brand
deleteBrand: async (brandId) => {
    if (!brandId) {
      console.error("deleteBrand error: No brandId provided");
      return { success: false, message: "Brand ID is required" };
    }

    const res = await apiClient.delete(API_ROUTES.BRAND.DELETE(brandId), {
      data: { permission: "brand.listing.delete" }
    });
    return res.data;
  }
};

export const CategoryService = {
  // 1. Fetch all categories
  getCategories: async () => {
    const res = await apiClient.get(API_ROUTES.CATEGORY.GET);
    return res.data.data.categories;
  },

  // 2. Create Category
  createCategory: async (formData) => {
    if (formData instanceof FormData && !formData.has("permission")) {
      formData.append("permission", "create_category");
    }

    const res = await apiClient.post(API_ROUTES.CATEGORY.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 3. Update Category
  updateCategory: async (categoryId, formData) => {
    if (formData instanceof FormData && !formData.has("permission")) {
      formData.append("permission", "update_category");
    }

    const res = await apiClient.put(API_ROUTES.CATEGORY.UPDATE(categoryId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 4. Delete Category
  deleteCategory: async (categoryId) => {
    const res = await apiClient.delete(API_ROUTES.CATEGORY.DELETE(categoryId), {
      data: { permission: "category.listing.delete" }
    });
    return res.data;
  }
};

export const BannerService = {
  // 1. Fetch All Banners
  getBanners: async () => {
    const res = await apiClient.get(API_ROUTES.BANNER.GET_ALL, {
      headers: { permission: "banner.listing.read" },
    });
    return res.data;
  },

  getBannersByStatus: async (isActive = true) => {
    const res = await apiClient.get(API_ROUTES.BANNER.GET_BY_STATUS, {
      params: { isActive: isActive }, 
      headers: { permission: "banner.listing.read" },
    });
    return res.data;
  },
  // 2. Create Banner
  createBanner: async (formData) => {
    // Ensure the mandatory permission is present in FormData
    if (formData instanceof FormData && !formData.has("permission")) {
      formData.append("permission", "banner.listing.create");
    }

    const res = await apiClient.post(API_ROUTES.BANNER.CREATE, formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "permission": "banner.listing.create" // Added to headers for double-safety as per your form logic
      },
    });
    return res.data;
  },

  // 3. Update Banner
  updateBanner: async (bannerId, formData) => {
    if (formData instanceof FormData && !formData.has("permission")) {
      formData.append("permission", "banner.listing.update");
    }

    const res = await apiClient.put(API_ROUTES.BANNER.UPDATE(bannerId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 4. Delete Banner
  deleteBanner: async (bannerId) => {
    const res = await apiClient.delete(API_ROUTES.BANNER.DELETE(bannerId), {
      // Permission sent in the body (data) as per backend requirements
      data: { permission: "banner.listing.delete" },
    });
    return res.data;
  }
};

export const VideoService = {
  // 1. Fetch All Videos
  getAllVideos: async () => {
    const res = await apiClient.get(API_ROUTES.VIDEO.GET_ALL);
    // Returning the videos array specifically as per your list component logic
    return res.data?.videos ;
  },

  // 2. Add Video
  addVideo: async (videoData) => {
    // Expects: { title, link, productId }
    const payload = {
      ...videoData,
      permission: "video.listing.create",
    };
    const res = await apiClient.post(API_ROUTES.VIDEO.ADD, payload);
    return res.data;
  },

  // 3. Update Video
  updateVideo: async (ytVideoId, videoData) => {
    // Expects: { title, link }
    const payload = {
      ...videoData,
      permission: "video.listing.update",
    };
    const res = await apiClient.put(API_ROUTES.VIDEO.UPDATE(ytVideoId), payload);
    return res.data;
  },

  // 4. Delete Video
  deleteVideo: async (ytVideoId) => {
    const res = await apiClient.delete(API_ROUTES.VIDEO.DELETE(ytVideoId), {
      data: { permission: "video.listing.delete" },
    });
    return res.data;
  }
};

export const CouponService = {
  // 1. Fetch filtered coupons
  getCoupons: async (status = "all") => {
    try {
      const res = await apiClient.get(API_ROUTES.COUPON.FILTER(status));
      return res.data?.data?.coupons || [];
    } catch (err) {
      console.error("CouponService Filter Error:", err);
      return [];
    }
  },

  // ✅ NEW: Centralized fetch for Form Options (Brands, Categories, Products)
  getCouponOptions: async () => {
    try {
      const [brandsRes, categoriesRes, productsRes] = await Promise.all([
        apiClient.get(API_ROUTES.BRAND.GET_ALL),
        apiClient.get(API_ROUTES.CATEGORY.GET),
        apiClient.get(`${API_ROUTES.PRODUCT.GET_ALL}?limit=1000`)
      ]);

      return {
        brands: brandsRes.data?.data?.brands || brandsRes.data?.data || [],
        categories: categoriesRes.data?.data?.categories || categoriesRes.data?.data || [],
        products: productsRes.data?.data?.products || productsRes.data?.data || []
      };
    } catch (err) {
      console.error("Error fetching coupon dependency options:", err);
      throw err;
    }
  },

  // 2. Fetch single coupon details
  getCouponById: async (id) => {
    try {
      const res = await apiClient.get(API_ROUTES.COUPON.GET_BY_ID(id));
      return res.data; 
    } catch (err) {
      console.error("CouponService GetByID Error:", err);
      throw err;
    }
  },

  // 3. Create or Update Campaign
  saveCoupon: async (payload, id = null) => {
    const { 
      _id, couponId: _unusedId, usedCount: _unusedCount, 
      createdAt: _unusedCreated, updatedAt: _unusedUpdated, 
      __v: _unusedV, ...cleanPayload 
    } = payload;

    try {
      if (id) {
        const res = await apiClient.put(API_ROUTES.COUPON.UPDATE(id), cleanPayload);
        return res.data;
      } else {
        const res = await apiClient.post(API_ROUTES.COUPON.CREATE, cleanPayload);
        return res.data;
      }
    } catch (err) {
      console.error("CouponService Save Error:", err);
      throw err;
    }
  },

  updateStatus: async (id, isActive) => {
    try {
      const res = await apiClient.put(API_ROUTES.COUPON.UPDATE(id), { isActive });
      return res.data;
    } catch (err) {
      console.error("CouponService Status Update Error:", err);
      throw err;
    }
  },

  deleteCoupon: async (id) => {
    try {
      const res = await apiClient.delete(API_ROUTES.COUPON.DELETE(id));
      return res.data;
    } catch (err) {
      console.error("CouponService Delete Error:", err);
      throw err;
    }
  }
};

export const OrderService = {
  // 1. Fetch all orders
  getAllOrders: async () => {
    const res = await apiClient.get(API_ROUTES.ORDER.GET_ALL);
    return res.data?.data?.orders || res.data?.data || [];
  },

  // 2. Fetch orders by specific status (e.g., "cancelled", "delivered")
  getOrdersByStatus: async (status) => {
    const res = await apiClient.get(API_ROUTES.ORDER.GET_BY_STATUS(status));
    return res.data?.data?.orders || res.data?.data || [];
  },

  // 3. Get details for a specific order (e.g., ORD-1f0da54d...)
  getOrderDetails: async (orderId) => {
    const res = await apiClient.get(API_ROUTES.ORDER.GET_BY_ID(orderId));
    return res.data?.data || res.data;
  },

  // 4. Update General Order Status
  updateStatus: async (orderId, newStatus) => {
    const res = await apiClient.patch(API_ROUTES.ORDER.UPDATE_STATUS(orderId), {
      status: newStatus,
      permission: "order.listing.update",
    });
    return res.data;
  },

  // 5. Update Courier/Tracking Details
  updateCourier: async (orderId, courierData) => {
    const res = await apiClient.put(API_ROUTES.ORDER.UPDATE_COURIER(orderId), {
      corourseServiceName: courierData.serviceName,
      DOCNumber: courierData.docNumber,
      permission: "order.listing.update",
    });
    return res.data;
  }
};

export const ReturnService = {
  // 1. Fetch all customer return requests
getReturnRequests: async () => {
  const res = await apiClient.get(API_ROUTES.ORDER.GET_RETURN_REQUESTS);
  const orders = res.data?.data?.orders || [];

  const allRequests = orders.flatMap(order => 
    (order.returnRequests || []).map(req => {
      const enrichedItems = req.items.map(returnItem => {
        const originalProduct = order.items.find(
          i => i.variantId === returnItem.variantId
        );
        return {
          ...returnItem,
          productName: originalProduct?.productName || "Unknown Product",
          // ADDED THESE MAPPINGS:
          variantName: originalProduct?.variantName || "Standard",
          sku: originalProduct?.sku || "N/A",
          image: originalProduct?.image || "",
          reason: returnItem.reason 
        };
      });

      return {
        ...req,
        orderId: order.orderId,
        // ADDED THIS:
        grandTotal: order.grandTotal || 0, 
        items: enrichedItems,
        reason: enrichedItems[0]?.reason || "No reason provided"
      };
    })
  );

  return allRequests;
},

  // 2. Update the status of a specific return request (Approved/Rejected)
  updateReturnStatus: async (orderId, requestId, payload) => {
    // payload: { status, permission, items, refundAmount }
    const res = await apiClient.put(
      API_ROUTES.ORDER.UPDATE_RETURN_STATUS(orderId, requestId), 
      payload
    );
    return res.data;
  },

  // 3. Trigger the financial refund via payment gateway
  executeRefund: async (orderId, amount) => {
    const payload = {
      amount: Number(amount),
      permission: "initiate.refund.update"
    };
    const res = await apiClient.put(API_ROUTES.ORDER.EXECUTE_REFUND(orderId), payload);
    return res.data;
  }
};

export const ContactService = {
getAllInquiries: async (page = 1) => {
  try {
    const res = await apiClient.get(`${API_ROUTES.CONTACT.GET_ALL}?page=${page}`);
    return {
      contacts: res.data?.data?.contacts || [], 
      pagination: res.data?.data?.pagination || { currentPage: 1, totalPages: 1 }
    };
  } catch (error) {
    console.error("Service Error:", error);
    return { contacts: [], pagination: {} };
  }
},

  // 2. Fetch a specific message by its ID
  getInquiryDetails: async (contactId) => {
    const res = await apiClient.get(API_ROUTES.CONTACT.GET_BY_ID(contactId));
    return res.data?.data || res.data;
  },
  
};

export const CustomerService = {
  // 1. Fetch all registered customers
  getAllCustomers: async () => {
    const res = await apiClient.get(API_ROUTES.CUSTOMER.GET_ALL);
    // Returns the array of customers, handling potential nested data structures
    return res.data?.data?.customers ;
  },

  // 2. Fetch specific customer profile details by ID
  getCustomerById: async (customerId) => {
    const res = await apiClient.get(API_ROUTES.CUSTOMER.GET_BY_ID(customerId));
    return res.data?.data || res.data;
  },
  updateScanbridgeStatus: async (payload) => {
    // payload should be { customerId, logId, isdelivered }
    const res = await apiClient.patch(API_ROUTES.CUSTOMER.PATCH, payload);
    return res.data;
  }
};

export const UserService = {
  getAllUsers: async () => {
    try {
      const res = await apiClient.get(API_ROUTES.USER.GET_ALL);
      // Extract the correct array path based on your API response structure
      return res.data?.data?.users ;
    } catch (error) {
      console.error("UserService Error:", error);
      return []; // Return empty array so .map() doesn't crash the UI
    }
  },
};

export const CareerService = {
  /**
   * Create a new job opening
   */
  createJob: async (jobData) => {
    try {
      const payload = {
        ...jobData,
        permission: "career.job.create"
      };
      const res = await apiClient.post(API_ROUTES.CAREER.CREATE_JOB, payload);
      return res.data;
    } catch (error) {
      console.error("CareerService Create Error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Fetch all job openings
   */
  getAllJobs: async () => {
    try {
      const permission = "career.job.read";
      const res = await apiClient.get(`${API_ROUTES.CAREER.GET_ALL}/${permission}`);
      return res.data;
    } catch (error) {
      console.error("CareerService Fetch All Error:", error.response?.data || error.message);
      return {
        success: false,
        data: { jobs: [], pagination: {} },
        message: error.response?.data?.message || "Failed to fetch jobs"
      };
    }
  },

  /**
   * Fetch a single job by its ID
   */
  getJobById: async (id) => {
    try {
      const permission = "career.job.read";
      const url = `${API_ROUTES.CAREER.GET_BY_ID(id)}/${permission}`;
      const res = await apiClient.get(url);
      return res.data;
    } catch (error) {
      console.error("CareerService Fetch ID Error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch job details"
      };
    }
  },

  /**
   * Update an existing job
   */
  updateJob: async (id, updatedData) => {
    try {
      const payload = {
        ...updatedData,
        permission: "career.job.update"
      };
      const res = await apiClient.put(API_ROUTES.CAREER.UPDATE(id), payload);
      return res.data;
    } catch (error) {
      console.error("CareerService Update Error:", error.response?.data || error.message);
      return { success: false, message: "Failed to update job" };
    }
  },

  /**
   * Delete a job opening
   * @param {string} id 
   */
  deleteJob: async (id) => {
    try {
      // If your backend expects permission in the body for DELETE:
      const res = await apiClient.delete(API_ROUTES.CAREER.DELETE(id), {
        data: { permission: "career.job.delete" }
      });
      return res.data;
    } catch (error) {
      console.error("CareerService Delete Error:", error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to delete job" 
      };
    }
  },

  /**
 * Fetch applications for a specific job
 * @param {string} jobId 
 */
getApplicationsByJobId: async (jobId) => {
  try {
    const res = await apiClient.get(API_ROUTES.CAREER.GET_APPLICATIONS, {
      params: { jobId }
    });
    return res.data; // This returns the full object { success, data: { applications: [...] } }
  } catch (error) {
    console.error("CareerService Fetch Applications Error:", error.response?.data || error.message);
    return {
      success: false,
      data: { applications: [], pagination: {} },
      message: error.response?.data?.message || "Failed to fetch applications"
    };
  }
},
/**
 * Fetch a single application by its unique applicationId
 * @param {string} id 
 */
getApplicationById: async (id) => {
  try {
    const res = await apiClient.get(API_ROUTES.CAREER.GET_APPLICATION_BY_ID(id));
    return res.data; // Structure: { success: true, data: { ...applicantDetails } }
  } catch (error) {
    console.error("CareerService Fetch App ID Error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch application details"
    };
  }
},

/**
 * Update the status of a job application (e.g., shortlisted, rejected)
 * @param {string} applicationId 
 * @param {string} status 
 */
updateApplicationStatus: async (applicationId, status) => {
  try {
    const payload = {
      permission: "career.application.update",
      status: status
    };
    
    // Using the centralized route helper
    const res = await apiClient.patch(API_ROUTES.CAREER.UPDATE_STATUS(applicationId), payload);
    
    return res.data;
  } catch (error) {
    console.error("CareerService Status Update Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to update application status" 
    };
  }
},
};

export const BlogService = {
/**
   * Create a new blog post
   * @param {FormData} formData - Contains title, content, seo, bannerImage, etc.
   */
  createBlog: async (formData) => {
    try {
      if (formData instanceof FormData && !formData.has("permission")) {
        formData.append("permission", "blog.post.create");
      }

      const res = await apiClient.post(API_ROUTES.BLOG.CREATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error("BlogService Create Error:", error);
      throw error;
    }
  },

  /**
   * Fetch all blogs
   * @param {string} permission - RBAC permission string
   */
  getAllBlogs: async (permission = 'blog.post.read') => {
    try {
      const res = await apiClient.get(API_ROUTES.BLOG.GET_ALL(permission));
      // Returning data.data.blogs assuming standard project structure
      return res.data?.data?.blogs || res.data?.data || [];
    } catch (error) {
      console.error("BlogService Fetch All Error:", error);
      return [];
    }
  },

  /**
   * Fetch a single blog by ID
   */
  getBlogById: async (blogId, permission = 'blog.post.read') => {
    try {
      const res = await apiClient.get(API_ROUTES.BLOG.GET_SINGLE(blogId, permission));
      return res.data?.data || res.data;
    } catch (error) {
      console.error("BlogService Fetch ID Error:", error);
      throw error;
    }
  },

  /**
   * Update an existing blog
   * Handles both JSON and Multipart/form-data (for banner updates)
   */
 updateBlog: async (blogId, formData) => {
  try {
    // If you are using FormData, we ensure the permission is set
    if (formData instanceof FormData) {
      if (!formData.has("permission")) {
        formData.append("permission", "blog.post.update");
      }
    }

    // CRITICAL: This 'blogId' MUST be the UUID from the database 'blogId' field
    const res = await apiClient.put(API_ROUTES.BLOG.UPDATE(blogId), formData, {
      headers: formData instanceof FormData 
        ? { "Content-Type": "multipart/form-data" } 
        : {},
    });
    return res.data;
  } catch (error) {
    console.error("BlogService Update Error:", error);
    throw error;
  }
},

  /**
   * Delete a blog
   */
  deleteBlog: async (blogId) => {
    try {
      const res = await apiClient.delete(API_ROUTES.BLOG.DELETE(blogId), {
        data: { permission: 'blog.post.delete' }
      });
      return res.data;
    } catch (error) {
      console.error("BlogService Delete Error:", error);
      throw error;
    }
  }
};

export const InvoiceService = {
  /**
   * Create a new invoice
   */
  createInvoice: async (data) => {
    try {
      const res = await apiClient.post(API_ROUTES.INVOICE.CREATE, data, {
        headers: data instanceof FormData 
          ? { "Content-Type": "multipart/form-data" } 
          : {},
      });
      return res.data;
    } catch (error) {
      console.error("InvoiceService Create Error:", error);
      throw error;
    }
  },

  /**
   * Fetch all invoices
   */
  getAllInvoices: async () => {
    try {
      const res = await apiClient.get(API_ROUTES.INVOICE.GET_ALL);
      // Returns the invoice array based on your response structure
      return res.data?.data?.invoices || res.data?.data || [];
    } catch (error) {
      console.error("InvoiceService Fetch All Error:", error);
      return [];
    }
  },

  /**
   * Fetch a single invoice by ID
   */
  getInvoiceById: async (id) => {
    try {
      const res = await apiClient.get(API_ROUTES.INVOICE.GET_BY_ID(id));
      return res.data?.data || res.data;
    } catch (error) {
      console.error("InvoiceService Fetch ID Error:", error);
      throw error;
    }
  },

  /**
   * Update an existing invoice
   */
  updateInvoice: async (id, data) => {
    try {
      const res = await apiClient.put(API_ROUTES.INVOICE.UPDATE(id), data, {
        headers: data instanceof FormData 
          ? { "Content-Type": "multipart/form-data" } 
          : {},
      });
      return res.data;
    } catch (error) {
      console.error("InvoiceService Update Error:", error);
      throw error;
    }
  },
};