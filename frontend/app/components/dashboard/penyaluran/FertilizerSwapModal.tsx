"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaSearch, FaRobot, FaBoxes, FaSpinner } from "react-icons/fa";
import { CustomFertilizerItem } from "./LandPredictionCard";
import api from "@/app/lib/axios";

interface FertilizerSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  bagIndex: number;
  selectedType: string;
  recommendations: CustomFertilizerItem[];
  onSelectType: (item: CustomFertilizerItem) => void; 
  baseUrl?: string;
}

export default function FertilizerSwapModal({
  isOpen,
  onClose,
  bagIndex,
  selectedType,
  recommendations,
  onSelectType,
  baseUrl = "http://localhost:8000",
}: FertilizerSwapModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ai" | "all">("ai");
  const [allFertilizers, setAllFertilizers] = useState<CustomFertilizerItem[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === "all" && allFertilizers.length === 0) {
      fetchAllFertilizers();
    }
  }, [isOpen, activeTab]);

  const fetchAllFertilizers = async () => {
    setLoadingAll(true);
    setErrorAll(null);
    try {
      const response = await api.get("/cooperative/fertilizers"); 
      if (response.data && response.data.success) {
        const rawData = response.data.data || [];
        
        // SINKRONISASI SCHEMA: sesuaikan mapping ke tipe CustomFertilizerItem
        const mappedData: CustomFertilizerItem[] = rawData.map((item: any) => {
          const packSize = item.packaging_size_kg || 50;
          const pricePerKg = item.price_per_kg || 3000;
          const defaultBags = item.jumlah_karung || 1;
          const defaultKg = packSize * defaultBags;
          
          return {
            // Pastikan ID diubah menjadi string agar seragam dengan data rekomendasi
            id: item.id ? String(item.id) : null,
            fertilizer_id: item.id ? Number(item.id) : null,
            fertilizer_code: item.fertilizer_code || item.name?.split(' ')[0] || "NPK",
            nama: item.name || `Pupuk ${item.fertilizer_code || 'Custom'}`,
            fungsi: item.fungsi || `Pupuk berkualitas tinggi kemasan ${packSize} Kg.`,
            price_per_kg: pricePerKg,
            // Sesuaikan properti harga menjadi harga_per_karung
            harga_per_karung: item.harga_per_karung || item.harga || (pricePerKg * packSize) || 150000,
            jumlah_karung: defaultBags,
            packaging_size_kg: packSize,
            original_recommended_kg: defaultKg,
            original_recommended_bags: defaultBags,
            image_url: item.image || item.image_url || null,
            is_ml: false
          };
        });

        setAllFertilizers(mappedData);
      } else {
        setErrorAll("Format respons data tidak sesuai.");
      }
    } catch (err: any) {
      console.error("Gagal mengambil master data pupuk:", err);
      setErrorAll("Gagal memuat semua daftar pupuk.");
    } finally {
      setLoadingAll(false);
    }
  };

  if (!isOpen) return null;

  const activeSourceData = activeTab === "ai" ? recommendations : allFertilizers;

  const filteredOptions = activeSourceData.filter((item) =>
    item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.fertilizer_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER MODAL */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-extrabold text-sm text-gray-800">
              Pilih Pupuk Pengganti
            </h3>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
              Mengganti isi untuk Karung Ke-{bagIndex}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-gray-100 bg-gray-50/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeTab === "ai"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <FaRobot className="text-sm" />
            Rekomendasi AI
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeTab === "all"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <FaBoxes className="text-sm" />
            Semua Pupuk (Bebas)
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="px-6 py-4 border-b border-gray-100 flex gap-3 bg-white">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FaSearch className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder={activeTab === "ai" ? "Cari dari rekomendasi..." : "Cari semua jenis pupuk..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* KONTEN GRID */}
        <div className="p-6 overflow-y-auto bg-gray-50/30 flex-1">
          {loadingAll && activeTab === "all" ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs text-gray-400">
              <FaSpinner className="animate-spin text-emerald-600 text-xl" />
              <span>Memuat seluruh katalog pupuk...</span>
            </div>
          ) : errorAll && activeTab === "all" ? (
            <div className="text-center py-12 text-red-500 text-xs font-semibold">
              {errorAll}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-semibold">
              Pupuk tidak ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredOptions.map((item) => {
                const isSelected = selectedType.toLowerCase() === item.fertilizer_code?.toLowerCase();
                
                // Ambil gambar yang bersih
                const rawPath = item.image_url;
                let computedImageUrl = "https://placehold.co/100x120/a7f3d0/065f46?text=PUPUK";
                
                if (rawPath) {
                  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
                    computedImageUrl = rawPath;
                  } else {
                    const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
                    computedImageUrl = `${baseUrl}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
                  }
                }

                // Gunakan properti harga_per_karung sesuai interface terbaru
                const finalPrice = item.harga_per_karung && item.harga_per_karung > 0 ? item.harga_per_karung : 150000;
                const finalWeight = item.packaging_size_kg || 50;
                const calculatedPricePerKg = item.price_per_kg && item.price_per_kg > 0 
                  ? item.price_per_kg 
                  : Math.round(finalPrice / finalWeight);

                return (
                  <div 
                    key={item.id || item.fertilizer_code}
                    className={`bg-white border rounded-xl p-4 flex flex-col justify-between transition-all relative ${
                      isSelected 
                        ? "border-emerald-500 ring-2 ring-emerald-500/10 shadow-md" 
                        : "border-gray-200/80 hover:border-gray-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                        {item.fertilizer_code}
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold font-mono">
                        {finalWeight} Kg
                      </span>
                    </div>

                    <div className="h-28 my-3 flex items-center justify-center p-2">
                      <img 
                        src={computedImageUrl} 
                        alt={item.nama} 
                        className="h-full object-contain drop-shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/100x120/a7f3d0/065f46?text=PUPUK";
                        }}
                      />
                    </div>

                    <div className="space-y-1 text-left mb-4">
                      <h4 className="font-extrabold text-xs text-gray-800 leading-tight">
                        {item.nama}
                      </h4>
                      <p className="text-[9px] text-gray-400 leading-normal font-medium line-clamp-2">
                        {item.fungsi}
                      </p>
                      
                      {/* INFORMASI DETAIL HARGA */}
                      <div className="grid grid-cols-2 gap-1 pt-1.5 text-[9px] border-t border-gray-100">
                        <div>
                          <span className="text-gray-400 block font-medium">Harga / Kg</span>
                          <span className="font-extrabold text-emerald-700">
                            Rp {calculatedPricePerKg.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 block font-medium">Harga Karung</span>
                          <span className="font-bold text-gray-800">
                            Rp {finalPrice.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectType(item)}
                      className="w-full py-2 rounded-lg text-[10px] font-bold tracking-wide transition-all bg-emerald-800 hover:bg-emerald-950 text-white"
                    >
                      {isSelected ? "Terpilih" : "Beli / Pilih"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-155 flex justify-between items-center bg-white text-[10px] text-gray-400 font-semibold">
          <span>
            {activeTab === "ai" ? "Menampilkan rekomendasi kecerdasan buatan" : "Menampilkan seluruh katalog distributor"}
          </span>
          <span className="font-mono tracking-widest">1 / 1</span>
        </div>

      </div>
    </div>
  );
}