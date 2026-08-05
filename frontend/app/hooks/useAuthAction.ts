'use client';

import { useRouter } from 'next/navigation';
import api from '../lib/axios'; 

export function useAuthAction() {
  const router = useRouter();

  const logout = async () => {
    // Proteksi SSR - Pastikan hanya berjalan di Browser Client
    if (typeof window === 'undefined') return;

    // Load SweetAlert2 secara dinamis HANYA saat tombol logout diklik
    const Swal = (await import('sweetalert2')).default;

    Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Sesi login operasional Anda akan berakhir.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#15803d',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-4 py-2 font-medium',
        cancelButton: 'rounded-xl px-4 py-2 font-medium'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // 1. Panggil API backend
          await api.post('/logout');
        } catch (error) {
          console.error('Backend logout error:', error);
        } finally {
          // 2. Bersihkan client-side state
          localStorage.clear();

          // 3. Bersihkan cookies untuk middleware
          document.cookie = "access_token=; path=/; max-age=0;";
          document.cookie = "user_role=; path=/; max-age=0;";

          // 4. Toast sukses
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
          });

          Toast.fire({
            icon: 'success',
            title: 'Berhasil Keluar! Sesi Anda berakhir.'
          });

          // 5. Kembalikan ke halaman login
          router.push('/auth/login');
        }
      }
    });
  };

  return { logout };
}