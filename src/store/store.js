import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice";
import employeeReducer from "./slices/EmployeeSlice";
import uiReducer from "./slices/uiSlice";
import notificationReducer from "./slices/NotificationSlice";
import attendanceReducer from "./slices/AttendanceSlice";
import payrollReducer from "./slices/PayrollSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    attendance: attendanceReducer,
    payroll: payrollReducer,
  },
});

export default store;
