"use client";

import { useState, useEffect } from "react";
import { CustomFertilizerItem } from "./LandPredictionCard";
import FertilizerSwapModal from "./FertilizerSwapModal"; 
import { FaLightbulb, FaBox, FaPlus, FaMinus, FaExchangeAlt, FaCheck, FaShoppingBag } from "react-icons/fa";

interface FertilizerItemSelectorProps {
  recommendations: CustomFertilizerItem[];
  onSelectionChange: (summary: { totalBags: number; totalCost: number; totalKg: number }) => void;
}

interface BagState {
  key: string;      
  index: number;       
  isChecked: boolean;
  selectedType: string; 
  weightKg: number;    
  customDetails?: CustomFertilizerItem; 
}

export default function FertilizerItemSelector({ recommendations, onSelectionChange }: FertilizerItemSelectorProps) {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [bags, setBags] = useState<BagState[]>([]);
  const [targetBagKey, setTargetBagKey] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const currentActiveItem = recommendations[activeItemIndex];

  const activeBag = bags.find(b => b.key === targetBagKey);
  const isModalOpen = targetBagKey !== null;
  const targetBagIndex = activeBag ? activeBag.index : 1;

  const getFertilizerDetails = (bag: BagState): CustomFertilizerItem => {
    if (bag.customDetails) return bag.customDetails;
    const match = recommendations.find(item => item.fertilizer_code?.toLowerCase() === bag.selectedType.toLowerCase());
    return match || currentActiveItem;
  };

  const getSummary = (currentBags: BagState[]) => {
    let totalCostChecked = 0;
    let totalBagsChecked = 0;
    let totalKgChecked = 0;

    currentBags.forEach(bag => {
      if (bag.isChecked) {
        const details = getFertilizerDetails(bag);
        const actualBagPrice = Math.round(details.price_per_kg * bag.weightKg);

        totalCostChecked += actualBagPrice;
        totalBagsChecked += 1;
        totalKgChecked += bag.weightKg;
      }
    });

    return { totalBags: totalBagsChecked, totalCost: totalCostChecked, totalKg: totalKgChecked };
  };

  useEffect(() => {
    if (currentActiveItem) {
      const initialBagsCount = currentActiveItem.jumlah_karung || 1;
      const cleanName = currentActiveItem.fertilizer_code || "NPK"; 
      const weightPerBag = currentActiveItem.packaging_size_kg || 50;

      const initialBags: BagState[] = Array.from({ length: initialBagsCount }).map((_, idx) => ({
        key: `bag-${idx + 1}`,
        index: idx + 1,
        isChecked: true,
        selectedType: cleanName,
        weightKg: weightPerBag,
        customDetails: currentActiveItem, 
      }));

      setBags(initialBags);
      onSelectionChange(getSummary(initialBags));
    }
  }, [activeItemIndex, recommendations]);

  const handleToggleBag = (key: string) => {
    const updated = bags.map(bag => bag.key === key ? { ...bag, isChecked: !bag.isChecked } : bag);
    setBags(updated);
    onSelectionChange(getSummary(updated));
  };

  const handleSwapFertilizerType = (bagKey: string, fertilizerItem: CustomFertilizerItem) => {
    const updated = bags.map(bag => {
      if (bag.key === bagKey) {
        return { 
          ...bag, 
          selectedType: fertilizerItem.fertilizer_code,
          weightKg: fertilizerItem.packaging_size_kg || 50,
          customDetails: fertilizerItem
        };
      }
      return bag;
    });
    setBags(updated);
    setTargetBagKey(null);
    onSelectionChange(getSummary(updated));
  };

  const handleAddBag = () => {
    const defaultType = currentActiveItem?.fertilizer_code || "NPK";
    const defaultWeight = currentActiveItem?.packaging_size_kg || 50;
    
    const newBag: BagState = {
      key: `bag-${Date.now()}-${bags.length + 1}`,
      index: bags.length + 1,
      isChecked: true,
      selectedType: defaultType,
      weightKg: defaultWeight,
      customDetails: currentActiveItem,
    };
    
    const updated = [...bags, newBag];
    setBags(updated);
    onSelectionChange(getSummary(updated));
  };

  const handleRemoveBag = () => {
    if (bags.length <= 1) return;
    const updated = bags.slice(0, -1);
    setBags(updated);
    onSelectionChange(getSummary(updated));
  };

  const handleModifyBagWeight = (key: string, increment: number) => {
    const updated = bags.map(bag => {
      if (bag.key === key) {
        const newWeight = Math.max(5, bag.weightKg + increment);
        return { ...bag, weightKg: newWeight };
      }
      return bag;
    });
    setBags(updated);
    onSelectionChange(getSummary(updated));
  };

  const { totalBags: totalBagsChecked, totalCost: totalCostChecked, totalKg: totalKgChecked } = getSummary(bags);

  return (
    <div className="space-y-4">
      
      {/* 1. HIGHLIGHT DOSIS REKOMENDASI UTAMA */}
      <div className="w-full bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl flex items-start gap-3 text-xs shadow-xs">
        <div className="text-emerald-700 mt-0.5">
          <FaLightbulb className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-emerald-800 block mb-0.5">Rekomendasi Dosis Optimal AI:</span>
          <p className="text-zinc-600 font-medium">
            Kebutuhan Lahan: <span className="text-emerald-700 font-black">{currentActiveItem?.original_recommended_kg} Kg</span> ({currentActiveItem?.nama})
          </p>
        </div>
      </div>

      {/* 2. CONTROLLER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaBox className="text-[9px]" /> Pilih Kapasitas Ukuran Kemasan Karung:
          </span>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => setActiveItemIndex(idx)}
                className={`px-3.5 py-1.5 rounded-full font-bold text-[11px] border transition-all ${
                  activeItemIndex === idx
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                    : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"
                }`}
              >
                📦 Kemasan {item.packaging_size_kg} Kg
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaShoppingBag className="text-[9px]" /> Atur Jumlah Karung Lahan Ini:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRemoveBag}
              disabled={bags.length <= 1}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 disabled:opacity-50 flex items-center justify-center transition-all shadow-xs"
            >
              <FaMinus className="w-2.5 h-2.5" />
            </button>
            <div className="px-4 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-gray-800 min-w-[50px] text-center shadow-xs">
              {bags.length} Karung
            </div>
            <button
              onClick={handleAddBag}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 flex items-center justify-center transition-all shadow-xs"
            >
              <FaPlus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. DAFTAR UNIT KARUNG */}
      <div className="space-y-3 pt-1">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          🛍️ Checklist & Kustomisasi Satuan Karung:
        </p>

        {bags.map((bag) => {
          const matchedDetails = getFertilizerDetails(bag);
          const rawPath = matchedDetails.image_url || (matchedDetails as any).image;
          
          let computedImageUrl = "https://placehold.co/100x120/a7f3d0/065f46?text=PUPUK";
          if (rawPath) {
            if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
              computedImageUrl = rawPath;
            } else {
              const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
              computedImageUrl = `${baseUrl}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
            }
          }

          const actualPrice = Math.round(matchedDetails.price_per_kg * bag.weightKg);

          // Cek apakah karung diubah dari rekomendasi dasar AI
          const isUserModified = 
            !bag.isChecked || 
            bag.weightKg !== matchedDetails.original_recommended_kg / matchedDetails.original_recommended_bags ||
            bag.selectedType !== recommendations[activeItemIndex]?.fertilizer_code;

          return (
            <div key={bag.key} className={`w-full flex flex-col gap-3 p-3 rounded-xl border transition-all text-xs bg-white shadow-2xs ${isUserModified && bag.isChecked ? "border-amber-300 bg-amber-550/5" : "border-gray-250"}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    onClick={() => handleToggleBag(bag.key)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      bag.isChecked ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {bag.isChecked && <FaCheck className="w-2.5 h-2.5" />}
                  </div>

                  <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                    <img 
                      src={computedImageUrl} 
                      alt={matchedDetails.nama} 
                      className="h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/100x120/a7f3d0/065f46?text=PUPUK";
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex flex-col">
                    <span className="font-extrabold text-gray-800 text-[11px] truncate leading-tight flex items-center gap-1.5">
                      {matchedDetails.nama}
                      {isUserModified && bag.isChecked && (
                        <span className="text-[8px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">Pilihan Anda</span>
                      )}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold mt-0.5">
                      Karung Ke-{bag.index}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-extrabold text-gray-900 text-[11px] leading-tight">
                    Rp {actualPrice.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[9px] text-gray-400 font-mono uppercase tracking-tighter">
                    {matchedDetails.fertilizer_code}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-gray-100/70 pt-2">
                <button
                  onClick={() => setTargetBagKey(bag.key)}
                  className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-950 underline flex items-center gap-1 shrink-0 py-1"
                >
                  <FaExchangeAlt className="text-[8px]" /> Ganti Jenis
                </button>

                <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-lg border border-gray-150 shrink-0">
                  <button
                    disabled={!bag.isChecked}
                    onClick={() => handleModifyBagWeight(bag.key, -5)}
                    className="w-5 h-5 rounded bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 flex items-center justify-center text-gray-600 transition-colors shrink-0 shadow-3xs"
                  >
                    <FaMinus className="w-1.5 h-1.5" />
                  </button>
                  <span className="font-bold text-gray-700 text-[10px] w-8 text-center font-mono">
                    {bag.weightKg} Kg
                  </span>
                  <button
                    disabled={!bag.isChecked}
                    onClick={() => handleModifyBagWeight(bag.key, 5)}
                    className="w-5 h-5 rounded bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 flex items-center justify-center text-gray-600 transition-colors shrink-0 shadow-3xs"
                  >
                    <FaPlus className="w-1.5 h-1.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. SUMMARY */}
      <div className="border-t border-dashed border-gray-200 pt-4 mt-3 flex justify-between items-center text-xs">
        <div>
          <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Total Berat Dipilih:</span>
          <span className="font-black text-gray-800 text-sm">
            {totalKgChecked} Kg <span className="text-[10px] font-medium text-gray-400">({totalBagsChecked} Karung)</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Subtotal Biaya Lahan:</span>
          <span className="font-black text-emerald-700 text-base">
            Rp {totalCostChecked.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* 5. MODAL SWAP */}
      <FertilizerSwapModal
        isOpen={isModalOpen}
        onClose={() => setTargetBagKey(null)} 
        bagIndex={targetBagIndex}
        selectedType={activeBag?.selectedType || ""} 
        recommendations={recommendations}
        baseUrl={baseUrl}
        onSelectType={(fertilizerItem) => {
          if (targetBagKey) {
            handleSwapFertilizerType(targetBagKey, fertilizerItem);
          }
        }}
      />

    </div>
  );
}