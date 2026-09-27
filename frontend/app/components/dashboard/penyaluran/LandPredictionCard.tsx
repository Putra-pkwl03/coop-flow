"use client";

import { useState, useEffect } from "react";
import { Land } from "@/app/types/farmer";
import api from "@/app/lib/axios";
import FertilizerItemSelector, { SelectedBagItem } from "./FertilizerItemSelector";
import { FaMapMarkedAlt, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaChartBar } from "react-icons/fa";

export interface FertilizerAnalysisMeta {
  luas_lahan: string;
  komoditas: string;
  fase_tanam: string;
  suhu?: string;
  kelembapan?: string;
  curah_hujan?: string;
  ndvi?: number | string;        // Sesuai key dari Backend Laravel
  ndvi_value?: number | string;  // Fallback alternatif
  ndvi_category?: string;
}

export interface CustomFertilizerItem {
  id: string | null;
  fertilizer_id?: number | null;
  fertilizer_code: string;
  nama: string;
  fungsi: string;
  price_per_kg: number;
  harga_per_karung: number;
  total_recommended_kg: number;
  jumlah_karung: number;
  packaging_size_kg: number;
  original_recommended_kg: number;
  original_recommended_bags: number;
  image_url: string | null;
  formatted_text?: string;
  is_ml?: boolean;
  analysis_meta?: FertilizerAnalysisMeta;
}

interface Village {
  name: string;
  meta?: {
    lat?: string;
    long?: string;
  };
}

export interface CustomizedBagOutput {
  bagKey: string;
  fertilizer_code: string;
  nama: string;
  weightKg: number;
  price_per_kg: number;
  subtotal: number;
  isChecked: boolean;
  image_url: string | null;
  fertilizer_id?: number; 
}

interface LandPredictionCardProps {
  land: Land;
  village?: Village;
  onLandSummaryChange: (
    landId: string, 
    summary: { 
      totalBags: number; 
      totalCost: number; 
      totalKg: number; 
      rawItems: CustomFertilizerItem[]; 
      customizedBags?: CustomizedBagOutput[]; 
    }
  ) => void;
  initialCustomBags?: CustomizedBagOutput[];
  initialSummary?: {
    totalBags: number;
    totalCost: number;
    totalKg: number;
  };
}

// Helper untuk generate kategori NDVI dari skor numerik
const getNdviCategoryLabel = (score?: number | string | null): string => {
  if (score === null || score === undefined || score === "") return "";
  const num = typeof score === "string" ? parseFloat(score) : score;
  if (isNaN(num)) return "";
  
  if (num >= 0.6) return "Sangat Baik";
  if (num >= 0.4) return "Normal / Sedang";
  if (num >= 0.2) return "Rendah";
  return "Kritis";
};

