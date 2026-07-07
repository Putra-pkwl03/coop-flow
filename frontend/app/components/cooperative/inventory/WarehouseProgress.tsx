"use client";

import React from "react";

// 💡 1. Definisikan tipe data struktur gudang yang dikirim dari Laravel
interface WarehouseItem {
  id: number;
  name: string;
  capacity_kg: number;
  used_stock_kg: number;
}

// 💡 2. Definisikan tipe props agar siap menerima kiriman data dari page.tsx
interface WarehouseProgressProps {
  warehouses: WarehouseItem[];
}

export default function WarehouseProgress({
  warehouses,
}: WarehouseProgressProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 💡 3. Ganti mockWarehouses dengan data array asli hasil fetch Axios */}
      {warehouses.map((gudang) => {
        // 🔥 Hitung persentase terisi secara dinamis (amankan dari pembagian dengan angka 0)
        const persentase =
          gudang.capacity_kg > 0
            ? Math.round((gudang.used_stock_kg / gudang.capacity_kg) * 100)
            : 0;

        // Tentukan warna bar secara dinamis: merah jika hampir penuh (>90%), hijau jika aman
        const warnaBar = persentase > 90 ? "bg-red-600" : "bg-emerald-600";

        return (
          <div
            key={gudang.id}
            className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between space-y-4 hover:border-zinc-200 transition-all"
          >
            <div>
              <h4 className="text-sm font-bold text-zinc-900 tracking-tight">
                {gudang.name}
              </h4>

              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-400">Total Stok:</span>
                  <span className="text-zinc-800 font-semibold">
                    {gudang.used_stock_kg.toLocaleString("id-ID")} kg
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-400">Kapasitas:</span>
                  <span className="text-zinc-500">
                    {gudang.capacity_kg.toLocaleString("id-ID")} kg
                  </span>
                </div>
              </div>
            </div>

            {/* PROGRESS BAR INDIKATOR KAPASITAS */}
            <div className="space-y-1.5">
              <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`${warnaBar} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${persentase}%` }}
                ></div>
              </div>
              <div className="flex justify-end text-[11px] font-bold text-zinc-500">
                {persentase}%
              </div>
            </div>
          </div>
        );
      })}

      {/* KARTU SPESIAL: TOMBOL TAMBAH GUDANG BARU */}
      <button
        type="button"
        className="bg-zinc-50/50 hover:bg-zinc-50 p-6 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-center group transition-all min-h-40"
      >
        <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-zinc-700 group-hover:border-zinc-300 shadow-sm transition-all mb-2">
          <span className="text-lg font-light">+</span>
        </div>
        <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-800 transition-colors">
          Tambah Gudang
        </span>
      </button>
    </div>
  );
}
