'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '../../../lib/axios'; 
import { RefreshCw, AlertTriangle, Building2, FileSpreadsheet } from 'lucide-react';

import { LaporanMetrics } from '@/app/components/dashboard/admin-koperasi/laporan/LaporanMetrics';
import { LaporanHealthCheck } from '@/app/components/dashboard/admin-koperasi/laporan/LaporanHealthCheck';
import { LaporanTable, TransactionItem, MutationItem } from '@/app/components/dashboard/admin-koperasi/laporan/LaporanTable';

interface LaporanSummary {
  total_pendapatan_omset_rp: number;
  nilai_persediaan_gudang_rp?: number;
  total_pupuk_masuk_kg: number;
  total_pupuk_keluar_kg: number;
  sisa_stok_gudang_kg?: number;
  total_jenis_pupuk?: number;
  stok_kritis?: {
    menipis: number;
    habis: number;
  };
  po_sedang_diproses_count?: number;
}

interface CooperativeProfile {
  id: number;
  name: string;
  code?: string;
  address?: string;
}

export default function LaporanKoperasiPage() {
  const [summary, setSummary] = useState<LaporanSummary | null>(null);
  const [cooperative, setCooperative] = useState<CooperativeProfile | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [mutations, setMutations] = useState<MutationItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      const [resSummary, resCoop, resTableData] = await Promise.all([
        api.get('/cooperative/laporan/summary'),
        api.get('/cooperative/cooperative1/me').catch(() => null),
        api.get('/cooperative/laporan/details').catch((err) => {
          console.error('Gagal mengambil data detail laporan:', err);
          return null;
        })
      ]);

      // 1. Parse Summary Data
      if (resSummary?.data?.success) {
        setSummary(resSummary.data.summary);
      } else if (resSummary?.data) {
        setSummary(resSummary.data);
      }

      // 2. Parse Profile Koperasi
      if (resCoop?.data) {
        setCooperative(resCoop.data.data || resCoop.data);
      }

      // 3. Parse Transactions & Mutations
      if (resTableData?.data) {
        const rawData = resTableData.data;
        
        // Sesuaikan dengan return json dari LaporanController@getDetailsLaporan:
        // { success: true, message: "...", transactions: [...], mutations: [...] }
        const txList = rawData.transactions || rawData.data?.transactions || [];
        const mtList = rawData.mutations || rawData.data?.mutations || [];

        setTransactions(txList);
        setMutations(mtList);
      } else {
        setTransactions([]);
        setMutations([]);
      }

    } catch (err: any) {
      console.error('Error fetching laporan summary:', err);
      setError(err?.response?.data?.message || 'Gagal memuat data laporan koperasi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatKg = (val?: number) => {
    if (val === undefined || val === null) return '0 Kg';
    return new Intl.NumberFormat('id-ID').format(val) + ' Kg';
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium">Memuat Laporan Koperasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-800 antialiased">
      
      {/* 1. TOPBAR HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>{cooperative?.name || 'Internal Koperasi KDMP'}</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Laporan & Rekapitulasi Operasional
          </h1>
          <p className="text-sm text-zinc-500">
            Ringkasan pendapatan, mutasi persediaan, dan kondisi gudang real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Perbarui</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Cetak / Export</span>
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* 2. SUB-KOMPONEN METRIC CARDS */}
      <LaporanMetrics summary={summary} formatRupiah={formatRupiah} formatKg={formatKg} />

      {/* 3. SUB-KOMPONEN HEALTH CHECK & OVERVIEW */}
      <LaporanHealthCheck summary={summary} />

      {/* 4. SUB-KOMPONEN TABEL DETAIL (TRANSAKSI & MUTASI) */}
      <LaporanTable 
        transactions={transactions} 
        mutations={mutations} 
        formatRupiah={formatRupiah} 
        formatKg={formatKg} 
      />

    </div>
  );
}