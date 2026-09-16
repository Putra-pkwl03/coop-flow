// // src/components/MacroClimateStats.tsx
// 'use client';

// import React from 'react';
// import { FaCloudSunRain, FaThermometerHalf, FaTint } from 'react-icons/fa';

// interface MacroClimateStatsProps {
//   avgTemp: number | string;
//   avgHumidity: number | string;
//   avgRain: number | string;
// }

// export default function MacroClimateStats({ avgTemp, avgHumidity, avgRain }: MacroClimateStatsProps) {
//   return (
//     <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 space-y-2">
//       <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider px-1">
//         <FaCloudSunRain size={13} className="text-emerald-600" />
//         <span>Indikator Agro-Iklim Wilayah Otomatis</span>
//       </div>
      
//       <div className="grid grid-cols-3 gap-2.5">
//         {/* Metrik Suhu */}
//         <div className="bg-white p-2 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center shadow-xs">
//           <FaThermometerHalf className="text-amber-500 mb-0.5 text-xs" />
//           <p className="text-[9px] font-semibold text-zinc-400">Rata-rata Suhu</p>
//           <p className="text-xs font-extrabold text-zinc-700 mt-0.5">
//             {avgTemp}{typeof avgTemp === 'number' ? '°C' : ''}
//           </p>
//         </div>

//         {/* Metrik Kelembapan */}
//         <div className="bg-white p-2 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center shadow-xs">
//           <FaTint className="text-blue-500 mb-0.5 text-xs" />
//           <p className="text-[9px] font-semibold text-zinc-400">Rata-rata Kel.</p>
//           <p className="text-xs font-extrabold text-zinc-700 mt-0.5">
//             {avgHumidity}{typeof avgHumidity === 'number' ? '%' : ''}
//           </p>
//         </div>

//         {/* Metrik Curah Hujan */}
//         <div className="bg-white p-2 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center shadow-xs">
//           <FaCloudSunRain className="text-emerald-500 mb-0.5 text-xs" />
//           <p className="text-[9px] font-semibold text-zinc-400">Hujan / Bulan</p>
//           <p className="text-xs font-extrabold text-zinc-700 mt-0.5 truncate max-w-full px-0.5">
//             {avgRain}{typeof avgRain === 'number' ? ' mm' : ''}
//           </p>
//         </div>
//       </div>
      
//       <p className="text-[9px] text-zinc-400 text-center italic font-medium">
//         *Data cuaca makro dihitung otomatis berdasarkan histori 3 tahun terakhir di titik koordinat peta.
//       </p>
//     </div>
//   );
// }



// src/components/MacroClimateStats.tsx
'use client';

import React from 'react';
import { FaCloudSunRain, FaThermometerHalf, FaTint, FaSeedling, FaChartLine } from 'react-icons/fa';

interface MacroClimateStatsProps {
  avgTemp: number | string;
  avgHumidity: number | string;
  avgRain: number | string;
  currentNdvi?: number | string | null;
  isLoadingNdvi?: boolean;
}

export default function MacroClimateStats({ 
  avgTemp, 
  avgHumidity, 
  avgRain,
  currentNdvi = '--',
  isLoadingNdvi = false
}: MacroClimateStatsProps) {

  const numericNdvi = currentNdvi !== null && currentNdvi !== undefined && currentNdvi !== '--' 
    ? Number(currentNdvi) 
    : null;

  const getNdviCategory = (val: number | null) => {
    if (val === null || isNaN(val)) return { label: 'Belum Diuji Satelit', color: 'bg-zinc-100 text-zinc-500 border-zinc-200' };
    if (val >= 0.6) return { label: 'Sangat Sehat (Kerapatan Tinggi)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (val >= 0.35) return { label: 'Tumbuh Normal', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (val >= 0.1) return { label: 'Vegetasi Jarang / Stress', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'Lahan Kosong / Non-Vegetasi', color: 'bg-rose-100 text-rose-800 border-rose-200' };
  };

  const category = getNdviCategory(numericNdvi);

  return (
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
          <FaCloudSunRain size={13} className="text-emerald-600" />
          <span>Indikator Agro-Iklim & Vegetasi Satelit</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-2 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center shadow-xs">
          <FaThermometerHalf className="text-amber-500 mb-0.5 text-xs" />
          <p className="text-[9px] font-semibold text-zinc-400">Rata-rata Suhu</p>
          <p className="text-xs font-extrabold text-zinc-700 mt-0.5">
            {avgTemp}{typeof avgTemp === 'number' ? '°C' : ''}
          </p>
        </div>

        <div className="bg-white p-2 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center shadow-xs">
          <FaTint className="text-blue-500 mb-0.5 text-xs" />
          <p className="text-[9px] font-semibold text-zinc-400">Rata-rata Kel.</p>
          <p className="text-xs font-extrabold text-zinc-700 mt-0.5">
            {avgHumidity}{typeof avgHumidity === 'number' ? '%' : ''}
          </p>
        </div>

        <div className="bg-white p-2 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center shadow-xs">
          <FaCloudSunRain className="text-emerald-500 mb-0.5 text-xs" />
          <p className="text-[9px] font-semibold text-zinc-400">Hujan / Bulan</p>
          <p className="text-xs font-extrabold text-zinc-700 mt-0.5 truncate max-w-full px-0.5">
            {avgRain}{typeof avgRain === 'number' ? ' mm' : ''}
          </p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FaSeedling className="text-emerald-600 text-xs" />
            <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-tight">
              Indeks Kerapatan Tanaman (NDVI)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <FaChartLine className="text-emerald-500 text-[10px]" />
            <span className="text-xs font-black text-emerald-700 font-mono">
              {isLoadingNdvi ? 'Memuat...' : (numericNdvi !== null ? numericNdvi.toFixed(2) : '--')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
          <span className="text-[9px] text-zinc-400 font-medium">Status Tumbuh Kembang:</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${category.color}`}>
            {category.label}
          </span>
        </div>
      </div>
      
      <p className="text-[9px] text-zinc-400 text-center italic font-medium">
        *Data iklim dan NDVI dihitung otomatis dari estimasi koordinat spasial lahan.
      </p>
    </div>
  );
}