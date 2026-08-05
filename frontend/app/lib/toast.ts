// lib/toast.ts

export const Toast = {
  fire: async (options: any) => {
    if (typeof window === 'undefined') {
      return Promise.resolve({} as any);
    }

    // Dynamic import hanya berjalan di Browser Client
    const Swal = (await import('sweetalert2')).default;

    return Swal.mixin({
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
        popup: 'rounded-xl shadow-xl border border-zinc-100 font-sans',
      },
    }).fire(options);
  },
};

export const confirmDialog = async (title: string, text: string, confirmText: string) => {
  if (typeof window === 'undefined') {
    return Promise.resolve({ isConfirmed: false } as any);
  }

  // Dynamic import hanya berjalan di Browser Client
  const Swal = (await import('sweetalert2')).default;

  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#e4e4e7',
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    customClass: { popup: 'rounded-2xl font-sans' },
  });
};