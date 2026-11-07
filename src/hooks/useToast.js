import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { enqueueToast } from "../store/slices/uiSlice";
import { TOAST_DEFAULT_DURATION } from "../constants/AppConfig";

/**
 * Themed toasts (orange/black/white) — wire ToastHost once in AdminLayout.
 */
export function useToast() {
  const dispatch = useDispatch();

  const push = useCallback(
    (message, variant = "info", duration = TOAST_DEFAULT_DURATION) => {
      dispatch(enqueueToast({ message, variant, duration }));
    },
    [dispatch]
  );

  return {
    success: (message, duration) => push(message, "success", duration),
    error: (message, duration) => push(message, "error", duration),
    info: (message, duration) => push(message, "info", duration),
    warning: (message, duration) => push(message, "warning", duration),
    raw: push,
  };
}
