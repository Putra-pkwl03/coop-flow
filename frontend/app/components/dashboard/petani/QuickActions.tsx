'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaSeedling, FaWallet, FaHistory } from 'react-icons/fa';

export default function QuickMenu() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    router.push(`?view=${view}`);
  };

  return (
    <div className="space-y-3 font-sans">
      <h2 className="text-base font-black text-slate-900">Menu Utama</h2>

      <div className="grid grid-cols-2 gap-3.5">
        {/* Menu 1: Lahan Saya */}
        <div 
          onClick={() => handleNavigate('lands')}
          className="bg-emerald-100/80 hover:bg-emerald-200/90 border border-emerald-300/70 p-4 rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer active:scale-95 transition shadow-2xs group"
        >
          <div className="flex items-start space-x-2.5">
            <div className="p-2.5 bg-white rounded-xl text-emerald-800 shadow-xs flex-shrink-0 group-hover:scale-110 transition">
              <FaMapMarkerAlt className="text-lg" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-xs text-slate-900 leading-snug">Lahan Saya</p>
              <p className="text-[10px] font-semibold text-slate-600 mt-0.5">Daftar lahan milik saya</p>
            </div>
          </div>
          <button 
            tabIndex={-1}
            className="w-full bg-white text-emerald-900 text-xs font-black py-2 rounded-xl shadow-2xs border border-emerald-200 pointer-events-none"
          >
            Lihat Lahan
          </button>
        </div>

        {/* Menu 2: Pupuk di KDKMP */}
        <div 
          onClick={() => handleNavigate('fertilizers')}
          className="bg-amber-100/80 hover:bg-amber-200/90 border border-amber-300/70 p-4 rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer active:scale-95 transition shadow-2xs group"
        >
          <div className="flex items-start space-x-2.5">
            <div className="p-2.5 bg-white rounded-xl text-amber-800 shadow-xs flex-shrink-0 group-hover:scale-110 transition">
              <FaSeedling className="text-lg" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-xs text-slate-900 leading-snug">Pupuk KDKMP</p>
              <p className="text-[10px] font-semibold text-slate-600 mt-0.5">Cek stok pupuk koperasi</p>
            </div>
          </div>
          <button 
            tabIndex={-1}
            className="w-full bg-white text-amber-900 text-xs font-black py-2 rounded-xl shadow-2xs border border-amber-200 pointer-events-none"
          >
            Lihat Stok Pupuk
          </button>
        </div>

        {/* Menu 3: Nota & Transaksi */}
        <div 
          onClick={() => handleNavigate('transactions')}
          className="bg-fuchsia-100/80 hover:bg-fuchsia-200/90 border border-fuchsia-300/70 p-4 rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer active:scale-95 transition shadow-2xs group"
        >
          <div className="flex items-start space-x-2.5">
            <div className="p-2.5 bg-white rounded-xl text-fuchsia-800 shadow-xs flex-shrink-0 group-hover:scale-110 transition">
              <FaWallet className="text-lg" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-xs text-slate-900 leading-snug">Nota & Transaksi</p>
              <p className="text-[10px] font-semibold text-slate-600 mt-0.5">Riwayat pembelian pupuk</p>
            </div>
          </div>
          <button 
            tabIndex={-1}
            className="w-full bg-white text-fuchsia-900 text-xs font-black py-2 rounded-xl shadow-2xs border border-fuchsia-200 pointer-events-none"
          >
            Lihat Riwayat
          </button>
        </div>

        {/* Menu 4: Jadwal & Riwayat Pemupukan (UPDATED) */}
        <div 
          onClick={() => handleNavigate('fertilizer-history')}
          className="bg-sky-100/80 hover:bg-sky-200/90 border border-sky-300/70 p-4 rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer active:scale-95 transition shadow-2xs group"
        >
          <div className="flex items-start space-x-2.5">
            <div className="p-2.5 bg-white rounded-xl text-sky-800 shadow-xs flex-shrink-0 group-hover:scale-110 transition">
              <FaHistory className="text-lg" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-xs text-slate-900 leading-snug">Jadwal & Riwayat</p>
              <p className="text-[10px] font-semibold text-slate-600 mt-0.5">Jadwal dan lahan yang dipupuk</p>
            </div>
          </div>
          <button 
            tabIndex={-1}
            className="w-full bg-white text-sky-900 text-xs font-black py-2 rounded-xl shadow-2xs border border-sky-200 pointer-events-none"
          >
            Lihat Pemupukan
          </button>
        </div>
      </div>
    </div>
  );
}