// lib/toast.ts
import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'rounded-xl shadow-xl border border-zinc-100 font-sans'
  }
});

export const confirmDialog = (title: string, text: string, confirmText: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#e4e4e7',
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    customClass: { popup: 'rounded-2xl font-sans' }
  });
};