import Swal from 'sweetalert2';

export const showToast = (icon, title) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  return Toast.fire({ icon, title });
};

export const confirmAction = async (title, text, confirmButtonText = 'Yes, delete it!') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText
  });
};

export const showAlert = (title, text, icon = 'success') => {
  return Swal.fire({ title, text, icon });
};