"use client";

import React from "react";
import { FaBoxes, FaMoneyBillWave, FaWarehouse } from "react-icons/fa";

// 💡 1. Definisikan tipe data (interface) untuk mencocokkan payload dari Laravel
interface SummaryData {
  total_stock_kg: number;
  total_value_idr: number;
  active_warehouses: number;
}

// 💡 2. Atur agar komponen siap menerima parameter props `summary` dari page.tsx
interface InventorySummaryProps {
  summary: SummaryData | null;
}

export default function InventorySummary({ summary }: InventorySummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Kartu 1: Total Stok */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Total Stok (Semua Jenis)
          </p>
          <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">
            {/* 💡 3. Ambil data asli dari props atau fallback ke 0 jika data belum termuat */}
            {(summary?.total_stock_kg || 0).toLocaleString("id-ID")}{" "}
            <span className="text-sm font-medium text-zinc-500">kg</span>
          </h3>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
          <FaBoxes className="text-xl" />
        </div>
      </div>

      {/* Kartu 2: Nilai Stok */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Nilai Stok
          </p>
          <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">
            {/* 💡 4. Ambil nilai aset rupiah asli dari backend */}
            Rp {(summary?.total_value_idr || 0).toLocaleString("id-ID")}
          </h3>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
          <FaMoneyBillWave className="text-xl" />
        </div>
      </div>

      {/* Kartu 3: Gudang Aktif */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Gudang Aktif
          </p>
          <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">
            {/* 💡 5. Ambil jumlah gudang aktif asli dari backend */}
            {summary?.active_warehouses || 0}{" "}
            <span className="text-sm font-medium text-zinc-500">Gudang</span>
          </h3>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl text-purple-600">
          <FaWarehouse className="text-xl" />
        </div>
      </div>
    </div>
  );
}
