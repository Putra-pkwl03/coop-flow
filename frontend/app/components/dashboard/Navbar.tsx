"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaChevronDown,
  FaSearch,
  FaCloudUploadAlt,
  FaSignOutAlt,
} from "react-icons/fa";

interface NavbarProps {
  adminName: string;
  roleName: string; // Hapus tanda tanya (?) agar parameter ini bersifat WAJIB (Required)
  handleLogout: () => void;
}

// Hapus teks default '= Pengurus Koperasi' di parameter fungsi
export default function Navbar({
  adminName,
  roleName,
  handleLogout,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50 shadow-sm shadow-zinc-100/50">
      {/* Kiri: Logo & Nama App */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 shadow-md shadow-emerald-100">
          <img
            src="/logonobg.png"
            alt="Coopflow"
            className="h-full w-full object-contain brightness-0 invert"
          />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight text-zinc-900 block leading-none">
            COOP-FLOW
          </span>
          {/* Tampilan warna lencana dinamis berdasarkan role */}
          <span
            className={`text-xs font-semibold mt-1 block px-2 py-0.5 rounded-md border w-max ${
              roleName === "Admin Lapangan"
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}
          >
            {roleName}
          </span>
        </div>
      </div>

      {/* Tengah: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
        <FaSearch className="absolute left-4 text-zinc-400 text-sm" />
        <input
          type="text"
          placeholder="Cari petani, lahan, transaksi..."
          className="w-full bg-[#f4f4f5] text-sm text-zinc-700 pl-11 pr-4 py-2.5 rounded-full border border-transparent focus:outline-none focus:bg-white focus:border-zinc-200 transition-all duration-200 placeholder:text-zinc-400"
        />
      </div>

      {/* Kanan: Sinkronisasi, Notifikasi & Profil */}
      <div className="flex items-center space-x-5">
        <div className="hidden lg:flex items-center space-x-2.5 bg-[#f4f7f5] px-4 py-1.5 rounded-xl border border-green-100/50">
          <FaCloudUploadAlt className="text-green-600 text-lg" />
          <div className="text-left leading-tight">
            <p className="text-[11px] font-bold text-green-700">Sinkronisasi</p>
            <p className="text-[10px] text-zinc-400">Terakhir: Baru saja</p>
          </div>
        </div>

        <button className="relative p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-50 transition">
          <FaBell className="text-xl" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] font-extrabold text-white rounded-full flex items-center justify-center ring-2 ring-white">
            2
          </span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Avatar"
              className="h-9 w-9 rounded-full object-cover border border-zinc-200 shadow-sm"
            />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-zinc-800 leading-tight transition">
                {adminName}
              </p>
              <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                {roleName}
              </p>
            </div>
            <FaChevronDown className="text-xs text-zinc-400 group-hover:text-zinc-600 transition" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-zinc-100/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2.5 font-semibold transition"
              >
                <FaSignOutAlt />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
