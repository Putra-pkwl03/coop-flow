'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaReceipt, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaChevronRight, 
  FaTimes, 
  FaBoxOpen,
  FaArrowLeft
} from 'react-icons/fa';

interface ItemSummary {
  fertilizer_id: number;
  fertilizer_name: string;
  quantity_kg: number;
  quantity_sacks: number;
  price_per_kg: number;
  subtotal: number;
}

interface TransactionItem {
  id: number;
  invoice_number: string;
  transaction_date: string;
  total_amount: number;
  payment_method: string;
  status: string;
  items_summary: ItemSummary[];
}

interface TransactionsViewProps {
  transactions: TransactionItem[];
}

export default function TransactionsView({ transactions }: TransactionsViewProps) {
  const router = useRouter();
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  // Format ke Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Format Tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header View dengan Tombol Back */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Kembali"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FaReceipt className="text-emerald-600" /> Nota & Transaksi
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Riwayat pembelian pupuk di KDKMP
            </p>
          </div>
        </div>
        <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200 shrink-0">
          {transactions.length} Nota
        </span>
      </div>

      {/* List Transaksi */}
      {transactions.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FaReceipt className="text-xl" />
          </div>
          <p className="text-xs font-bold text-slate-600">Belum ada riwayat transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition cursor-pointer active:scale-[0.99] space-y-3"
            >
              {/* Header Card */}
              <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                <div>
                  <span className="text-xs font-black text-slate-900 tracking-wide">
                    {tx.invoice_number}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                    <FaCalendarAlt className="text-[9px]" />
                    <span>{formatDate(tx.transaction_date)}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 capitalize">
                  <FaCheckCircle className="text-[9px]" /> {tx.status}
                </span>
              </div>

              {/* Items Brief */}
              <div className="space-y-1">
                {tx.items_summary.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                      <FaBoxOpen className="text-slate-400 text-xs" /> {item.fertilizer_name}
                    </span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      {item.quantity_kg} Kg ({item.quantity_sacks} Karung)
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Card */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <div className="text-[11px] font-semibold text-slate-500">
                  Pembayaran: <span className="text-slate-800 font-bold">{tx.payment_method}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-emerald-700">
                    {formatRupiah(tx.total_amount)}
                  </span>
                  <FaChevronRight className="text-xs text-slate-400 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETAIL NOTA */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Detail Nota Pembelian</h3>
                <p className="text-[11px] font-semibold text-slate-400">{selectedTx.invoice_number}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Info Waktu & Metod */}
            <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Tanggal Transaksi</span>
                <span className="font-bold text-slate-800">{formatDate(selectedTx.transaction_date)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Metode Pembayaran</span>
                <span className="font-bold text-slate-800">{selectedTx.payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Status</span>
                <span className="font-bold text-emerald-700 capitalize">{selectedTx.status}</span>
              </div>
            </div>

            {/* Rincian Barang */}
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Rincian Item</p>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {selectedTx.items_summary.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-black text-slate-900">{item.fertilizer_name}</p>
                      <p className="text-xs font-black text-slate-900">{formatRupiah(item.subtotal)}</p>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>{item.quantity_kg} Kg ({item.quantity_sacks} Karung Utuh)</span>
                      <span>@{formatRupiah(item.price_per_kg)}/kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Rincian */}
            <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-xl flex justify-between items-center">
              <span className="text-xs font-black text-emerald-900">Total Pembayaran</span>
              <span className="text-base font-black text-emerald-700">{formatRupiah(selectedTx.total_amount)}</span>
            </div>

            {/* Tombol Tutup */}
            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition active:scale-95"
            >
              Tutup Nota
            </button>
          </div>
        </div>
      )}
    </div>
  );
}