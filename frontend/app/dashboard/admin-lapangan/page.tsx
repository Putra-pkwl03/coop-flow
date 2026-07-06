'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import api from '../../lib/axios'; 

import Navbar from '@/app/components/dashboard/Navbar';
import OverviewContent from '@/app/components/dashboard/OverviewContent';

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

export default function AdminLapanganDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Andi');

  useEffect(() => {
    const profile = localStorage.getItem('user_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed.name) setAdminName(parsed.name);
    }
  }, []);

  const handleLogout = () => {
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
          await api.post('/logout');
        } catch (error) {
          console.error('Backend logout error:', error);
        } finally {
          localStorage.clear();
          document.cookie = "access_token=; path=/; max-age=0;";

          Toast.fire({
            icon: 'success',
            title: 'Berhasil Keluar! Sesi Anda berakhir.'
          });

          router.push('/auth/login');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-800 antialiased font-sans pb-12">
      {/* Top Header & Navbar sesuai image_761adf.jpg */}
      <Navbar adminName={adminName} roleName="Admin Lapangan" handleLogout={handleLogout} />
      
      {/* Konten Utama Tengah */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 mt-6">
        <OverviewContent adminName={adminName} />
      </div>
    </div>
  );
}