"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { 
  FaBrain, FaCalendarAlt, FaBoxes, FaLayerGroup, 
  FaMapMarkerAlt, FaTruck, FaWarehouse, FaInfoCircle, FaShieldAlt
} from "react-icons/fa";
import ProcurementModal from "./ProcurementModal"; 

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

interface AiProcurementPanelProps {
  aiData: {
    overview: {
      periode_pengadaan: string;
      total_pengadaan_kg: number;
      total_pengadaan_bags: number;
      jenis_pupuk_count: number;
    };
    items: Array<{
      id: string;
      fertilizer_id: number;
      name: string;
      current_stock_kg: number;
      suggested_procurement_kg: number;
      suggested_procurement_bags: number;
      packaging_size_kg: number;
      price_per_kg: number;
      harga_per_karung: number;
      image_url: string | null;
      analysis_meta?: {
        wilayah?: string;
        jarak_ke_pusat?: string;
        lead_time_sistem?: string;
        estimasi_sampai?: string;
        bulan_analisis?: string;
        keterangan_sistem?: string;
        is_fallback?: boolean;
        stok_saat_ini?: string;
        prediksi_sebulan?: string;
      };
    }>;
  };
}

export default function AiProcurementPanel({ aiData }: AiProcurementPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const aiOverview = aiData?.overview || null;
  const aiItems = aiData?.items || [];
  const sampleMeta = aiItems.length > 0 ? aiItems[0].analysis_meta : null;

  if (!aiOverview) return null;

  // Callback sukses memproses PO pengadaan ke backend
  const handleOrderSuccess = (responseData: any) => {
    setIsModalOpen(false);
    
    // Tampilkan SweetAlert2 Toast Kanan Atas
    getToast().fire({
      icon: "success",
      title: "Berhasil!",
      text: `PO Nomor ${responseData?.po_number || ""} sukses diajukan ke Dinas Pertanian.`
    });
  };

  return (
    <div className="space-y-4 shrink-0 animate-fadeIn">
      {/* 1. KARTU UTAMA SUMMARY AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
        
        {/* Kolom Kiri */}
        <div className="lg:col-span-1 flex flex-col justify-between space-y-4">
          <div className="p-4 border border-blue-100 bg-green-50/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-green-800">Periode Prediksi</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-green-600 text-white">
                Analisis Kebutuhan
              </span>
            </div>
            <p className="text-sm font-bold flex items-center gap-2 text-zinc-800">
              <FaCalendarAlt className="shrink-0 text-green-600" />
              {aiOverview.periode_pengadaan || "-"}
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm space-y-3">
            <h4 className="font-bold text-zinc-700 text-xs uppercase tracking-wider">Total Rekomendasi PO</h4>
            
            <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
              <span className="text-zinc-500 flex items-center gap-2">
                <FaBoxes className="text-xs text-zinc-400" /> Total Volume:
              </span>
              <span className="font-bold text-zinc-800">
                {aiOverview.total_pengadaan_kg?.toLocaleString("id-ID")} Kg
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
              <span className="text-zinc-500 flex items-center gap-2">
                <FaLayerGroup className="text-xs text-zinc-400" /> Total Kemasan:
              </span>
              <span className="font-bold text-zinc-800">
                {aiOverview.total_pengadaan_bags?.toLocaleString("id-ID")} Karung
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500 flex items-center gap-2">
                <FaMapMarkerAlt className="text-xs text-zinc-400" /> Cakupan Wilayah:
              </span>
              <span className="font-semibold text-zinc-700">
                {sampleMeta?.wilayah || "DI Yogyakarta"}
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="lg:col-span-2 border border-zinc-200 bg-zinc-50/30 rounded-xl p-4 flex flex-col justify-between">
          <h4 className="font-bold text-zinc-500 text-xs uppercase tracking-wider mb-4">
            Estimasi Distribusi Logistik (Jarak Sentral: {sampleMeta?.jarak_ke_pusat || "-"})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <FaBrain className="text-blue-600 text-xs" />
                <span className="text-xs font-bold text-zinc-700">Lead Time ML</span>
              </div>
              <p className="text-lg font-black text-blue-700">{sampleMeta?.lead_time_sistem || "-"}</p>
              <p className="text-[11px] text-zinc-400 mt-1">Waktu aman pemrosesan order logistik.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <FaTruck className="text-amber-500 text-xs" />
                <span className="text-xs font-bold text-zinc-700">Kategori Pupuk</span>
              </div>
              <p className="text-lg font-black text-amber-600">{aiOverview.jenis_pupuk_count || 0} Varian</p>
              <p className="text-[11px] text-zinc-400 mt-1">Jenis pupuk yang direkomendasikan restock.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <FaWarehouse className="text-emerald-600 text-xs" />
                <span className="text-xs font-bold text-zinc-700">Estimasi Tiba</span>
              </div>
              <p className="text-lg font-black text-emerald-600">{sampleMeta?.estimasi_sampai || "-"}</p>
              <p className="text-[11px] text-zinc-500 font-medium mt-1 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                Bulan Analisis: {sampleMeta?.bulan_analisis || "-"}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full bg-[#23a038] cursor-pointer hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors text-center shadow-xs"
          >
            Proses PO Massal ({aiOverview.jenis_pupuk_count || 0} Pupuk) Sekarang
          </button>
        </div>

      </div>

      {/* 2. TABEL BREAKDOWN REKOMENDASI */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex items-center gap-2">
          <FaShieldAlt className="text-emerald-600 text-sm" />
          <h4 className="font-bold text-zinc-700 text-xs uppercase tracking-wider">
            Rincian Analisis & Proteksi Overstock Kontrol Gudang
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Nama Pupuk</th>
                <th className="px-4 py-3 text-center">Stok Sistem</th>
                <th className="px-4 py-3 text-center">Prediksi Kebutuhan (30 Hari)</th>
                <th className="px-4 py-3 text-right">Rekomendasi Belanja</th>
                <th className="px-4 py-3 text-center">Jumlah Karung</th>
                <th className="px-4 py-3 pl-6">Justifikasi Keputusan ML / Sistem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {aiItems.map((item, index) => {
                const meta = item.analysis_meta;
                const isZero = item.suggested_procurement_kg === 0;
                return (
                  <tr key={item.id || index} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-zinc-900">{item.name}</td>
                    <td className="px-4 py-3.5 text-center text-zinc-600">{meta?.stok_saat_ini || `${item.current_stock_kg} Kg`}</td>
                    <td className="px-4 py-3.5 text-center text-zinc-600">{meta?.prediksi_sebulan || "-"}</td>
                    <td className={`px-4 py-3.5 text-right font-bold ${isZero ? "text-zinc-400" : "text-emerald-600"}`}>{item.suggested_procurement_kg.toLocaleString("id-ID")} Kg</td>
                    <td className={`px-4 py-3.5 text-center font-semibold ${isZero ? "text-zinc-400" : "text-zinc-800"}`}>{item.suggested_procurement_bags} Sak</td>
                    <td className="px-4 py-3.5 pl-6">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${isZero ? "bg-zinc-100 text-zinc-600 border border-zinc-200" : meta?.keterangan_sistem?.includes("Disesuaikan") ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                        <FaInfoCircle className="text-[10px] shrink-0" />
                        {meta?.keterangan_sistem || "Dihitung otomatis"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProcurementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        items={aiItems}
        onSuccessSubmit={handleOrderSuccess}
      />
    </div>
  );
}