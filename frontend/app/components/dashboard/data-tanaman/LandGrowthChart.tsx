'use client';

import React, { useState, useEffect } from 'react';
import { FaChartLine, FaSpinner } from 'react-icons/fa';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import api from '@/app/lib/axios';

interface NdviPoint {
  date: string;
  ndvi: number;
}

// Custom Tooltip Modern
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as NdviPoint;
    const ndviVal = data.ndvi;

    let statusColor = 'text-amber-500';
    let statusText = 'Sedang';
    if (ndviVal >= 0.6) {
      statusColor = 'text-emerald-600';
      statusText = 'Subur';
    } else if (ndviVal < 0.3) {
      statusColor = 'text-rose-500';
      statusText = 'Kritis';
    }

    return (
      <div className="bg-zinc-900/90 backdrop-blur-md text-white text-[11px] p-2.5 rounded-lg shadow-xl border border-zinc-700/50 flex flex-col gap-1">
        <span className="text-zinc-400 font-medium text-[10px]">{data.date}</span>
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-zinc-200">NDVI:</span>
          <span className="font-extrabold text-emerald-400 text-xs">{ndviVal}</span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-800">
          <span className="text-zinc-400 text-[9px]">Kondisi:</span>
          <span className={`font-bold text-[10px] ${statusColor}`}>{statusText}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function LandGrowthChart({ landId }: { landId: number }) {
  const [data, setData] = useState<NdviPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNdviHistory = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await api.get(`/lands/${landId}/growth-chart`);
        const json = res.data;

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setData(json.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(`[NDVI Chart Fetch Error - Land #${landId}]:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (landId) {
      fetchNdviHistory();
    }
  }, [landId]);

  if (loading) {
    return (
      <div className="w-full h-52 bg-white/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-zinc-400 border border-zinc-200/80 shrink-0 shadow-sm">
        <FaSpinner className="animate-spin text-xl mb-2 text-emerald-600" />
        <span className="text-xs font-medium text-zinc-500">Memuat Tren NDVI...</span>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="w-full h-52 bg-zinc-50/50 rounded-2xl flex flex-col items-center justify-center text-zinc-400 border border-zinc-200/80 shrink-0 shadow-sm p-4 text-center">
        <FaChartLine className="text-2xl mb-2 opacity-30 text-zinc-600" />
        <span className="text-xs font-semibold text-zinc-600">Data Grafik Tidak Tersedia</span>
        <span className="text-[10px] text-zinc-400 mt-0.5">Belum ada riwayat pemindaian satelit.</span>
      </div>
    );
  }

  const latestPoint = data[data.length - 1];

  return (
    <div className="w-full bg-white border border-zinc-200/80 rounded-2xl p-4 shrink-0 shadow-sm flex flex-col justify-between gap-3 hover:shadow-md transition-shadow duration-300">
      {/* Header Info - Ringkas di Atas */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <FaChartLine className="text-xs" />
            </div>
            <span>Tren Pertumbuhan Lahan</span>
          </div>
          
          {/* Tanggal & Nilai NDVI dipindah ke bawah / samping secara kompak */}
          <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-100 px-2 py-0.5 rounded-full">
            <span className="text-[9px] font-medium text-zinc-400">{latestPoint?.date}:</span>
            <span className="text-xs font-extrabold text-emerald-600">{latestPoint?.ndvi}</span>
          </div>
        </div>
        <span className="text-[10px] text-zinc-400 pl-0.5">Indeks Vegetasi Satelit (NDVI)</span>
      </div>

      {/* Interactive Recharts Area - Dibuat Lebih Tinggi dan Melebar Penuh */}
      <div className="w-full h-36 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 1]} hide />

            {/* Garis Batas Kritis & Subur */}
            <ReferenceLine y={0.3} stroke="#f43f5e" strokeDasharray="3 3" strokeOpacity={0.35} />
            <ReferenceLine y={0.6} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.35} />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="ndvi"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#ndviGradient)"
              activeDot={{
                r: 6,
                fill: '#10b981',
                stroke: '#ffffff',
                strokeWidth: 2,
                className: 'animate-pulse',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Indikator & Legenda */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-100 pt-2.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Kritis (&lt;0.3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Subur (&gt;0.6)</span>
        </div>
      </div>
    </div>
  );
}