"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
// Import komponen dari Recharts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ChartSectionProps {
  trenStok: Array<{ bulan: string; stok_kg: number }>;
  trenDistribusi: Array<{ bulan: string; distribusi_kg: number }>;
  stokBulanIni: Array<{ name: string; permintaan: number; color: string }>;
}

export default function ChartSection({
  trenStok = [],
  trenDistribusi = [],
  stokBulanIni = [],
}: ChartSectionProps) {
  const [filterBulan, setFilterBulan] = useState("1 Bulan Terakhir");

  // Balikkan urutan array dari backend (Jul -> Jan menjadi Jan -> Jul) agar tren maju ke kanan
  const { trenStokSorted, trenDistribusiSorted, maxPermintaanBulanIni } =
    useMemo(() => {
      return {
        trenStokSorted: [...trenStok].reverse(),
        trenDistribusiSorted: [...trenDistribusi].reverse(),
        maxPermintaanBulanIni: Math.max(
          ...stokBulanIni.map((s) => s.permintaan),
          5,
        ),
      };
    }, [trenStok, trenDistribusi, stokBulanIni]);

  // Formatter custom untuk angka di sumbu Y dan Tooltip agar rapi (contoh: 5.000 kg)
  const formatKg = (value: number) => `${value.toLocaleString("id-ID")} kg`;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* DUA KANVAS GRAFIK TREN (Area Chart Recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Grafik A: Tren Stok Pupuk */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col min-h-80">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-sm font-black text-slate-800 tracking-tight">
                Tren Stok Pupuk
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Volume stok berjalan di gudang
              </p>
            </div>
            <button className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all">
              {filterBulan} <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Wadah Recharts Relevan Responsive */}
          <div className="flex-1 w-full h-48 text-[10px] font-medium text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trenStokSorted}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  {/* Efek Gradien Hijau */}
                  <linearGradient id="colorStok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="bulan"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatKg(Number(value || 0)), "Stok"]}
                  contentStyle={{
                    background: "#1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "11px",
                    border: "none",
                  }}
                />
                {/* type="monotone" untuk membuat garis melengkung/smooth curve */}
                <Area
                  type="monotone"
                  dataKey="stok_kg"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStok)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik B: Tren Distribusi Pupuk Perbulan */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col min-h-80">
          <div className="mb-4">
            <h2 className="text-sm font-black text-slate-800 tracking-tight">
              Distribusi Pupuk Perbulan
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Volume pupuk keluar disalurkan
            </p>
          </div>

          {/* Wadah Recharts Relevan Responsive */}
          <div className="flex-1 w-full h-48 text-[10px] font-medium text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trenDistribusiSorted}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  {/* Efek Gradien Biru */}
                  <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="bulan"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: any) => [formatKg(Number(value || 0)), "Distribusi"]}
                  contentStyle={{
                    background: "#1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "11px",
                    border: "none",
                  }}
                />
                {/* type="monotone" untuk membuat garis melengkung/smooth curve */}
                <Area
                  type="monotone"
                  dataKey="distribusi_kg"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDist)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KONDISI STOK GUDANG BULAN INI */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-full">
        <h2 className="text-sm font-black text-slate-800 tracking-tight mb-1">
          Kondisi Stok Gudang (Bulan Ini)
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Rasio akumulasi unit aktivitas permintaan pupuk keluar
        </p>

        <div className="space-y-4">
          {stokBulanIni.map((item, idx) => {
            const barWidth =
              item.permintaan > 0
                ? (item.permintaan / maxPermintaanBulanIni) * 100
                : 0;

            return (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-600 w-24 shrink-0 truncate">
                  {item.name}
                </span>
                <div className="flex-1 bg-slate-100 h-5 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{
                      backgroundColor: item.color || "#3b82f6",
                      width: `${barWidth}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-black text-slate-700 w-24 shrink-0 text-right">
                  {item.permintaan}{" "}
                  <span className="text-[10px] font-normal text-slate-400">
                    Permintaan
                  </span>
                </span>
              </div>
            );
          })}

          {stokBulanIni.length === 0 && (
            <p className="text-xs text-center py-4 text-slate-400">
              Belum ada aktivitas mutasi permintaan bulan ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}