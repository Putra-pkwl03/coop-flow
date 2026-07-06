"use client";

import React from "react";
import CardPetani from "./CardPetani";
import CardLahan from "./CardLahan";
import CardPengajuan from "./CardPengajuan";
import CardDistribusi from "./CardDistribusi";

// 1. Import dua komponen baris kedua yang baru
import ChartKebutuhan from "./ChartKebutuhan";
import MapDistribusi from "./MapDistribusi";

interface MetricsProps {
  totalPetani: number;
  luasLahan: number;
  totalPengajuan: number;
  distribusiSelesai: number;
}

export default function OverviewContent({ data }: { data: MetricsProps }) {
  return (
    <div className="w-full space-y-8">
      {/* BARIS 1: Judul Utama */}
      <div className="w-full">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Ringkasan Hari Ini
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Selasa, 20 Mei 2026
        </p>
      </div>

      {/* BARIS 2: 4 Kartu Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full min-w-full items-stretch">
        <CardPetani jumlah={data.totalPetani} />
        <CardLahan luas={data.luasLahan} />
        <CardPengajuan jumlah={data.totalPengajuan} />
        <CardDistribusi jumlah={data.distribusiSelesai} />
      </div>

      {/* BARIS 3: Grafik & Peta Wilayah (Flexbox Responsif) */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
        <ChartKebutuhan />
        <MapDistribusi />
      </div>
    </div>
  );
}
