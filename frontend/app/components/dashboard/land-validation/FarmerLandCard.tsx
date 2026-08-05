'use client';

import React from 'react';
import { FaUserAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { Farmer, Land } from '@/app/dashboard/admin-lapangan/validasi-lahan/ValidasiLahanPage';

interface FarmerLandCardProps {
  farmer: Farmer;
  selectedFarmer: Farmer | null;
  selectedLand: Land | null;
  activeTab: 'belum' | 'sudah';
  onSelectLand: (farmer: Farmer, land: Land) => void;
}

export default function FarmerLandCard({
  farmer,
  selectedFarmer,
  selectedLand,
  activeTab,
  onSelectLand
}: FarmerLandCardProps) {
  const name = farmer.user?.name || 'Tidak Ada Nama';
  const targetLands = farmer.lands || [];

  if (targetLands.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
      {/* Info Profile Petani */}
<div className="flex items-start gap-3">
  <div className="p-2.5 bg-zinc-50 text-zinc-500 rounded-xl mt-0.5">
    <FaUserAlt className="text-sm" />
  </div>
  <div className="space-y-0.5">
    <h3 className="text-sm font-bold text-zinc-900">{name}</h3>
    <p className="text-xs text-zinc-400 font-medium">
      Kelompok: {farmer.farmer_group?.name || 'Tidak Ada Kelompok'}
    </p>
    
    {/* PERBAIKAN DI SINI: Menampilkan Nama Desa Alfanumerik dari API terbaru */}
    <p className="text-[11px] text-zinc-400 font-medium">
      Desa: <span className="font-semibold text-zinc-600">{farmer.village?.name || farmer.village_id || farmer.user?.address || 'Belum diisi'}</span>
    </p>
  </div>

      </div>

      {/* List Lahan */}
      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 space-y-2">
        {targetLands.map((land) => {
          const isSelected = selectedLand?.id === land.id && selectedFarmer?.id === farmer.id;
          
          return (
            <div 
              key={land.id} 
              onClick={() => onSelectLand(farmer, land)} // Klik langsung pada area card utama tetap aktif
              className={`flex items-center justify-between p-2 bg-white rounded-lg border text-xs transition cursor-pointer select-none ${
                isSelected 
                  ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/10' 
                  : 'border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50/20 shadow-sm'
              }`}
              title={land.polygon_coordinates ? "Lihat/Edit Peta" : "Petakan Lahan Ini"}
            >
              {/* Info Detail Lahan */}
<div className="truncate max-w-[60%] pl-1">
  <p className="font-bold text-zinc-700 truncate">{land.land_name}</p>
  <p className="text-[10px] text-zinc-400 truncate">
    {land.location_address || `Desa: ${farmer.village?.name || land.village_id || '-'}`}
  </p>
</div>
              {/* Bagian Kanan: Status & Indikator Icon */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}> 
                <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded ${
                  isSelected && activeTab === 'belum' 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                    : land.polygon_coordinates ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {land.area} Ha {isSelected && activeTab === 'belum' && '(Edit)'}
                </span>
                
                <div
                  className={`p-1.5 rounded-lg border transition ${
                    isSelected 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                  }`}
                >
                  <FaMapMarkerAlt className="text-[11px]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}