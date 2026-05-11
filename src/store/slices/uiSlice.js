import { createSlice, nanoid } from "@reduxjs/toolkit";

/**
 * Global UI state: toast queue for success/error feedback from any feature slice or component.
 * Dispatch enqueueToast from thunks after API calls, or use useToast() in components.
 */
const initialState = {
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    enqueueToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare({ message, variant = "info", duration = 4500 }) {
        return {
          payload: {
            id: nanoid(),
            message,
            variant,
            duration,
          },
        };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { enqueueToast, dismissToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;
