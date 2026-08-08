'use client';

import React from 'react';

interface LaporanSummary {
  total_jenis_pupuk?: number;
  stok_kritis?: {
    menipis: number;
    habis: number;
  };
  po_sedang_diproses_count?: number;
}

interface LaporanHealthCheckProps {
  summary: LaporanSummary | null;
}

export const LaporanHealthCheck: React.FC<LaporanHealthCheckProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Left Column: Health Check */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">
          Ringkasan Kesehatan Gudang
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-xs text-zinc-500 block mb-1">Total Jenis Pupuk</span>
            <span className="text-xl font-bold text-zinc-800">
              {summary?.total_jenis_pupuk ?? 0} Varietas
            </span>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-xs text-amber-700 font-medium block mb-1">Stok Menipis</span>
            <span className="text-xl font-bold text-amber-900">
              {summary?.stok_kritis?.menipis ?? 0} Produk
            </span>
          </div>

          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100">
            <span className="text-xs text-rose-700 font-medium block mb-1">Stok Habis</span>
            <span className="text-xl font-bold text-rose-900">
              {summary?.stok_kritis?.habis ?? 0} Produk
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-800">Pengadaan PO Dalam Proses</p>
            <p className="text-xs text-zinc-500">
              Restock yang sedang diverifikasi Dinas/Kemenko atau dalam perjalanan.
            </p>
          </div>
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-sm rounded-lg">
            {summary?.po_sedang_diproses_count ?? 0} Order Active
          </span>
        </div>
      </div>

      {/* Right Column: Catatan & Panduan */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-800/60 text-emerald-300 text-xs font-semibold mb-4">
            <span>Informasi Koperasi</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Validasi Stok & Laporan
          </h3>
          <p className="text-xs text-emerald-100/80 leading-relaxed mb-4">
            Laporan ini terisolasi khusus untuk data logistik dan transaksi internal koperasi Anda. Data dicatat secara otomatis dari mutasi barang dan transaksi penjualan kasir.
          </p>
        </div>

        <div className="pt-4 border-t border-emerald-800/80 text-xs text-emerald-200 flex justify-between items-center">
          <span>Status Sinkronisasi:</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Terhubung
          </span>
        </div>
      </div>
    </div>
  );
};