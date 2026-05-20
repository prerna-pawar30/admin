import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice";
import employeeReducer from "./slices/EmployeeSlice";
import uiReducer from "./slices/uiSlice";
// import attendanceReducer from "./slices/attendanceSlice";
import notificationReducer from "./slices/NotificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    ui: uiReducer,
notifications: notificationReducer,
    // attendance: attendanceReducer,
  },
});

export default store;