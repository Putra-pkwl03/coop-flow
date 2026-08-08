'use client';

import React, { useState } from 'react';
import { Search, ShoppingBag, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

// 1. Perbarui Interface agar bisa membaca relasi 'farmer' dari Laravel
export interface TransactionItem {
  id: number;
  invoice_number: string;
  farmer_name?: string;
  farmer?: {
    id?: number;
    name?: string;
    full_name?: string;
  };
  payment_method?: string;
  grand_total: number;
  status: 'success' | 'pending' | 'failed' | 'expired' | string;
  created_at: string;
}

export interface MutationItem {
  id: number;
  fertilizer_name?: string;
  fertilizer?: {
    name?: string;
  };
  type: 'masuk' | 'keluar' | string;
  quantity_kg: number;
  reference_type?: string;
  created_at: string;
}

interface LaporanTableProps {
  transactions: TransactionItem[];
  mutations: MutationItem[];
  formatRupiah: (val?: number) => string;
  formatKg: (val?: number) => string;
}

export const LaporanTable: React.FC<LaporanTableProps> = ({
  transactions = [],
  mutations = [],
  formatRupiah,
  formatKg,
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'mutations'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper untuk mengambil nama petani secara konsisten
  const getFarmerName = (item: TransactionItem) => {
    return (
      item.farmer_name ||
      item.farmer?.name ||
      item.farmer?.full_name ||
      'Petani Tidak Ditemukan'
    );
  };

  // Helper untuk mengambil nama pupuk secara konsisten
  const getFertilizerName = (item: MutationItem) => {
    return item.fertilizer_name || item.fertilizer?.name || 'Pupuk Non-Nama';
  };

  // 1. Defensif Filter Transaksi (Mencari berdasarkan No Invoice atau Nama Petani)
  const filteredTransactions = (transactions || []).filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    const invoice = t?.invoice_number?.toLowerCase() || '';
    const farmer = getFarmerName(t).toLowerCase();
    return invoice.includes(searchLower) || farmer.includes(searchLower);
  });

  // 2. Defensif Filter Mutasi
  const filteredMutations = (mutations || []).filter((m) => {
    const searchLower = searchTerm.toLowerCase();
    const fertilizer = getFertilizerName(m).toLowerCase();
    return fertilizer.includes(searchLower);
  });

  // Helper format tanggal aman
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-4 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-zinc-200">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-2 sm:pb-0 font-semibold text-sm px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'transactions'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Transaksi Penjualan ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('mutations')}
            className={`pb-2 sm:pb-0 font-semibold text-sm px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'mutations'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Mutasi Barang Gudang ({mutations.length})
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* TABEL 1: Transaksi Penjualan */}
      {activeTab === 'transactions' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-zinc-500 uppercase text-[11px] font-semibold tracking-wider border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3.5">No. Invoice</th>
                <th className="px-6 py-3.5">Nama Petani</th>
                <th className="px-6 py-3.5">Metode Bayar</th>
                <th className="px-6 py-3.5">Total Nilai</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-emerald-700">
                      {item.invoice_number || '-'}
                    </td>
                    
                    {/* Menggunakan helper getFarmerName */}
                    <td className="px-6 py-4 font-medium text-zinc-800">
                      {getFarmerName(item)}
                    </td>
                    
                    <td className="px-6 py-4 uppercase text-xs font-semibold text-zinc-500">
                      {item.payment_method || 'CASH'}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      {formatRupiah(item.grand_total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {(item.status || 'PENDING').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    Belum ada data transaksi penjualan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TABEL 2: Mutasi Barang Gudang */}
      {activeTab === 'mutations' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-zinc-500 uppercase text-[11px] font-semibold tracking-wider border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3.5">Jenis Pupuk</th>
                <th className="px-6 py-3.5">Tipe Mutasi</th>
                <th className="px-6 py-3.5">Jumlah (Kg)</th>
                <th className="px-6 py-3.5">Referensi</th>
                <th className="px-6 py-3.5">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredMutations.length > 0 ? (
                filteredMutations.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-800">
                      {getFertilizerName(item)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.type === 'masuk'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.type === 'masuk' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {(item.type || 'MASUK').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      {formatKg(item.quantity_kg)}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {item.reference_type || 'Manual Stock Adjust'}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                    Belum ada riwayat mutasi stok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};