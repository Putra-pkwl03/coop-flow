'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaMapMarkerAlt, FaUsers, FaSeedling, 
  FaCloudDownloadAlt, FaClipboardList, FaBell, FaChevronRight 
} from 'react-icons/fa';

export default function MenuGrid() {
  const menuItems = [
    { title: 'Managemen Petani', desc: 'Kelola data dan profil petani anggota', icon: FaUsers, color: 'bg-blue-50 text-blue-600', href: '/dashboard/admin-lapangan/data-petani' },
    { title: 'Validasi Lahan', desc: 'Verifikasi dan petakan lahan petani', icon: FaMapMarkerAlt, color: 'bg-red-50 text-red-600', href: '/dashboard/admin-lapangan/validasi-lahan' },
    { title: 'Data Tanaman', desc: 'Kelola jenis komoditas dan varietas', icon: FaSeedling, color: 'bg-green-50 text-green-600', href: '/dashboard/admin-lapangan/data-tanaman' },
    { title: 'Sinkronisasi Offline', desc: 'Kirim data yang tersimpan secara offline', icon: FaCloudDownloadAlt, color: 'bg-indigo-50 text-indigo-600', href: '/dashboard/admin-lapangan/sinkronisasi' },
    { title: 'Riwayat Aktivitas', desc: 'Lihat semua aktivitas lapangan', icon: FaClipboardList, color: 'bg-cyan-50 text-cyan-600', href: '/dashboard/admin-lapangan/riwayat' },
    { title: 'Notifikasi', desc: 'Informasi penting dan pengingat tugas', icon: FaBell, color: 'bg-yellow-50 text-yellow-600', href: '/dashboard/admin-lapangan/notifikasi' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {menuItems.map((item, i) => {
        const Icon = item.icon;
        
        return (
          <Link 
            href={item.href} 
            key={i} 
            prefetch={true} // 🌟 SANGAT PENTING: Paksa Next.js & PWA prefetch halaman ini saat online
            className="bg-white p-5 pb-8 rounded-2xl border border-zinc-100 shadow-sm flex flex-col items-center text-center hover:shadow-md hover:border-emerald-200 transition group cursor-pointer relative overflow-hidden"
          >
            {/* Animasi warna dari sudut kiri atas */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-emerald-50/20 origin-top-left scale-0 group-hover:scale-100 transition-transform duration-300 ease-out z-0" />

            {/* Wrapper Ikon di Tengah */}
            <div className={`p-4 rounded-2xl ${item.color} mb-4 flex items-center justify-center group-hover:scale-105 transition duration-200 relative z-10`}>
              <Icon className="text-4xl" />
            </div>

            {/* Konten Teks Tengah */}
            <div className="space-y-1 relative z-10">
              <h3 className="text-lg font-bold text-zinc-800 tracking-tight group-hover:text-emerald-700 transition">
                {item.title}
              </h3>
              <p className="text-[12px] text-zinc-400 font-medium leading-normal group-hover:text-emerald-800/70 transition">
                {item.desc}
              </p>
            </div>

            {/* Ikon Panah */}
            <div className="absolute bottom-3 right-4 text-[10px] text-zinc-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition duration-200 z-10">
              <FaChevronRight />
            </div>
          </Link>
        );
      })}
    </div>
  );
}