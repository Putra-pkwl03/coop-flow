'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  adminName: string;
  handleLogout: () => void; 
}

export default function Navbar({ isOpen, setIsOpen, adminName, handleLogout }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown otomatis jika klik di luar area profil
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-6 z-10 relative">
      {/* Kiri: Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition active:scale-95 border border-transparent hover:border-gray-200"
      >
        <FaBars className="text-lg" />
      </button>

      {/* Kanan: Notifikasi & Profil */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition">
          <FaBell className="text-lg" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </button>
        
        {/* Kontainer Menu Profil dengan Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 border-l pl-4 border-gray-200 h-8 cursor-pointer select-none group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-emerald-600 transition">{adminName}</p>
              <p className="text-[11px] font-medium text-emerald-600 tracking-wider uppercase">Admin Lapangan</p>
            </div>
            <div className="p-0.5 border-2 border-emerald-100 rounded-full group-hover:border-emerald-500 transition">
              <FaUserCircle className="text-2xl text-gray-400 group-hover:text-gray-600" />
            </div>
          </div>

          {/* Elemen Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                <p className="text-sm font-semibold text-gray-800 truncate">{adminName}</p>
                <p className="text-xs text-emerald-600">Admin Lapangan</p>
              </div>
              
              <button
                onClick={handleLogout} // Langsung memanggil fungsi props dari dashboard parent
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium transition"
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