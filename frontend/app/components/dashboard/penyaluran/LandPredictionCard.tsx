"use client";

import { useState } from "react";
import { Land } from "@/app/types/farmer";
import api from "@/app/lib/axios";
import FertilizerItemSelector from "./FertilizerItemSelector";
import { FaMapMarkedAlt, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaChartBar } from "react-icons/fa";

export interface FertilizerAnalysisMeta {
  luas_lahan: string;
  komoditas: string;
  fase_tanam: string;
  suhu?: string;
  kelembapan?: string;
  curah_hujan?: string;
}

export interface CustomFertilizerItem {
  id: string | null;
  fertilizer_id?: number | null;
  fertilizer_code: string;
  nama: string;
  fungsi: string;
  price_per_kg: number;
  harga_per_karung: number;
  jumlah_karung: number;
  packaging_size_kg: number;
  original_recommended_kg: number;
  original_recommended_bags: number;
  image_url: string | null;
  is_ml?: boolean;
  analysis_meta?: FertilizerAnalysisMeta;
}

interface LandPredictionCardProps {
  land: Land;
  village?: Village;
  onLandSummaryChange: (landId: string, summary: { totalBags: number; totalCost: number; totalKg: number }) => void;
}

export default function LandPredictionCard({ land, village, onLandSummaryChange }: LandPredictionCardProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<CustomFertilizerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentSummary, setCurrentSummary] = useState({ totalBags: 0, totalCost: 0, totalKg: 0 });

const fetchRecommendations = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await api.post(`/farmers/lands/${land.id}/fertilizer-recommendation`);
    const results: CustomFertilizerItem[] = response.data?.data?.recommendations || [];
    setRecommendations(results);
    setHasLoaded(true);
    
    if (results.length > 0) {
      const totalBags = results.reduce((acc, c) => acc + c.jumlah_karung, 0);
      const totalKg = results.reduce((acc, c) => acc + (c.jumlah_karung * c.packaging_size_kg), 0);
      const totalCost = results.reduce((acc, c) => acc + Math.round(c.price_per_kg * (c.jumlah_karung * c.packaging_size_kg)), 0);
      
      const defaultSummary = { totalBags, totalCost, totalKg, rawItems: results };
      setCurrentSummary(defaultSummary);
      onLandSummaryChange(String(land.id), defaultSummary);
    }
  } catch (err: any) {
    setError(err.response?.data?.message || "Gagal memproses prediksi.");
    onLandSummaryChange(String(land.id), { totalBags: 0, totalCost: 0, totalKg: 0, rawItems: [] });
  } finally {
    setLoading(false);
  }
};

  const togglePrediction = async () => {
    if (isOpen) {
      setIsOpen(false);
      onLandSummaryChange(String(land.id), { totalBags: 0, totalCost: 0, totalKg: 0 });
      return;
    }

    setIsOpen(true);
    if (hasLoaded) {
      onLandSummaryChange(String(land.id), currentSummary);
      return;
    }
    await fetchRecommendations();
  };

const handleSelectorChange = (summary: { totalBags: number; totalCost: number; totalKg: number; selectedItems?: any[] }) => {
  const updatedSummary = { ...summary, rawItems: summary.selectedItems || recommendations };
  setCurrentSummary(updatedSummary);
  onLandSummaryChange(String(land.id), updatedSummary);
};

  const activeMeta = recommendations.find((item) => item.analysis_meta)?.analysis_meta;

  return (
    <div className={`w-full border rounded-lg p-5 transition-all duration-200 ${isOpen ? "border-emerald-500 bg-white shadow-md" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"}`}>
      
     {/* Header Lahan */}
    <div className="flex justify-between items-center cursor-pointer select-none" onClick={togglePrediction}>
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center text-lg shadow-sm">
          <FaMapMarkedAlt className="w-5 h-5" />
        </div>
        <div>
          <h5 className="font-bold text-sm text-gray-800">{land.land_name}</h5>
          
          <p className="text-xs text-gray-500 font-medium">
    {/* Menggunakan village dari props jika tersedia, jika tidak baru cari di land.village */}
    Desa {village?.name || land.village?.name || "-"} 
    <span className="text-gray-400 font-normal ml-2">
      ({village?.meta?.lat || land.village?.meta?.lat || land.center_latitude || "0"}, {village?.meta?.long || land.village?.meta?.long || land.center_longitude || "0"})
    </span>
  </p>
          
        </div>
      </div>
      <div className="text-gray-400 hover:text-emerald-600 transition-colors">
        {isOpen ? <FaChevronUp className="w-4 h-4 text-emerald-600" /> : <FaChevronDown className="w-4 h-4" />}
      </div>
    </div>

      {error && (
        <div className="mt-3 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
          <FaExclamationTriangle className="shrink-0 text-sm" />
          <span>{error}</span>
        </div>
      )}

      {/* Konten Hasil Prediksi */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-xs text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent"></div>
              <span>Menganalisis Parameter Geografis & Mengkalkulasi Dosis ML Engine... 🤖</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">Tidak ada rekomendasi pupuk yang tersedia.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
              
              {/* KOLOM KIRI */}
              <div className="lg:col-span-8 space-y-4">
                <FertilizerItemSelector 
                  recommendations={recommendations} 
                  onSelectionChange={handleSelectorChange}
                />
              </div>

              {/* KOLOM KANAN */}
              <div className="lg:col-span-4 w-full">
                {activeMeta ? (
                  <div className="sticky top-4 bg-gray-50/60 border border-gray-200/80 p-4 rounded-lg text-[11px] space-y-2.5 shadow-sm">
                    <p className="font-bold border-b pb-2 mb-2 text-emerald-800 flex items-center gap-2">
                      <FaChartBar className="text-sm" />
                      <span>Parameter Analisis AI</span>
                    </p>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Komoditas:</span> <span className="font-bold text-gray-700">{activeMeta.komoditas}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Luas Lahan:</span> <span className="font-semibold text-gray-700">{activeMeta.luas_lahan}</span></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Fase Tanam:</span> 
                      <span className="font-semibold text-orange-700 bg-orange-50/80 px-2 py-0.5 rounded border border-orange-100">{activeMeta.fase_tanam}</span>
                    </div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Suhu / Lembap:</span> <span className="font-semibold text-gray-700">{activeMeta.suhu || "-"} / {activeMeta.kelembapan || "-"}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Curah Hujan:</span> <span className="font-semibold text-gray-700">{activeMeta.curah_hujan || "-"}</span></div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-[11px] text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                    Metadata analisis tidak tersedia.
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}