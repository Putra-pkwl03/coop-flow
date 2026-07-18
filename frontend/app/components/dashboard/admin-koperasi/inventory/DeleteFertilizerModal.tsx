"use client";

import React from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

interface DeleteFertilizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  fertilizerData: {
    name: string;
    code: string;
    stockInfo: string;
  } | null;
}

export default function DeleteFertilizerModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  fertilizerData,
}: DeleteFertilizerModalProps) {
  if (!isOpen || !fertilizerData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative p-6 flex flex-col items-center">
        
        {/* Tombol Close Silang */}
        <button onClick={onClose} className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-600 cursor-pointer">
          <FaTimes className="text-lg" />
        </button>

        {/* Icon Peringatan */}
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 mt-2">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>

        {/* Judul */}
        <h3 className="text-base font-bold text-zinc-900 mb-1">Hapus Data Pupuk</h3>
        <p className="text-xs text-zinc-400 mb-4 text-center">Anda akan menghapus data pupuk berikut:</p>

        {/* Detail Ringkasan Data */}
        <div className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs text-zinc-600 space-y-2.5 mb-4">
          <div className="flex">
            <span className="w-24 font-medium text-zinc-500">Nama Pupuk</span>
            <span className="mr-2">:</span>
            <span className="font-bold text-zinc-800">{fertilizerData.name}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-zinc-500">Kode Pupuk</span>
            <span className="mr-2">:</span>
            <span className="font-bold text-zinc-800 uppercase">{fertilizerData.code}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-zinc-500">Stok Tersedia</span>
            <span className="mr-2">:</span>
            <span className="font-bold text-zinc-800">{fertilizerData.stockInfo}</span>
          </div>
        </div>

        {/* Alert Danger Mini */}
        <div className="w-full bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2.5 text-red-600 text-[11px] font-medium mb-5">
          <FaExclamationTriangle className="text-sm flex-shrink-0" />
          <span>Data yang dihapus tidak dapat dikembalikan</span>
        </div>

        {/* Tombol Aksi */}
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center disabled:opacity-50 shadow-sm"
          >
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}