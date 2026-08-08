'use client';

import React from 'react';
import LatestMap from './LatestMap'; 
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CommodityChartItem {
  commodity: string;
  total: number;
}

interface TopCardItem {
  title: string;
  name: string;
  total_lands: number;
  percentage: number;
  formatted_subtitle: string;
}

interface TaskAndActivitiesProps {
  chartSeries?: CommodityChartItem[];
  topCards?: TopCardItem[];
  isLoading?: boolean;
}

export default function TaskAndActivities({
  chartSeries = [],
  topCards = [],
  isLoading = false,
}: TaskAndActivitiesProps) {

  // Warna-warni bar chart
  const BAR_COLORS = [
    '#22c55e', // Hijau
    '#eab308', // Kuning
    '#3b82f6', // Biru
    '#a855f7', // Ungu
    '#f97316', // Oranye
    '#14b8a6', // Toska
    '#9ca3af', // Abu-abu
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* 1. Grafik Komoditas (Porsi Lebar: 5 dari 12 Kolom) */}
      <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm lg:col-span-5 flex flex-col justify-between h-full">
        {/* Bagian Atas: Header + Diagram Bar */}
        <div className="flex flex-col flex-1">
          {/* Header Card */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-2xl text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-800">Grafik Komoditas</h3>
              <p className="text-[11px] text-zinc-400">Jumlah data tanaman perkomoditas</p>
            </div>
          </div>

          {/* Diagram Bar Chart (Tinggi dinaikkan ke h-56 agar mengisi ruang kosong) */}
          <div className="h-56 w-full my-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                Memuat grafik...
              </div>
            ) : chartSeries.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                Belum ada data tanaman.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSeries} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis
                    dataKey="commodity"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a1a1aa', fontSize: 9 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={22}>
                    {chartSeries.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bagian Bawah: Container Kartu Komoditas (Pas 4 Card, Jika lebih akan auto scroll) */}
        <div className="pt-3 border-t border-zinc-100 mt-2">
          <div className="max-h-36 overflow-y-auto pr-1 grid grid-cols-2 gap-2 scrollbar-thin scrollbar-thumb-zinc-200">
            {(topCards.length > 0 ? topCards : Array(4).fill(null)).map((card, idx) => (
              <div
                key={idx}
                className="bg-sky-50/60 border border-sky-100 p-2 rounded-xl flex items-center space-x-2"
              >
                <div className="p-1 bg-white rounded-lg text-emerald-500 shadow-xs shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[8px] font-semibold text-zinc-400 truncate">
                    {card?.title || 'Komoditas Terbanyak'}
                  </p>
                  <p className="text-xs font-bold text-emerald-600 truncate">
                    {card?.name || '-'}
                  </p>
                  <p className="text-[8px] text-zinc-500 font-medium truncate">
                    {card?.formatted_subtitle || '0 Lahan (0%)'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Peta Spasial GIS Terkini (Porsi Lebar: 7 dari 12 Kolom) */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <LatestMap />
      </div>
    </div>
  );
}