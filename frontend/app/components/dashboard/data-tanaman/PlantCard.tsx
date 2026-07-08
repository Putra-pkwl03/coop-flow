'use client';

import React, { useState, memo, useMemo } from 'react';
import { FaTrash, FaCalendarAlt, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaGlobeAsia } from 'react-icons/fa';
import { Plant } from '@/app/types/farmer'; 

interface ExtendedPlantCardProps {
  plant: Plant & {
    land_id: number;
    land_name: string;
    land_area: string;
    location_address: string | null;
    village_name?: string; // Tambahan properti nama desa dari parent/BE
    polygon_coordinates: any;
  };
  onDeleteSinglePlant: (plantId: string | number) => void;
  onEditPlant: (plant: Plant, landId: number) => void;
}

const getPlantImage = (plantName: string): string => {
  const name = plantName?.toLowerCase() || '';
  if (name.includes('padi')) return '/plants/padi.webp';
  if (name.includes('jagung')) return '/plants/jagung.webp';
  if (name.includes('cabai') || name.includes('cabe')) return '/plants/cabai.webp';
  if (name.includes('bawang')) return '/plants/bawang.webp';
  if (name.includes('tomat')) return '/plants/tomat.webp';
  return '/plants/default.webp';
};

const PlantCard = memo(function PlantCard({ 
  plant, 
  onDeleteSinglePlant, 
  onEditPlant 
}: ExtendedPlantCardProps) {
  
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRowClick = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState) {
      onEditPlant(plant, plant.land_id);
    }
  };

  // Kalkulasi koordinat polygon utama
  const formattedCoordinates = useMemo(() => {
    const coords = plant.polygon_coordinates;
    if (Array.isArray(coords) && Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
      return `${coords[0][0].toFixed(5)}, ${coords[0][1].toFixed(5)}`;
    }
    return 'Belum Terpetakan';
  }, [plant.polygon_coordinates]);

  // Format tanggal untuk sisi kanan baris utama
  const formattedPlantingDate = useMemo(() => {
    if (!plant.planting_date) return '-';
    try {
      const dateObj = new Date(plant.planting_date);
      return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return plant.planting_date;
    }
  }, [plant.planting_date]);

  return (
    <div 
      className={`border rounded-xl bg-white overflow-hidden transition-all duration-200 ${
        isExpanded ? 'border-emerald-600 ring-1 ring-emerald-600/20 shadow-xs' : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      {/* Row Utama Tanaman */}
      <div 
        onClick={handleRowClick}
        className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-zinc-50/50"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar Icon Tanaman */}
          <div className="w-12 h-12 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-xl shrink-0 shadow-xs">
            {plant.name?.toLowerCase().includes('padi') ? '🌾' :
             plant.name?.toLowerCase().includes('jagung') ? '🌽' :
             plant.name?.toLowerCase().includes('cabai') || plant.name?.toLowerCase().includes('cabe') ? '🌶️' :
             plant.name?.toLowerCase().includes('bawang') ? '🧅' :
             plant.name?.toLowerCase().includes('tomat') ? '🍅' : '🌱'}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-zinc-900 truncate">{plant.name}</p>
              <span className="text-[9px] bg-emerald-50 font-extrabold px-1.5 py-0.5 text-emerald-700 rounded border border-emerald-200/40">
                Aktif
              </span>
            </div>
            
            {/* Metadata Ringkas Lahan */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-medium">
              <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-700 font-bold text-[11px]">
                {plant.land_area || '0'} Ha
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-600 font-semibold truncate max-w-[120px] md:max-w-none">
                {plant.land_name || 'Lahan Utama'}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                <FaMapMarkerAlt className="text-[10px]" /> {plant.village_name || 'Desa tidak diketahui'}
              </span>
            </div>
          </div>
        </div>

        {/* Sisi Kanan Row */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Mulai Tanam</p>
            <p className="text-xs font-bold text-zinc-700 mt-0.5">{formattedPlantingDate}</p>
          </div>
          
          <div className="flex items-center gap-1 border-l border-zinc-100 pl-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); 
                onDeleteSinglePlant(plant.id);
              }}
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Hapus Tanaman"
            >
              <FaTrash className="text-xs" />
            </button>

            <div className="text-zinc-400 p-2">
              {isExpanded ? <FaChevronUp className="text-xs text-emerald-600" /> : <FaChevronDown className="text-xs" />}
            </div>
          </div>
        </div>
      </div>

      {/* Panel Detail Informasi (Grid Layout Lebih Rapi) */}
      {isExpanded && (
        <div className="bg-zinc-50/80 border-t border-zinc-100 p-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-zinc-200/60 shadow-inner">
            
            {/* Kolom 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-zinc-600 font-medium">
                <FaCalendarAlt className="text-zinc-400 shrink-0" />
                <span>Tanggal Tanam: <strong className="text-zinc-800 font-bold">{plant.planting_date || '-'}</strong></span>
              </div>
              <div className="flex items-start gap-2.5 text-zinc-600 font-medium">
                <FaMapMarkerAlt className="text-zinc-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-zinc-400 font-bold text-[10px] uppercase">Alamat Lengkap / Desa</span>
                  <span className="text-zinc-800 font-semibold break-words">
                    {plant.location_address || plant.village_name || 'Tidak ada keterangan alamat.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Kolom 2 */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-zinc-100 pt-2 md:pt-0 md:pl-4 flex flex-col justify-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <FaGlobeAsia /> Koordinat Polygon (Pin Utama)
                </span>
                <p className="font-mono font-bold text-zinc-700 bg-zinc-50 px-2 py-1 rounded border border-zinc-200 inline-block text-[11px]">
                  {formattedCoordinates}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
});

export default PlantCard;