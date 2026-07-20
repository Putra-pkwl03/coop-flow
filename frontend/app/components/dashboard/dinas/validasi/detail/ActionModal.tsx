"use client";

import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { status: "APPROVED" | "REJECTED"; reason?: string }) => void;
  type: "approve" | "reject" | null;
  data: any;
  isSubmitting: boolean;
}

export default function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  data,
  isSubmitting,
}: ActionModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen || !type) return null;

  const isApprove = type === "approve";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApprove && !reason.trim()) return;
    onConfirm({
      status: isApprove ? "APPROVED" : "REJECTED",
      ...(isApprove ? {} : { reason }),
    });
  };

  // Menghitung ringkasan item pupuk
  const totalJenis = data?.items?.length || 0;
  const totalKarung = data?.items?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0;
  const totalBerat = data?.items?.reduce((acc: number, item: any) => acc + (item.total_weight || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Kontainer Modal */}
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center text-center space-y-5"
        >
          {/* Top Banner Ikon */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${isApprove ? "bg-amber-50" : "bg-red-50"}`}
          >
            {isApprove ? (
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 font-bold text-2xl">
                📋
              </div>
            ) : (
              <FaExclamationTriangle className="w-9 h-9 text-red-500" />
            )}
          </div>

          {/* Judul Pengadaan */}
          <div>
            <h3 className="text-lg font-black text-zinc-900">
              Pengadaan Pupuk
            </h3>
            <p className="text-sm font-bold text-zinc-500 mt-0.5">
              {data?.po_number || "PGI_UNKNOWN"}
            </p>
          </div>

          {/* Box Detail Pengadaan Ringkas */}
          <div className="bg-zinc-50 rounded-2xl p-4 w-full border border-zinc-100 text-left text-xs text-zinc-700 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-zinc-400">Pengadaan</span>
              <span className="font-bold text-zinc-800">
                : {data?.cooperative?.name || "Koperasi"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Tanggal Pengadaan</span>
              <span className="font-bold text-zinc-800">
                :{" "}
                {data?.created_at
                  ? new Date(data.created_at).toLocaleDateString("id-ID")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Jenis Pupuk</span>
              <span className="font-bold text-zinc-800">
                : {totalJenis} Jenis
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Jumlah Pupuk</span>
              <span className="font-bold text-zinc-800">
                : {data.total_bags_ordered} Karung
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Berat Pupuk</span>
              <span className="font-bold text-zinc-800">
                : {(data.total_weight_kg / 1000).toFixed(3)} Ton
              </span>
            </div>
          </div>

          {/* Form Input Alasan Penolakan */}
          {!isApprove && (
            <div className="w-full text-left space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Masukkan alasan dokumen/kuota tidak valid..."
                className="w-full border border-zinc-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none h-20"
              />
            </div>
          )}

          {/* Teks Konfirmasi Aksi */}
          <div className="space-y-1">
            <h4 className="text-sm font-black text-zinc-900">
              Apakah Anda yakin untuk {isApprove ? "menyetujui" : "menolak"}{" "}
              pengadaan ini?
            </h4>
            <p className="text-xs text-zinc-400">
              {isApprove
                ? "Pengadaan akan diteruskan kepada Kemenko Pangan untuk alokasi kuota."
                : "Pengadaan ini akan dibatalkan secara permanen di sistem dinas."}
            </p>
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="grid grid-cols-2 gap-4 w-full pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="py-3 px-6 border border-zinc-200 text-zinc-700 font-bold rounded-xl text-sm hover:bg-zinc-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!isApprove && !reason.trim())}
              className={`py-3 px-6 text-white font-bold rounded-xl text-sm transition shadow-sm ${
                isApprove
                  ? "bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-800/50"
                  : "bg-red-600 hover:bg-red-700 disabled:bg-red-600/50"
              }`}
            >
              {isSubmitting ? "Memproses..." : "Ya"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}