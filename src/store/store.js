import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice";
import employeeReducer from "./slices/EmployeeSlice";
import uiReducer from "./slices/uiSlice";
// import attendanceReducer from "./slices/attendanceSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    ui: uiReducer,
    // attendance: attendanceReducer,
  },
});

export default store;