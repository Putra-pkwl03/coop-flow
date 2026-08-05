"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTimes, FaBoxes, FaLayerGroup, FaCoins, FaCalendarAlt } from "react-icons/fa";
import api from "@/app/lib/axios"; 

// ✅ AMAN SAAT BUILD: Menggunakan fungsi helper agar tidak dieksekusi saat prerender di Node.js
const getToast = () => {
  return Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
};

interface ProcurementItem {
  id: string;
  fertilizer_id: number;
  name: string; 
  current_stock_kg: number;
  suggested_procurement_kg: number;
  suggested_procurement_bags: number;
  packaging_size_kg: number;
  price_per_kg: number;
  harga_per_karung: number;
}

interface ProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ProcurementItem[];
  onSuccessSubmit?: (responseData: any) => void;
}

export default function ProcurementModal({ isOpen, onClose, items, onSuccessSubmit }: ProcurementModalProps) {
  const [editableItems, setEditableItems] = useState<Array<ProcurementItem & { inputBags: number }>>([]);
  const [periodePengadaan, setPeriodePengadaan] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Set default nilai periode pengadaan ke bulan & tahun saat ini
  useEffect(() => {
    if (isOpen) {
      const currentMonthYear = new Date().toLocaleString("id-ID", { month: "long", year: "numeric" });
      setPeriodePengadaan(`Periode ${currentMonthYear}`);
    }
  }, [isOpen]);

  // Sinkronisasi data item pupuk ketika modal dibuka
  useEffect(() => {
    if (isOpen && items) {
      setEditableItems(
        items.map((item) => ({
          ...item,
          inputBags: item.suggested_procurement_bags || 0,
        }))
      );
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const handleBagsChange = (id: string, value: string) => {
    const parsedValue = parseInt(value);
    const sanitizedValue = isNaN(parsedValue) ? 0 : parsedValue;
    setEditableItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inputBags: Math.max(0, sanitizedValue) } : item))
    );
  };

  const totalBags = editableItems.reduce((acc, item) => acc + item.inputBags, 0);
  const totalKg = editableItems.reduce((acc, item) => acc + item.inputBags * item.packaging_size_kg, 0);
  const totalPrice = editableItems.reduce((acc, item) => acc + item.inputBags * item.harga_per_karung, 0);

  const handleSubmitAction = async () => {
    if (!periodePengadaan.trim()) {
      getToast().fire({
        icon: "warning",
        title: "Gagal memproses",
        text: "Periode pengadaan wajib diisi."
      });
      return;
    }

    setLoading(true);

    const payload = {
      periode_pengadaan: periodePengadaan,
      items: editableItems.map((item) => ({
        fertilizer_id: item.fertilizer_id,
        fertilizer_name: item.name,
        ai_suggested_bags: item.suggested_procurement_bags,
        ai_suggested_kg: item.suggested_procurement_kg,
        final_bags_ordered: item.inputBags, 
        packaging_size_kg: item.packaging_size_kg,
        price_per_kg: item.price_per_kg,
        harga_per_karung: item.harga_per_karung,
      })),
    };

    try {
      const response = await api.post("/cooperative/procurement", payload);
      
      if (response.data.success) {
        if (onSuccessSubmit) onSuccessSubmit(response.data.data);
        onClose();
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || "Terjadi kesalahan saat memproses pengadaan.";
      
      // Tembak SweetAlert2 Toast Error di Kanan Atas
      getToast().fire({
        icon: "error",
        title: "Proses Gagal",
        text: serverMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-3xl flex flex-col max-h-[95vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h3 className="font-bold text-zinc-900 text-base">Konfirmasi & Sesuaikan Pengadaan</h3>
            <p className="text-xs text-zinc-500">Sesuaikan jumlah karung belanja pupuk subsidi sesuai kebutuhan riil kelompok tani.</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-30">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Konten/Form Input */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Input Tambahan: Periode Pengadaan */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
              <FaCalendarAlt className="text-zinc-400" /> PERIODE DISTRIBUSI PENGADAAN
            </label>
            <input
              type="text"
              value={periodePengadaan}
              onChange={(e) => setPeriodePengadaan(e.target.value)}
              placeholder="Contoh: Periode Agustus 2026"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600 font-medium"
            />
          </div>

          <div className="space-y-3">
            {editableItems.map((item) => {
              const currentItemKg = item.inputBags * item.packaging_size_kg;
              const currentItemPrice = item.inputBags * item.harga_per_karung;

              return (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-zinc-100 bg-zinc-50/50 rounded-xl gap-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-900 text-sm">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      Ukuran: {item.packaging_size_kg} Kg/Karung • Rp {item.harga_per_karung.toLocaleString("id-ID")}/Karung
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    {/* Ringkasan Sub-total per Item */}
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-zinc-800">{currentItemKg.toLocaleString("id-ID")} Kg</p>
                      <p className="text-[11px] text-emerald-600 font-semibold">Rp {currentItemPrice.toLocaleString("id-ID")}</p>
                    </div>

                    {/* Input Jumlah Karung */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={item.inputBags === 0 ? "" : item.inputBags}
                        onChange={(e) => handleBagsChange(item.id, e.target.value)}
                        placeholder="0"
                        disabled={loading}
                        className="w-20 px-2.5 py-1.5 text-center text-sm font-bold border border-zinc-300 rounded-lg bg-white text-zinc-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                      />
                      <span className="text-xs font-semibold text-zinc-500 w-8">Karung</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Total Keseluruhan & Tombol Aksi */}
        <div className="p-5 border-t border-zinc-100 bg-zinc-50 rounded-b-xl space-y-4">
          <div className="grid grid-cols-3 gap-2 bg-white border border-zinc-200 rounded-xl p-3 text-center shadow-2xs">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center justify-center gap-1">
                <FaLayerGroup /> Total Sak
              </p>
              <p className="text-sm font-black text-zinc-800 mt-0.5">{totalBags.toLocaleString("id-ID")} Karung</p>
            </div>
            <div className="border-x border-zinc-100">
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center justify-center gap-1">
                <FaBoxes /> Total Volume
              </p>
              <p className="text-sm font-black text-zinc-800 mt-0.5">{totalKg.toLocaleString("id-ID")} Kg</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center justify-center gap-1">
                <FaCoins /> Total Biaya
              </p>
              <p className="text-sm font-black text-emerald-600 mt-0.5">Rp {totalPrice.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold py-2.5 rounded-lg transition-colors text-center cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmitAction}
              disabled={totalBags === 0 || loading}
              className="flex-1 bg-[#23a038] hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors text-center shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Memproses Data..." : "Konfirmasi Pengadaan"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}