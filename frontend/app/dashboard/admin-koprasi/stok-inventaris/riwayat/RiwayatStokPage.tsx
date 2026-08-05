'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../../lib/axios';
import {
  FaSearch,
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import InventoryTabs from '@/app/components/dashboard/admin-koperasi/inventory/InventoryTabs';
import InventorySummary from '@/app/components/dashboard/admin-koperasi/inventory/InventorySummary';

interface MutationHistoryItem {
  id: number;
  fertilizer_id: number;
  farmer_id: number | null;
  type: 'masuk' | 'keluar';
  quantity_kg: number;
  description: string;
  created_at: string;
  fertilizer?: {
    id: number;
    name: string;
    warehouse?: {
      name: string;
    };
  };
}

export default function RiwayatStokPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [histories, setHistories] = useState<MutationHistoryItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  useEffect(() => {
    setLoading(true);

    const fetchHistory = api.get('/cooperative/inventory/history');
    const fetchOverview = api.get('/cooperative/inventory/overview');

    Promise.all([fetchHistory, fetchOverview])
      .then(([historyRes, overviewRes]) => {
        if (historyRes.data.success === true || historyRes.data.data) {
          setHistories(historyRes.data.data || []);
        } else {
          Toast.fire({
            icon: 'error',
            title: historyRes.data.message || 'Gagal mengambil data',
          });
        }

        if (overviewRes.data.success) {
          setSummary(overviewRes.data.data);
        }
      })
      .catch((error) => {
        console.error('Gagal memuat riwayat mutasi:', error);
        Toast.fire({
          icon: 'error',
          title: 'Gagal mengambil data riwayat mutasi dari server',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full space-y-4 animate-pulse">
        <InventoryTabs />

        {/* SKELETON SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white py-4 px-6 rounded-lg border border-zinc-100 shadow-sm flex items-center gap-5 min-h-35"
            >
              <div className="w-14 h-14 bg-zinc-200 rounded-full shrink-0" />
              <div className="flex flex-col justify-center space-y-3 w-full">
                <div className="h-3 w-20 bg-zinc-200 rounded" />
                <div className="h-5 w-14 bg-zinc-200 rounded" />
                <div className="h-2.5 w-16 bg-zinc-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* SKELETON BAR PENCARIAN */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
          <div className="h-9 w-full sm:w-80 bg-zinc-200 rounded-xl" />
          <div className="h-9 w-40 bg-zinc-200 rounded-xl" />
        </div>

        {/* SKELETON TABEL */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="h-8 bg-zinc-100 rounded-md w-full" />
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 gap-4 py-2 border-b border-zinc-100 last:border-0"
              >
                <div className="h-4 bg-zinc-200 rounded w-3/4" />
                <div className="h-4 bg-zinc-200 rounded w-2/3" />
                <div className="h-4 bg-zinc-200 rounded w-1/2 mx-auto" />
                <div className="h-4 bg-zinc-200 rounded w-1/2 ml-auto" />
                <div className="h-4 bg-zinc-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 animate-fadeIn">
      {/* CARD RINGKASAN */}
      <InventorySummary summary={summary} />

      {/* BAR PENCARIAN */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3 top-3.5 text-zinc-400 text-xs" />
          <input
            type="text"
            placeholder="Cari jenis pupuk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-100">
          <FaCalendarAlt />
          <span>Periode: Semua Waktu</span>
        </div>
      </div>

      {/* TAB NAVIGASI */}
      <InventoryTabs />

      {/* TABEL DATA RIWAYAT */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 text-xs font-semibold tracking-wider">
                <th className="py-4 px-6">Waktu / ID</th>
                <th className="py-4 px-6">Jenis Pupuk</th>
                <th className="py-4 px-6 text-center">Tipe</th>
                <th className="py-4 px-6 text-right">Jumlah</th>
                <th className="py-4 px-6">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
              {histories.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-zinc-400 font-medium"
                  >
                    Belum ada riwayat transaksi mutasi masuk atau keluar.
                  </td>
                </tr>
              ) : (
                histories
                  .filter((item) =>
                    item.fertilizer?.name
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="text-xs font-bold text-zinc-500">
                          {formatDate(log.created_at)}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400 mt-0.5">
                          TRX-{log.id}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-zinc-900">
                        {log.fertilizer?.name || 'Pupuk N/A'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {log.type === 'masuk' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700">
                            <FaArrowDown className="text-[10px]" /> Masuk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                            <FaArrowUp className="text-[10px]" /> Keluar
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-extrabold ${
                          log.type === 'masuk'
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {log.type === 'masuk' ? '+' : '-'}
                        {log.quantity_kg.toLocaleString('id-ID')}{' '}
                        <span className="text-xs font-medium text-zinc-400">
                          kg
                        </span>
                      </td>
                      <td
                        className="py-4 px-6 text-xs text-zinc-500 max-w-xs truncate"
                        title={log.description}
                      >
                        {log.description}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}