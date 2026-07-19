"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaChevronDown,
  FaCloudUploadAlt,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

interface NavbarProps {
  adminName: string;
  roleName: string;
  handleLogout: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const getCookie = (name: string) => {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
};

export default function Navbar({
  adminName,
  roleName,
  handleLogout,
  isSidebarOpen,
  toggleSidebar,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const roleFromCookie = getCookie("user_role");
    setCurrentRole(roleFromCookie);

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Flag untuk mendeteksi role yang menggunakan tampilan penuh mandiri tanpa sidebar
  const isMandatoryFullLayout =
    currentRole === "admin-lapangan" ||
    currentRole === "dinas-pertanian" ||
    currentRole === "kemenko-pangan";
  
  // Menentukan class warna navbar secara dinamis berdasarkan rumpun layout
  const headerBgClass = isMandatoryFullLayout 
    ? "bg-[#107349] border-b border-green-700 text-white" 
    : "bg-white border-2 border-b border-slate-200 shadow-md shadow-green-800/80 text-slate-800";

  return (
    <header className={`h-18 ${headerBgClass} flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50 shadow-sm shadow-zinc-100/50 font-sans transition-colors duration-200`}>
      
      {isMandatoryFullLayout ? (
        /* Sisi Kiri untuk role tanpa sidebar (admin-lapangan & dinas-pertanian) */
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-emerald-600 p-1.5 shadow-md shadow-emerald-100">
            <img src="/logonobg.png" alt="Coopflow" className="h-full w-full object-contain brightness-0 invert" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white block leading-none">COOP-FLOW</span>
        </div>
      ) : (
        /* Sisi Kiri untuk role selain itu (Tombol Hamburger Rapat Kiri) */
        <div className="-ml-2 lg:-ml-6 flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="p-2.5 rounded-xl transition focus:outline-none flex items-center justify-center text-slate-700 hover:bg-slate-100"
            title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
          >
            <FaBars className="text-xl" />
          </button>
        </div>
      )}

      {/* Kanan: Fitur Tambahan (Hanya Admin Lapangan), Notifikasi & Profil */}
      <div className="flex items-center space-x-5">
        
        {/* Fitur Sinkronisasi HANYA muncul spesifik jika role-nya admin-lapangan */}
        {currentRole === "admin-lapangan" && (
          <div className="hidden lg:flex items-center space-x-2.5 bg-[#f4f7f5] px-4 py-1.5 rounded-xl border border-green-100/50">
            <FaCloudUploadAlt className="text-green-600 text-lg" />
            <div className="text-left leading-tight">
              <p className="text-[11px] font-bold text-green-700">Sinkronisasi</p>
              <p className="text-[10px] text-zinc-400">Terakhir: Baru saja</p>
            </div>
          </div>
        )}
        
        {/* Tombol Notifikasi */}
        <button className={`relative p-2 rounded-full transition focus:outline-none ${
          isMandatoryFullLayout ? "hover:bg-green-800/40" : "hover:bg-slate-100"
        }`}>
          <FaBell className={`text-xl ${isMandatoryFullLayout ? "text-white" : "text-slate-600"}`} />
          <span className={`absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] font-extrabold text-white rounded-full flex items-center justify-center ring-2 ${
            isMandatoryFullLayout ? "ring-[#107349]" : "ring-white"
          }`}>2</span>
        </button>

        {/* Profil Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-3 cursor-pointer select-none group">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Avatar" 
              className={`h-9 w-9 rounded-full object-cover border shadow-sm ${
                isMandatoryFullLayout ? "border-emerald-500" : "border-slate-200"
              }`} 
            />
            <div className="text-left hidden sm:block">
              <p className={`text-sm font-bold leading-tight ${isMandatoryFullLayout ? "text-white" : "text-slate-800"}`}>{adminName}</p>
              <p className={`text-[11px] font-medium mt-0.5 uppercase tracking-wide ${isMandatoryFullLayout ? "text-emerald-200" : "text-slate-400"}`}>{roleName}</p>
            </div>
            <FaChevronDown className={`text-xs transition ${isMandatoryFullLayout ? "text-emerald-200 group-hover:text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-zinc-100/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2.5 font-semibold transition">
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