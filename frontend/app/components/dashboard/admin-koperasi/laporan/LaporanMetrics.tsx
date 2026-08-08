'use client';

import React from 'react';
import { TrendingUp, ArrowDownLeft, ArrowUpRight, Package, Receipt } from 'lucide-react';

interface LaporanSummary {
  total_pendapatan_omset_rp: number;
  nilai_persediaan_gudang_rp?: number;
  total_pupuk_masuk_kg: number;
  total_pupuk_keluar_kg: number;
  sisa_stok_gudang_kg?: number;
}

interface LaporanMetricsProps {
  summary: LaporanSummary | null;
  formatRupiah: (val?: number) => string;
  formatKg: (val?: number) => string;
}

export const LaporanMetrics: React.FC<LaporanMetricsProps> = ({ summary, formatRupiah, formatKg }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Omset Penjualan */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Total Omset Penjualan
          </span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          {formatRupiah(summary?.total_pendapatan_omset_rp)}
        </div>
        <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
          <Receipt className="w-3.5 h-3.5 text-emerald-500 inline" />
          Akumulasi transaksi penjualan
        </p>
      </div>

      {/* Total Pupuk Masuk */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Total Pupuk Masuk
          </span>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          {formatKg(summary?.total_pupuk_masuk_kg)}
        </div>
        <p className="text-xs text-zinc-500 mt-2">Restock & suplai pengadaan</p>
      </div>

      {/* Total Pupuk Keluar */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Total Pupuk Keluar
          </span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          {formatKg(summary?.total_pupuk_keluar_kg)}
        </div>
        <p className="text-xs text-zinc-500 mt-2">Tersalurkan ke petani</p>
      </div>

      {/* Nilai Persediaan */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Est. Nilai Persediaan
          </span>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          {formatRupiah(summary?.nilai_persediaan_gudang_rp || 0)}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Sisa Stok: <span className="font-semibold text-zinc-700">{formatKg(summary?.sisa_stok_gudang_kg)}</span>
        </p>
      </div>
    </div>
  );
};