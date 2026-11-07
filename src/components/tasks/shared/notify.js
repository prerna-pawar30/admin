/**
 * Toasts and confirm dialogs for the task screens. Toasts go through the app's ToastHost (same
 * look as every other page); confirms use SweetAlert2 like the holiday and payroll screens.
 */
import Swal from "sweetalert2";
import store from "../../../store/store";
import { enqueueToast } from "../../../store/slices/uiSlice";
import { TOAST_DEFAULT_DURATION } from "../../../constants/AppConfig";

const BRAND = "#e68736";
const ERROR_TOAST_DURATION = 5000;

const toast = (message, variant, duration = TOAST_DEFAULT_DURATION) =>
  store.dispatch(enqueueToast({ message, variant, duration }));

export const toastSuccess = (message) => toast(message, "success");

export const toastError = (message) => toast(message, "error", ERROR_TOAST_DURATION);

/** Red "are you sure" dialog. Resolves true when confirmed. */
export const confirmDanger = async ({ title, text, confirmText = "Delete" }) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    confirmButtonColor: "#ef4444",
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
};

/** Neutral confirm in the brand colour. Resolves true when confirmed. */
export const confirmAction = async ({ title, text, confirmText = "Confirm" }) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    confirmButtonColor: BRAND,
    reverseButtons: true,
  });
  return result.isConfirmed;
};
