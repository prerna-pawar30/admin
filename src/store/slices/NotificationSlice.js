import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {

    setNotifications: (state, action) => {
      state.notifications = action.payload;

      state.unreadCount = action.payload.filter(
        (n) => !n.isRead
      ).length;
    },

    addNotification: (state, action) => {

      state.notifications.unshift(action.payload);

      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    markNotificationRead: (state, action) => {

      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );

      if (notification && !notification.isRead) {

        notification.isRead = true;

        state.unreadCount -= 1;
      }
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markNotificationRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;