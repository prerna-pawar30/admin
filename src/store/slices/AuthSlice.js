import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Persistence: Initialize from localStorage
  user: JSON.parse(localStorage.getItem('employeeUser')) || null,
  token: localStorage.getItem('employeeToken') || null,
  isAuthenticated: !!localStorage.getItem('employeeToken'),
  role: localStorage.getItem('employeeUser') 
    ? JSON.parse(localStorage.getItem('employeeUser')).role 
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      const userRole = Number(user?.role);

      state.user = user;
      state.token = token;
      state.role = userRole;
      state.isAuthenticated = true;

      // Sync with localStorage
      localStorage.setItem('employeeToken', token);
      localStorage.setItem('employeeUser', JSON.stringify(user));
      localStorage.setItem('userRole', userRole);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('employeeUser');
      localStorage.removeItem('userRole');
    },

    updateToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('employeeToken', action.payload);
    },
  },
});

export const { loginSuccess, logout, updateToken } = authSlice.actions;
export default authSlice.reducer;