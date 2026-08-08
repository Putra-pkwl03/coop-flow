'use client';

import React from 'react';
import { FaUserAlt, FaMapMarkerAlt, FaLayerGroup } from 'react-icons/fa';
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
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
      {/* Header Profile Petani */}
      <div className="flex items-center justify-between gap-3 pb-0.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
            <FaUserAlt className="text-sm" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-sm font-bold text-zinc-900 truncate leading-snug">{name}</h3>
            <p className="text-xs text-zinc-500 font-medium truncate">
              {farmer.farmer_group?.name || 'Tanpa Kelompok Tani'}
            </p>
            <p className="text-[11px] text-zinc-400 font-medium truncate">
              Desa: <span className="font-semibold text-zinc-600">{farmer.village?.name || farmer.village_id || farmer.user?.address || 'Belum diisi'}</span>
            </p>
          </div>
        </div>

        {/* Badge Jumlah Lahan */}
        <span className="flex-shrink-0 text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-1 rounded-lg flex items-center gap-1">
          <FaLayerGroup className="text-[9px] text-zinc-400" />
          {targetLands.length} Lahan
        </span>
      </div>

      {/* List Lahan */}
      <div className="bg-zinc-50/80 p-2 sm:p-2.5 rounded-xl border border-zinc-100/80 space-y-2">
        {targetLands.map((land) => {
          const isSelected = selectedLand?.id === land.id && selectedFarmer?.id === farmer.id;

          return (
            <div 
              key={land.id} 
              onClick={() => onSelectLand(farmer, land)}
              className={`flex items-center justify-between gap-2.5 p-2.5 sm:p-3 bg-white rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                isSelected 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30 shadow-sm' 
                  : 'border-zinc-200/80 hover:border-emerald-400 hover:bg-emerald-50/10 shadow-sm'
              }`}
            >
              {/* Info Detail Lahan */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-bold text-xs sm:text-sm text-zinc-800 truncate">
                    {land.land_name}
                  </p>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {land.location_address || `Desa: ${farmer.village?.name || land.village_id || '-'}`}
                </p>
              </div>

              {/* Bagian Kanan: Status Luas Lahan & Indikator Icon */}
              <div className="flex items-center gap-2 flex-shrink-0"> 
                <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition ${
                  isSelected && activeTab === 'belum' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : land.polygon_coordinates 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}>
                  {land.area} Ha {isSelected && activeTab === 'belum' && '(Edit)'}
                </span>

                <div className={`p-2 rounded-lg border transition flex items-center justify-center ${
                  isSelected 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                    : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                }`}>
                  <FaMapMarkerAlt className="text-xs" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}