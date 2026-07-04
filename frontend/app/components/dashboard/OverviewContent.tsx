'use client';

import React from 'react';
import { FaMapMarkedAlt, FaUsers, FaLeaf } from 'react-icons/fa';

export default function OverviewContent() {
  const stats = [
    { title: 'Total Area Lahan', value: '1,240 Ha', desc: 'Wilayah spasial terpetakan', icon: FaMapMarkedAlt, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { title: 'Petani Terdaftar', value: '348 Orang', desc: 'Klaster aktif terverifikasi', icon: FaUsers, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { title: 'Estimasi Panen (ML)', value: '4,120 Ton', desc: 'Prediksi model kecerdasan buatan', icon: FaLeaf, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  ];

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 max-w-7xl w-full mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Ringkasan Aktivitas Lapangan</h1>
        <p className="text-sm text-zinc-500 mt-1">Pantau analitik spasial polygon komoditas dan statistik kelompok tani secara realtime.</p>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm shadow-zinc-100/40 flex items-start justify-between hover:shadow-md hover:border-zinc-300/60 transition-all duration-200">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{stat.title}</p>
                <div className="space-y-1">
                  <p className="text-3xl font-extrabold text-zinc-800 tracking-tight">{stat.value}</p>
                  <p className="text-xs font-medium text-zinc-500">{stat.desc}</p>
                </div>
              </div>
              <div className={`p-3.5 rounded-xl border ${stat.color} shadow-inner`}>
                <Icon className="text-xl" />
              </div>
            </div>
          );
        })}
      </div>

      {/* GIS Map Placeholder */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-8 h-[390px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-50/20 via-transparent to-transparent opacity-60"></div>
        <div className="border border-dashed border-zinc-300/80 bg-zinc-50/50 p-8 rounded-2xl flex flex-col items-center max-w-sm transition-all duration-300 group-hover:border-emerald-400 group-hover:bg-white z-10">
          <div className="p-4 bg-white shadow-md shadow-zinc-200/50 rounded-full mb-4 text-zinc-400 group-hover:text-emerald-500 transition-colors">
            <FaMapMarkedAlt className="text-3xl" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800 mb-1.5">Engine Visualisasi Poligon (PostGIS)</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Modul peta GIS interaktif untuk pembagian zona batas lahan petani akan di-render di panel utama ini pada fase integrasi berikutnya.</p>
        </div>
      </div>
    </main>
  );
}