"use client";

import React from "react";
import { 
  FaCube, 
  FaWarehouse, 
  FaDollarSign, 
  FaMinusCircle, 
  FaTimesCircle 
} from "react-icons/fa";

interface SummaryData {
  total_jenis_pupuk: number;
  total_stok_kg: number;
  nilai_persediaan: number;
  stok_menipis_jenis: number;
  stok_habis_jenis: number;
}

interface InventorySummaryProps {
  summary: SummaryData | null;
}

export default function InventorySummary({ summary }: InventorySummaryProps) {
  // Ambil data dengan fallback 0 jika data dari backend belum selesai di-load
  const totalJenis = summary?.total_jenis_pupuk || 0;
  const totalStok = summary?.total_stok_kg || 0;
  const nilaiPersediaan = summary?.nilai_persediaan || 0;
  const stokMenipis = summary?.stok_menipis_jenis || 0;
  const stokHabis = summary?.stok_habis_jenis || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      
      {/* Card 1: Total Jenis Pupuk */}
      <div className="bg-white py-4 px-6 rounded-lg border border-zinc-100 shadow-sm flex items-center gap-5 min-h-[140px]">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <FaCube className="text-2xl" />
        </div>
        <div className="flex flex-col justify-center space-y-4 w-full">
          <p className="text-[13px] font-bold text-zinc-500 tracking-tight">Total Jenis Pupuk</p>
          <h3 className="text-xl font-black text-zinc-900 leading-none">
            {totalJenis}
          </h3>
          <p className="text-[12px] text-zinc-400 font-medium">jenis</p>
        </div>
      </div>

      {/* Card 2: Total Stok */}
      <div className="bg-white py-4 px-6 rounded-lg border border-zinc-100 shadow-sm flex items-center gap-5 min-h-[140px]">
        <div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-600 rounded-full flex items-center justify-center flex-shrink-0">
          <FaWarehouse className="text-2xl" />
        </div>
        <div className="flex flex-col justify-center space-y-4 w-full overflow-hidden">
          <p className="text-[13px] font-bold text-zinc-500 tracking-tight">Total Stok</p>
          <h3 className="text-xl font-black text-zinc-900 leading-none truncate">
            {totalStok.toLocaleString("id-ID")} Kg
          </h3>
          <p className="text-[12px] text-zinc-400 font-medium truncate">Seluruh jenis pupuk</p>
        </div>
      </div>

      {/* Card 3: Nilai Persediaan */}
      <div className="bg-white py-4 px-6 rounded-lg border border-zinc-100 shadow-sm flex items-center gap-5 min-h-[140px]">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
          <FaDollarSign className="text-2xl" />
        </div>
        <div className="flex flex-col justify-center space-y-4 w-full overflow-hidden">
          <p className="text-[13px] font-bold text-zinc-500 tracking-tight">Nilai Persediaan</p>
          <h3 className="text-xl font-black text-zinc-900 leading-none truncate">
            Rp {nilaiPersediaan.toLocaleString("id-ID")}
          </h3>
          <p className="text-[12px] text-zinc-400 font-medium truncate">Perkiraan nilai stok</p>
        </div>
      </div>

      {/* Card 4: Stok Menipis */}
      <div className="bg-white py-4 px-6 rounded-lg border border-zinc-100 shadow-sm flex items-center gap-5 min-h-[140px]">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${stokMenipis > 0 ? 'bg-amber-50 text-amber-500' : 'bg-zinc-50 text-zinc-400'}`}>
          <FaMinusCircle className="text-2xl" />
        </div>
        <div className="flex flex-col justify-center space-y-4 w-full">
          <p className="text-[13px] font-bold text-zinc-500 tracking-tight">Stok Menipis</p>
          <h3 className="text-xl font-black text-zinc-900 leading-none">
            {stokMenipis} <span className="text-sm font-bold text-zinc-500">Jenis</span>
          </h3>
          <p className={`text-[12px] font-semibold ${stokMenipis > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>
            {stokMenipis > 0 ? "Perlu diperhatikan" : "Kondisi aman"}
          </p>
        </div>
      </div>

      {/* Card 5: Stok Habis */}
      <div className="bg-white py-4 px-6 rounded-lg border border-zinc-100 shadow-sm flex items-center gap-5 min-h-[140px]">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${stokHabis > 0 ? 'bg-red-50 text-red-500' : 'bg-zinc-50 text-zinc-400'}`}>
          <FaTimesCircle className="text-2xl" />
        </div>
        <div className="flex flex-col justify-center space-y-4 w-full">
          <p className="text-[13px] font-bold text-zinc-500 tracking-tight">Stok Habis</p>
          <h3 className="text-xl font-black text-zinc-900 leading-none">
            {stokHabis} <span className="text-sm font-bold text-zinc-500">Jenis</span>
          </h3>
          <p className={`text-[12px] font-semibold ${stokHabis > 0 ? 'text-red-600' : 'text-zinc-400'}`}>
            {stokHabis > 0 ? "Perlu diperhatikan" : "Kondisi aman"}
          </p>
        </div>
      </div>

    </div>
  );
}