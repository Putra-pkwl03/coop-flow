"use client";

import React from "react";

export default function ChartKebutuhan() {
  const months = ["20 Mei", "27 Mei", "3 Juni", "10 Jun", "17 Jun"];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">
          Prediksi Kebutuhan 30 Hari ke Depan
        </h3>
        <div className="flex items-center space-x-4 mt-2 text-[11px] font-medium text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 rounded-full"></span>
            <span>Kebutuhan Prediksi</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-blue-500 rounded-full"></span>
            <span>Stok Tersedia</span>
          </div>
        </div>
      </div>

      {/* Area Utama Grafik Garis */}
      <div className="h-48 mt-6 pt-4 border-b border-l border-slate-100 relative w-full group">
        {/* Garis Bantu Horizontal (Gridlines) */}
        <div className="absolute w-full border-t border-dashed border-slate-100 top-1/4 left-0"></div>
        <div className="absolute w-full border-t border-dashed border-slate-100 top-2/4 left-0"></div>
        <div className="absolute w-full border-t border-dashed border-slate-100 top-3/4 left-0"></div>

        {/* 1. GRAFIK LINE 1: Kebutuhan Prediksi (Warna Hijau/Emerald) */}
        <div
          className="absolute inset-0 top-4 bg-linear-to-t from-emerald-500/10 to-emerald-500/30 dynamic-line-1"
          style={{
            clipPath:
              "polygon(0% 70%, 25% 55%, 50% 20%, 75% 35%, 100% 10%, 100% 100%, 0% 100%)",
          }}
        />
        {/* Garis Tepi Atas Hijau */}
        <svg
          className="absolute inset-0 top-4 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 70 L 25 55 L 50 20 L 75 35 L 100 10"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* 2. GRAFIK LINE 2: Stok Tersedia (Warna Biru) */}
        <div
          className="absolute inset-0 top-4 bg-linear-to-t from-blue-500/10 to-blue-500/20 dynamic-line-2"
          style={{
            clipPath:
              "polygon(0% 85%, 25% 70%, 50% 45%, 75% 50%, 100% 30%, 100% 100%, 0% 100%)",
          }}
        />
        {/* Garis Tepi Atas Biru */}
        <svg
          className="absolute inset-0 top-4 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 85 L 25 70 L 50 45 L 75 50 L 100 30"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* 3. TITIK KOORDINAT AKTIF & TOOLTIP (Interaktif pas di kursor hover) */}
        {/* Titik 3 Juni (Tengah / 50%) */}
        <div className="absolute left-1/2 top-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/tooltip z-30">
          {/* Bulatan Ring Titik Koordinat */}
          <div className="w-3 h-3 bg-white border-2 border-emerald-500 rounded-full shadow-md cursor-pointer group-hover/tooltip:scale-125 transition-transform"></div>

          {/* Box Tooltip Tiruan */}
          <div className="absolute bottom-6 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            <p className="font-extrabold text-slate-400">3 Juni 2026</p>
            <div className="mt-1 space-y-0.5 font-medium">
              <p className="text-emerald-400">
                📈 Prediksi:{" "}
                <span className="font-bold text-white">72.400 kg</span>
              </p>
              <p className="text-blue-400">
                📦 Stok: <span className="font-bold text-white">56.200 kg</span>
              </p>
            </div>
          </div>
        </div>

        {/* Titik-titik dekorasi lainnya untuk mempercantik line chart */}
        <div className="absolute left-[0%] top-[70%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-emerald-500 rounded-full"></div>
        <div className="absolute left-[25%] top-[55%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-emerald-500 rounded-full"></div>
        <div className="absolute left-[75%] top-[35%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-emerald-500 rounded-full"></div>
        <div className="absolute left-full top-[10%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-emerald-500 rounded-full"></div>
      </div>

      {/* Label Sumbu X */}
      <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 mt-3">
        {months.map((m, i) => (
          <span key={i} className="w-12 text-center">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
