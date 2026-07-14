"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Menggunakan nama ekspor resmi Heroicons 2 yang terdaftar di react-icons/hi2
import {
  HiSquares2X2,
  HiUsers,
  HiSquaresPlus,
  HiCreditCard,
  HiCalendar,
  HiChartBar,
  HiCog,
} from "react-icons/hi2";
import { FaTruck } from "react-icons/fa6";

interface SidebarProps {
  handleLogout: () => void;
  role: string;
  isOpen: boolean;
}

export default function Sidebar({ handleLogout, role, isOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    // --- MENU KEMENKO PANGAN ---
    {
      name: "Dashboard",
      icon: HiSquares2X2,
      href: "/dashboard/kemenko-pangan",
      roles: ["kemenko-pangan"],
    },
    {
      name: "Cooperative Master",
      icon: HiUsers,
      href: "/dashboard/kemenko-pangan/cooperative-master",
      roles: ["kemenko-pangan"],
    },
    {
      name: "Analytics",
      icon: HiChartBar,
      href: "/dashboard/kemenko-pangan/analytics",
      roles: ["kemenko-pangan"],
    },
    {
      name: "System Settings",
      icon: HiCog,
      href: "/dashboard/kemenko-pangan/settings",
      roles: ["kemenko-pangan"],
    },

    // --- MENU PETUGAS KOPERASI (100% AMAN & SESUAI DENGAN REFERENSI DESAIN) ---
    {
      name: "Dashboard",
      icon: HiSquares2X2,
      href: "/dashboard/admin-koprasi",
      roles: ["petugas-koperasi"],
    },
    {
      name: "Anggota",
      icon: HiUsers,
      href: "/dashboard/admin-koprasi/anggota",
      roles: ["petugas-koperasi"],
    },
    {
      name: "Stok & Inventaris",
      icon: HiSquaresPlus,
      href: "/dashboard/admin-koprasi/stok-inventaris",
      roles: ["petugas-koperasi"],
    },
    {
      name: "Status distribusi",
      icon: FaTruck,
      href: "/dashboard/admin-koprasi/riwayat-distribusi",
      roles: ["petugas-koperasi"],
    },
    {
      name: "Penyaluran",
      icon: HiCreditCard,
      href: "/dashboard/admin-koprasi/transaksi",
      roles: ["petugas-koperasi"],
    },
    {
      name: "Kalender Tanam",
      icon: HiCalendar,
      href: "/dashboard/admin-koprasi/kalender",
      roles: ["petugas-koperasi"],
    },
    {
      name: "Laporan",
      icon: HiChartBar,
      href: "/dashboard/admin-koprasi/laporan",
      roles: ["petugas-koperasi"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(role),
  );

  return (
    <aside
      style={{
        background:
          "linear-gradient(to bottom, #094D30 22%, #0F7B4A 51%, #195873 71%)",
      }}
      className={`${
        isOpen ? "w-64" : "w-20"
      } min-h-screen text-white flex flex-col justify-between sticky top-0 h-screen shrink-0 font-sans shadow-2xl transition-all duration-300 ease-in-out overflow-x-hidden`}
    >
      <div>
        {/* Header Sidebar */}
        <div
          className={`p-5 flex items-center ${isOpen ? "px-6" : "justify-center px-0 ml-5.5"} border-b border-white/5 h-18 transition-all duration-300`}
        >
          <div className="h-14 w-14 flex items-center justify-center p-1.5 ">
            <img
              src="/logonobg.png"
              alt="Logo"
              className="h-full w-full -ml-5.5 object-contain brightness-0 invert"
            />
          </div>

          {isOpen && (
            <div className="leading-tight animate-in fade-in duration-200">
              <h2 className="font-bold text-base text-[20px] tracking-wider block uppercase whitespace-nowrap text-white">
                COOP <span className="text-[#04C070]">FLOW</span>
              </h2>
            </div>
          )}
        </div>

        {/* Menu Navigasi Tengah */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-none">
          {filteredMenuItems.map((item, idx) => {
            const Icon = item.icon;
            let isActive = pathname === item.href;

            if (item.href === "/dashboard/admin-koprasi/stok-inventaris") {
              isActive = pathname.startsWith(
                "/dashboard/admin-koprasi/stok-inventaris",
              );
            } else if (item.href === "/dashboard/admin-koprasi/petani") {
              isActive = pathname.startsWith(
                "/dashboard/admin-koprasi/petani",
              );
            } else if (
              item.href === "/dashboard/admin-koprasi" ||
              item.href === "/dashboard/kemenko-pangan"
            ) {
              isActive = pathname === item.href;
            }

            return (
              <Link
                key={idx}
                href={item.href}
                title={!isOpen ? item.name : undefined}
                className={`flex items-center ${
                  isOpen ? "justify-between px-4" : "justify-center p-2.5"
                } py-2.5 rounded-xl font-bold text-[15px] transition-all duration-150 group ${
                  isActive
                    ? "bg-[#3BFF00]/30 text-white shadow-md shadow-black/15 font-semibold "
                    : "text-white hover:bg-[#3BFF00]/10 hover:text-white "
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <Icon
                    className={`shrink-0 transition-colors text-[22px] ${
                      isActive
                        ? "text-white"
                        : "text-white opacity-90 group-hover:opacity-100"
                    }`}
                  />
                  {isOpen && (
                    <span className="animate-in fade-in duration-150 whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bagian Bawah: Ilustrasi Persawahan */}
      <div className="w-full mt-auto shrink-0 relative overflow-hidden">
        <img
          src="/sid.png"
          alt="Landscape"
          className={`w-full object-cover object-top transition-all duration-300 ${
            isOpen ? "h-50 opacity-100" : "h-25 opacity-40"
          }`}
        />
      </div>
    </aside>
  );
}