export default function LandPredictionCard({ 
  land, 
  village, 
  onLandSummaryChange,
  initialCustomBags,
  initialSummary
}: LandPredictionCardProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<CustomFertilizerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentSummary, setCurrentSummary] = useState({ 
    totalBags: initialSummary?.totalBags || 0, 
    totalCost: initialSummary?.totalCost || 0, 
    totalKg: initialSummary?.totalKg || 0 
  });
  const [customBags, setCustomBags] = useState<CustomizedBagOutput[]>(initialCustomBags || []);

  useEffect(() => {
    if (initialSummary) {
      setCurrentSummary(initialSummary);
    }
    if (initialCustomBags) {
      setCustomBags(initialCustomBags);
    }
  }, [initialSummary, initialCustomBags]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/farmers/lands/${land.id}/fertilizer-recommendation`);
      const results: CustomFertilizerItem[] = response.data?.data?.recommendations || [];
      setRecommendations(results);
      setHasLoaded(true);
      
      if (initialSummary && initialCustomBags && initialCustomBags.length > 0) {
        onLandSummaryChange(String(land.id), {
          ...initialSummary,
          rawItems: results,
          customizedBags: initialCustomBags
        });
      } else {
        const activeItem = results[0];
        if (activeItem) {
          const initialBags = activeItem.jumlah_karung || 1;
          const initialKg = (activeItem.packaging_size_kg || 50) * initialBags;
          const initialCost = Math.round(activeItem.price_per_kg * initialKg);
          
          const defaultSummary = { totalBags: initialBags, totalCost: initialCost, totalKg: initialKg };
          setCurrentSummary(defaultSummary);
          
          const defaultFertId = activeItem.fertilizer_id || (activeItem as any).fertilizer?.id || null;

          const defaultCustomBags: CustomizedBagOutput[] = Array.from({ length: initialBags }).map((_, idx) => ({
            bagKey: `bag-${idx + 1}`,
            fertilizer_code: activeItem.fertilizer_code,
            nama: activeItem.nama,
            weightKg: activeItem.packaging_size_kg || 50,
            price_per_kg: activeItem.price_per_kg,
            subtotal: Math.round(activeItem.price_per_kg * (activeItem.packaging_size_kg || 50)),
            isChecked: true,
            image_url: activeItem.image_url || (activeItem as any).image || null,
            fertilizer_id: defaultFertId && !isNaN(Number(defaultFertId)) ? Number(defaultFertId) : undefined 
          }));
          setCustomBags(defaultCustomBags);
          
          onLandSummaryChange(String(land.id), { 
            ...defaultSummary, 
            rawItems: results,
            customizedBags: defaultCustomBags
          });
        }
      }
    } catch (err: any) {
      console.error(`Gagal mendapatkan rekomendasi untuk lahan ID ${land.id}:`, err);
      setError(err.response?.data?.message || "Gagal memproses prediksi.");
      onLandSummaryChange(String(land.id), { totalBags: 0, totalCost: 0, totalKg: 0, rawItems: [], customizedBags: [] });
    } finally {
      setLoading(false);
    }
  };

  const togglePrediction = async () => {
    if (isOpen) {
      setIsOpen(false);
      onLandSummaryChange(String(land.id), { totalBags: 0, totalCost: 0, totalKg: 0, rawItems: [], customizedBags: [] });
      return;
    }

    setIsOpen(true);
    if (hasLoaded) {
      onLandSummaryChange(String(land.id), { 
        ...currentSummary, 
        rawItems: recommendations,
        customizedBags: customBags
      });
      return;
    }
    await fetchRecommendations();
  };

  const handleSelectorChange = (summary: { 
    totalBags: number; 
    totalCost: number; 
    totalKg: number;
    selectedItems: SelectedBagItem[];
  }) => {
    const formattedBags: CustomizedBagOutput[] = summary.selectedItems.map(item => {
      const parentFertId = item.details.fertilizer_id || (item.details as any).fertilizer?.id || null;
      
      return {
        bagKey: item.bagKey,
        fertilizer_code: item.fertilizerCode,
        nama: item.details.nama,
        weightKg: item.weightKg,
        price_per_kg: item.details.price_per_kg,
        subtotal: Math.round(item.details.price_per_kg * item.weightKg),
        isChecked: item.isChecked,
        image_url: item.details.image_url || (item.details as any).image || null,
        packaging_size_kg: item.details.packaging_size_kg || 50,
        fertilizer_id: parentFertId && !isNaN(Number(parentFertId)) ? Number(parentFertId) : undefined
      };
    });

    setCurrentSummary({
      totalBags: summary.totalBags,
      totalCost: summary.totalCost,
      totalKg: summary.totalKg
    });
    setCustomBags(formattedBags);

    onLandSummaryChange(String(land.id), { 
      totalBags: summary.totalBags,
      totalCost: summary.totalCost,
      totalKg: summary.totalKg,
      rawItems: recommendations,
      customizedBags: formattedBags
    });
  };

  // Mengambil meta dari rekomendasi
  const rawMeta = recommendations.find((item) => item.analysis_meta)?.analysis_meta;

  // Normalisasi data meta agar mendukung penamaan BE ("ndvi") & FE ("ndvi_value")
  const activeMeta = rawMeta ? {
    ...rawMeta,
    ndviDisplayValue: rawMeta.ndvi ?? rawMeta.ndvi_value ?? (land as any).current_ndvi ?? null,
    ndviDisplayCategory: rawMeta.ndvi_category || getNdviCategoryLabel(rawMeta.ndvi ?? rawMeta.ndvi_value ?? (land as any).current_ndvi)
  } : null;

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
                    
                    {/* TAMPILKAN NDVI DISINI */}
                    {activeMeta.ndviDisplayValue !== null && activeMeta.ndviDisplayValue !== undefined && (
                      <div className="flex justify-between items-center border-t pt-2 mt-2">
                        <span className="text-gray-500 font-medium">Indeks NDVI:</span> 
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {activeMeta.ndviDisplayValue} {activeMeta.ndviDisplayCategory ? `(${activeMeta.ndviDisplayCategory})` : ""}
                        </span>
                      </div>
                    )}
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