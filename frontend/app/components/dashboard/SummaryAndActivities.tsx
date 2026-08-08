'use client';

import React from 'react';
import { User, MapPin, Users, ChevronRight } from 'lucide-react';

interface SummaryData {
  farmers: { total: number; label: string };
  lands: { total: number; label: string };
  commodities: { total: number; label: string };
}

interface ActivityItem {
  type: string;
  title: string;
  description: string;
  time: string;
}

interface SummaryAndActivitiesProps {
  summary?: SummaryData;
  recentActivities?: ActivityItem[];
  isLoading?: boolean;
}

export default function SummaryAndActivities({
  summary,
  recentActivities = [],
  isLoading = false,
}: SummaryAndActivitiesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* 1. Ringkasan Aktivitas (Metric Cards) */}
      <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm lg:col-span-6 flex flex-col">
        <h3 className="text-base font-bold text-zinc-800 mb-4">Ringkasan Aktivitas</h3>
        
        <div className="grid grid-cols-3 gap-3 flex-1">
          {/* Card 1: Petani */}
          <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-cyan-400 text-white rounded-full mb-2">
              <User className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-zinc-800">
              {isLoading ? '...' : summary?.farmers.total ?? 0}
            </span>
            <span className="text-xs font-bold text-zinc-700 mt-1">Data Petani</span>
            <span className="text-[9px] text-emerald-600 font-semibold mt-1">
              ▲ {summary?.farmers.label || '0 data baru'}
            </span>
          </div>

          {/* Card 2: Validasi Lahan */}
          <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-blue-500 text-white rounded-full mb-2">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-zinc-800">
              {isLoading ? '...' : summary?.lands.total ?? 0}
            </span>
            <span className="text-xs font-bold text-zinc-700 mt-1">Validasi Lahan</span>
            <span className="text-[9px] text-emerald-600 font-semibold mt-1">
              ▲ {summary?.lands.label || '0 dipetakan'}
            </span>
          </div>

          {/* Card 3: Komoditas */}
          <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-cyan-400 text-white rounded-full mb-2">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-zinc-800">
              {isLoading ? '...' : summary?.commodities.total ?? 0}
            </span>
            <span className="text-xs font-bold text-zinc-700 mt-1">Komoditas</span>
            <span className="text-[9px] text-emerald-600 font-semibold mt-1">
              ▲ {summary?.commodities.label || '0 ditambahkan'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Aktivitas Terbaru */}
      <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm lg:col-span-6 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-800 mb-4">Aktivitas Terbaru</h3>
          
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-xs text-zinc-400 italic">Memuat aktivitas...</p>
            ) : recentActivities.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">Belum ada aktivitas terbaru.</p>
            ) : (
              recentActivities.map((act, index) => (
                <div key={index} className="flex items-center justify-between py-1 border-b border-zinc-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-800">{act.title}</p>
                      <p className="text-[10px] text-zinc-400">{act.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400">{act.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-center pt-3">
          <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition">
            Tambah Data Petani
          </button>
        </div>
      </div>
    </div>
  );
}