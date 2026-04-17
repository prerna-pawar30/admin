import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AppLayout.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";

// --- Lazy Load Pages (This breaks the 10MB bundle into small pieces) ---
const Shop = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../components/auth/Login.jsx"));
const AddProduct = lazy(() => import("../components/product/add-product/AddProduct.jsx"));
const ProductList = lazy(() => import("../components/product/product-list/ProductUpdate.jsx"));
const AddBrand = lazy(() => import("../components/brand/Add-Brand.jsx"));
const BrandList = lazy(() => import("../components/brand/brand-list/BrandList.jsx"));
const BestSelling = lazy(() => import("../components/product/BestSelling.jsx"));
const InquiryPage = lazy(() => import("../components/user_details/Inquiry.jsx"));
const ContactLibrary = lazy(() => import("../components/user_details/library/CustomerList.jsx"));
const ScanbridgePage = lazy(() => import("../components/user_details/library/ScanBridge.jsx"));
const UserDetails = lazy(() => import("../components/user_details/UserDetails.jsx"));
const CreateEmployee = lazy(() => import("../components/admin/EmployeeCreate.jsx"));
const EmployeeList = lazy(() => import("../components/employee/emploee-list/EmployeeList.jsx"));
const EmployeeDashboard = lazy(() => import("../components/employee/employee-dashboard/ProfessionalDashboard.jsx"));
const EmpCheckinout = lazy(() => import("../components/admin/admin-checkin-out/AdminAttendanceLogs.jsx"));
const PermissionPage = lazy(() => import("../components/admin/permissions-section/PermissionPage.jsx"));
const AddBanner = lazy(() => import("../components/banner/Add-Banner.jsx"));
const BannerList = lazy(() => import("../components/banner/banner-list/BannerList.jsx"));
const CreateCategory = lazy(() => import("../components/category/category.jsx"));
const CategoryList = lazy(() => import("../components/category/category-List.jsx"));
const AddProductVideo = lazy(() => import("../components/video/Add-Video.jsx"));
const ProductVideoList = lazy(() => import("../components/video/video-list/ProductVideoList.jsx"));
const CouponManager = lazy(() => import("../components/coupon/coupanmanage.jsx"));
const ProductTracking = lazy(() => import("../components/product/order-status/ProductTracking.jsx"));
const ProductControl = lazy(() => import("../components/product/stock-manager/StockMange.jsx"));
const Checkinout = lazy(() => import("../components/employee/employee-checkin-out/EmployeePortal.jsx"));
const ChangePassword = lazy(() => import("../components/auth/ChangePassword.jsx"));
const ForgotPassword = lazy(() => import("../components/auth/forgot.jsx"));
const ResetPassword = lazy(() => import("../components/auth/reset.jsx"));
const Profile = lazy(() => import("../components/employee/profile.jsx"));
const ReturnRequestsPage = lazy(() => import("../components/product/return-order/ReturnRequestsPage.jsx"));
const Career = lazy(() => import("../components/career/career.jsx"));
const JobListingPage = lazy(() => import("../components/career/edit-jobs/JobListingPage.jsx"));
const Careerapplications = lazy(() => import("../components/career/career-applications/career-application.jsx"));
const CreateBlog = lazy(() => import("../components/blogs/BlogAdd.jsx"));
const BlogList = lazy(() => import("../components/blogs/BlogList.jsx"));
const AppRoutes = ({ isAppLoading }) => {
  return (
    <Routes>
      {/* --- Public Auth Routes --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
        
      {/* --- Protected Routes --- */}
      <Route
        path="/"
        element={
          <ProtectedRoute isAppLoading={isAppLoading}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Shop />} />

        {/* 1. Catalog */}
        <Route path="catalog">
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/best-selling" element={<BestSelling />} />
          <Route path="products/stock" element={<ProductControl />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/add" element={<CreateCategory />} />
          <Route path="brands" element={<BrandList />} />
          <Route path="brands/add" element={<AddBrand />} />
          <Route path="career" element={<Career />} />
          <Route path="career/jobs" element={<JobListingPage />} />
          <Route path="career/jobs/:jobId" element={<Careerapplications />} />
          <Route path="blogs/add" element={<CreateBlog />} />
          <Route path="blogs" element={<BlogList />} />
        </Route>

        {/* 2. Sales */}
        <Route path="sales">
          <Route path="orders/tracking" element={<ProductTracking />} />
          <Route path="orders/returns" element={<ReturnRequestsPage />} />
          <Route path="coupons" element={<CouponManager />} />
        </Route>

        {/* 3. Workforce */}
        <Route path="workforce">
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/create" element={<CreateEmployee />} />
          <Route path="attendance/portal" element={<Checkinout />} />
          <Route path="attendance/logs" element={<EmpCheckinout />} />
          <Route path="permissions" element={<PermissionPage />} />
        </Route>

        {/* 4. CRM */}
        <Route path="crm">
          <Route path="inquiries" element={<InquiryPage />} />
          <Route path="customers" element={<UserDetails />} />
          <Route path="scanbridge" element={<ScanbridgePage />} />
          <Route path="contacts" element={<ContactLibrary />} />
        </Route>

        {/* 5. Marketing */}
        <Route path="marketing">
          <Route path="banners" element={<BannerList />} />
          <Route path="banners/add" element={<AddBanner />} />
          <Route path="videos" element={<ProductVideoList />} />
          <Route path="videos/add" element={<AddProductVideo />} />
        </Route>

        {/* 6. Account */}
        <Route path="account">
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Route>
         
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;