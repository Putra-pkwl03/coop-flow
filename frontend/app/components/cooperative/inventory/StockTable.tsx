"use client";

import React from "react";

// 💡 1. Definisikan tipe data (interface) struktur JSON dari Laravel
interface StockItem {
  id: number;
  name: string;
  current_stock: number;
  minimum_stock: number;
  price_per_kg: number;
  status: "Aman" | "Waspada" | "Kritis";
  warehouse_name: string;
}

// 💡 2. Atur agar komponen mau menerima kiriman props `stocks` dari page.tsx
interface StockTableProps {
  stocks: StockItem[];
}

export default function StockTable({ stocks }: StockTableProps) {
  // Logika pembacaan status badge dinamis (tetap kita pertahankan)
  const renderStatusBadge = (status: string) => {
    if (status === "Kritis") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
          ● Kritis
        </span>
      );
    }
    if (status === "Waspada") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
          ● Waspada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
        ● Aman
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 text-xs font-semibold tracking-wider">
              <th className="py-4 px-6">Jenis Pupuk</th>
              {/* Tambahan kolom info gudang untuk membedakan multi-gudang */}
              <th className="py-4 px-6">Lokasi Gudang</th>
              <th className="py-4 px-6 text-right">Stok Tersedia</th>
              <th className="py-4 px-6 text-center">Satuan</th>
              <th className="py-4 px-6 text-right">Stok Minimal</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
            {/* 💡 3. Looping sekarang membaca array `stocks` kiriman dari Axios */}
            {stocks.map((stock) => (
              <tr
                key={stock.id}
                className="hover:bg-zinc-50/50 transition-colors"
              >
                {/* Nama Pupuk (Membaca `stock.name`) */}
                <td className="py-4 px-6 font-semibold text-zinc-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  {stock.name}
                </td>

                {/* Lokasi Gudang (Membaca `stock.warehouse_name`) */}
                <td className="py-4 px-6 text-zinc-500 font-medium">
                  {stock.warehouse_name}
                </td>

                {/* Stok Tersedia (Membaca `stock.current_stock`) */}
                <td className="py-4 px-6 text-right font-medium text-zinc-900">
                  {stock.current_stock.toLocaleString("id-ID")}
                </td>

                {/* Satuan (Kita hardcode 'kg' karena tipe database kita _kg) */}
                <td className="py-4 px-6 text-center text-zinc-400 font-medium">
                  kg
                </td>

                {/* Stok Minimal (Membaca `stock.minimum_stock`) */}
                <td className="py-4 px-6 text-right text-zinc-500 font-medium">
                  {stock.minimum_stock.toLocaleString("id-ID")}
                </td>

                {/* Status Badge Dinamis (Membaca status pintar dari Laravel) */}
                <td className="py-4 px-6 text-center">
                  {renderStatusBadge(stock.status)}
                </td>

                {/* Tombol Aksi Titik Tiga */}
                <td className="py-4 px-6 text-center">
                  <button className="text-zinc-400 hover:text-zinc-700 font-bold px-2 py-1 rounded">
                    •••
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
