// src/components/MacroClimateStats.tsx
'use client';

import React from 'react';
import { FaCloudSunRain, FaThermometerHalf, FaTint } from 'react-icons/fa';

interface MacroClimateStatsProps {
  avgTemp: number | string;
  avgHumidity: number | string;
  avgRain: number | string;
}

export default function MacroClimateStats({ avgTemp, avgHumidity, avgRain }: MacroClimateStatsProps) {
  return (
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider px-1">
        <FaCloudSunRain size={13} className="text-emerald-600" />
        <span>Indikator Agro-Iklim Wilayah Otomatis</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2.5">
        {/* Metrik Suhu */}
        <div className="bg-white p-2 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center shadow-xs">
          <FaThermometerHalf className="text-amber-500 mb-0.5 text-xs" />
          <p className="text-[9px] font-semibold text-zinc-400">Rata-rata Suhu</p>
          <p className="text-xs font-extrabold text-zinc-700 mt-0.5">
            {avgTemp}{typeof avgTemp === 'number' ? '°C' : ''}
          </p>
        </div>

        {/* Metrik Kelembapan */}
        <div className="bg-white p-2 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center shadow-xs">
          <FaTint className="text-blue-500 mb-0.5 text-xs" />
          <p className="text-[9px] font-semibold text-zinc-400">Rata-rata Kel.</p>
          <p className="text-xs font-extrabold text-zinc-700 mt-0.5">
            {avgHumidity}{typeof avgHumidity === 'number' ? '%' : ''}
          </p>
        </div>

        {/* Metrik Curah Hujan */}
        <div className="bg-white p-2 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center shadow-xs">
          <FaCloudSunRain className="text-emerald-500 mb-0.5 text-xs" />
          <p className="text-[9px] font-semibold text-zinc-400">Hujan / Bulan</p>
          <p className="text-xs font-extrabold text-zinc-700 mt-0.5 truncate max-w-full px-0.5">
            {avgRain}{typeof avgRain === 'number' ? ' mm' : ''}
          </p>
        </div>
      </div>
      
      <p className="text-[9px] text-zinc-400 text-center italic font-medium">
        *Data cuaca makro dihitung otomatis berdasarkan histori 3 tahun terakhir di titik koordinat peta.
      </p>
    </div>
  );
}