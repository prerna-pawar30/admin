import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Set all notifications (Fetched on Page Load / App Refresh)
    setNotifications: (state, action) => {
      const notifications = Array.isArray(action.payload) ? action.payload : [];
      state.notifications = notifications;

      state.unreadCount = notifications.filter(
        (n) => n.isRead === false || n.read === false || (n.isRead === undefined && n.read === undefined)
      ).length;
    },

    // Add new real-time notification via Socket connection
    addNotification: (state, action) => {
      const exists = state.notifications.some(n => n._id === action.payload?._id);
      if (exists) return;

      state.notifications.unshift(action.payload);

      state.unreadCount = state.notifications.filter(
        (n) => n.isRead === false || n.read === false || (n.isRead === undefined && n.read === undefined)
      ).length;
    },

    // Mark one notification read
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );

      if (notification) {
        notification.isRead = true;
        notification.read = true; 
        
        state.unreadCount = state.notifications.filter(
          (n) => n.isRead === false || n.read === false
        ).length;
      }
    },

    // Mark all notifications read
    markAllNotificationsRead: (state) => {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
        read: true,
      }));

      state.unreadCount = 0;
    },

    // ─── NEW REDUCERS FOR INSTANT UI UPDATES ───
    // Remove a single notification from state and update counts
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n._id !== action.payload
      );

      // Recalculate unread count based on remaining items
      state.unreadCount = state.notifications.filter(
        (n) => n.isRead === false || n.read === false || (n.isRead === undefined && n.read === undefined)
      ).length;
    },

    // Wipe out the entire array layout immediately (e.g., Clear All action)
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
  markAllNotificationsRead,
  removeNotification, // <-- Exported
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;