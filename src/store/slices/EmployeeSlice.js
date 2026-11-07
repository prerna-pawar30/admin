import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employees: [],
  selectedEmployee: null,
  isLoading: false,
  error: null,
  pagination: { currentPage: 1, totalPages: 1, pageSize: 20 },
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    setEmployees: (state, action) => { state.employees = action.payload; },
    setSelectedEmployee: (state, action) => { state.selectedEmployee = action.payload; },
    addEmployee: (state, action) => { state.employees.push(action.payload); },
    updateEmployee: (state, action) => {
      const index = state.employees.findIndex(e => e.id === action.payload.id);
      if (index !== -1) state.employees[index] = action.payload;
    },
    removeEmployee: (state, action) => {
      state.employees = state.employees.filter(e => e.id !== action.payload);
    },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    setPagination: (state, action) => { state.pagination = action.payload; },
  },
});

export const {
  setEmployees,
  setSelectedEmployee,
  addEmployee,
  updateEmployee,
  removeEmployee,
  setLoading,
  setError,
  setPagination
} = employeeSlice.actions;

export default employeeSlice.reducer;