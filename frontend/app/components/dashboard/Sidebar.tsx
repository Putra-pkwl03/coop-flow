"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import {
  FaChartPie,
  FaBoxes,
  FaTruckLoading,
  FaBrain,
  FaUserFriends,
  FaExchangeAlt,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaCogs,
  FaSignOutAlt,
  FaQuestionCircle,
} from "react-icons/fa";

interface SidebarProps {
  handleLogout: () => void;
}

export default function Sidebar({ handleLogout }: SidebarProps) {
  const pathname = usePathname();

  // Daftar menu yang disesuaikan persis dengan gambar referensi COOP-FLOW Admin Koperasi
  const menuItems = [
    { name: "Dashboard", icon: FaChartPie, href: "/dashboard/admin-koprasi" },
    {
      name: "Stok & Inventaris",
      icon: FaBoxes,
      href: "/dashboard/admin-koprasi/stok-inventaris",
    },
    {
      name: "Distribusi",
      icon: FaTruckLoading,
      href: "/dashboard/admin-koprasi/riwayat-distribusi",
    },
    {
      name: "Prediksi Kebutuhan",
      icon: FaBrain,
      href: "/dashboard/admin-koprasi/prediksi",
    },
    {
      name: "Petani & Lahan",
      icon: FaUserFriends,
      href: "/dashboard/admin-koprasi/data-petani",
    },
    {
      name: "Transaksi",
      icon: FaExchangeAlt,
      href: "/dashboard/admin-koprasi/transaksi",
    },
    {
      name: "Kalender Tanam",
      icon: FaCalendarAlt,
      href: "/dashboard/admin-koprasi/kalender",
    },
    {
      name: "Laporan",
      icon: FaFileInvoiceDollar,
      href: "/dashboard/admin-koprasi/laporan",
    },
    {
      name: "Pengaturan",
      icon: FaCogs,
      href: "/dashboard/admin-koprasi/pengaturan",
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#072F1A] text-white flex flex-col justify-between sticky top-0 h-screen shrink-0 font-sans shadow-xl">
      <div>
        {/* Header Sidebar: Logo & Nama Koperasi */}
        <div className="p-5 flex items-center space-x-3 border-b border-white/5">
          <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center p-1.5 shadow-md shadow-emerald-900/50">
            <img
              src="/logonobg.png"
              alt="Logo"
              className="h-full w-full object-contain brightness-0 invert"
            />
          </div>
          <div className="leading-tight">
            <h2 className="font-black text-sm tracking-wider block">
              COOP-FLOW
            </h2>
            <p className="text-[10px] text-emerald-400 font-medium tracking-wide mt-0.5 uppercase">
              Koperasi Merah Putih
            </p>
          </div>
        </div>

        {/* Menu Navigasi Tengah */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            
            // ===================================================================
            // PERBAIKAN DETAIL KECIL: LOGIKA AKURASI DETEKSI URL SUB-PAGE LOGISTIK
            // ===================================================================
            let isActive = pathname === item.href;

            if (item.href === "/dashboard/admin-koprasi/stok-inventaris") {
              // Tetap menyala jika admin membuka /stok-inventaris, /riwayat, maupun /mutasi
              isActive = pathname.startsWith("/dashboard/admin-koprasi/stok-inventaris");
            } else if (item.href === "/dashboard/admin-koprasi") {
              // Dashboard Utama hanya aktif jika URL pas (mencegah bentrok dengan sub-page fitur lain)
              isActive = pathname === "/dashboard/admin-koprasi";
            }

            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group ${
                  isActive
                    ? "bg-[#154D30] text-emerald-300 shadow-sm"
                    : "text-slate-400 hover:bg-[#154D30]/40 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`text-base transition-colors ${
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {/* Panah kecil penunjuk kanan jika menu tidak aktif */}
                {!isActive && (
                  <span className="text-[9px] text-slate-600 group-hover:text-slate-400 transition-transform group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bagian Bawah: Bantuan & Keluar */}
      <div className="p-4 border-t border-white/5 space-y-1 bg-[#052414]">
        {/* Tombol Bantuan seperti di referensi kiri bawah */}
        <Link
          href="#"
          className="flex items-center space-x-3 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <FaQuestionCircle className="text-base text-slate-500" />
          <span>Bantuan</span>
        </Link>

        {/* Tombol Logout Aplikasi */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/20 transition group"
        >
          <FaSignOutAlt className="text-base text-red-500/70 group-hover:text-red-400 transition-transform group-hover:-translate-x-0.5" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </aside>
  );
}
