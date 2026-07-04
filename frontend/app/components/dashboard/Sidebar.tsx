'use client';

import React from 'react';
import { 
  FaMapMarkedAlt, FaUsers, FaLeaf, 
  FaSignOutAlt, FaChartPie 
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  handleLogout: () => void;
}

export default function Sidebar({ isOpen, handleLogout }: SidebarProps) {
  const menuItems = [
    { name: 'Overview', icon: FaChartPie, active: true },
    { name: 'Mapping Lahan (GIS)', icon: FaMapMarkedAlt, active: false },
    { name: 'Produksi Petani', icon: FaLeaf, active: false },
    { name: 'Kelompok Tani', icon: FaUsers, active: false },
  ];

  return (
    <aside className={`bg-[#0B3A22] border-r border-yellow-900/30 text-yellow-50 flex flex-col transition-all duration-300 z-20 ${isOpen ? 'w-64' : 'w-20'}`}>
      
      {/* Header Sidebar */}
      <div className="h-16 flex items-center px-5 border-b border-yellow-900/30">
        <div className="flex items-center space-x-3 overflow-hidden">
          
          {/* LOGO COOPFLOW */}
          <div className="shrink-0 bg-white border rounded-full">
            <img 
              src="/logonobg.png" 
              alt="Coopflow Logo"
              className={`h-9 w-9 object-contain ${isOpen ? '' : 'mx-auto'}`}
            />
          </div>
          
          {isOpen && (
            <span className="font-bold text-base tracking-wider bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              COOPFLOW
            </span>
          )}
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <a
              key={idx}
              href="#"
              className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                item.active 
                  ? 'bg-[#154734] text-yellow-200 shadow-md shadow-black/20' 
                  : 'text-white/70 hover:bg-[#154734]/50 hover:text-yellow-100'
              }`}
            >
              <Icon className={`text-lg shrink-0 ${item.active ? 'text-yellow-200' : 'text-white/50 group-hover:text-yellow-300'}`} />
              {isOpen && <span className="truncate">{item.name}</span>}
            </a>
          );
        })}
      </nav>

      {/* Footer Sidebar (Logout) */}
      <div className="p-4 border-t border-yellow-900/30">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl bg-[#154734]/40 hover:bg-red-950/40 text-yellow-100/70 hover:text-red-300 border border-yellow-900/10 hover:border-red-900/50 text-sm font-medium transition-all duration-200 group"
        >
          <FaSignOutAlt className="text-lg shrink-0 group-hover:rotate-12 transition-transform" />
          {isOpen && <span>Keluar Aplikasi</span>}
        </button>
      </div>
    </aside>
  );
}