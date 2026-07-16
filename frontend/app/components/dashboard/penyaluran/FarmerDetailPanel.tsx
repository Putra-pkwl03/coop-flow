"use client";

import { useState } from "react";
import { Farmer } from "@/app/types/farmer";
import { FiUser, FiMap, FiActivity } from "react-icons/fi"; 
import LandPredictionCard from "@/app/components/dashboard/penyaluran/LandPredictionCard";

// Tipe data item pupuk yang dilempar ke checkout
interface SelectedFertilizerItem {
  id: string | null;
  nama: string;
  image_url: string | null;
  jumlah_karung: number;
  packaging_size_kg: number;
  total_kg: number;
  total_cost: number;
}

interface FarmerDetailPanelProps {
  farmer: Farmer;
  // Perubahan parameter: Mengirim data detail item terkalkulasi
  onCheckout: (summary: { totalCost: number; items: SelectedFertilizerItem[] }) => void;
}

export default function FarmerDetailPanel({ farmer, onCheckout }: FarmerDetailPanelProps) {
  // State menampung list item pupuk per lahan
  const [landsSummary, setLandsSummary] = useState<Record<string, { totalBags: number; totalCost: number; totalKg: number; rawItems?: any[] }>>({});

  const handleLandSummaryChange = (landId: string, summary: any) => {
    setLandsSummary((prev) => ({
      ...prev,
      [landId]: summary,
    }));
  };

  // Hitung total biaya keseluruhan
  const grandTotalCost = Object.values(landsSummary).reduce((acc, curr) => acc + curr.totalCost, 0);

  // Satukan & akumulasikan produk sejenis dari lahan-lahan yang berbeda
  const getAggregatedItems = (): SelectedFertilizerItem[] => {
    const aggMap: Record<string, SelectedFertilizerItem> = {};

    Object.values(landsSummary).forEach((landSummary) => {
      if (landSummary.rawItems) {
        landSummary.rawItems.forEach((item) => {
          const key = item.fertilizer_code || item.nama;
          if (aggMap[key]) {
            aggMap[key].jumlah_karung += item.jumlah_karung;
            aggMap[key].total_kg += item.jumlah_karung * item.packaging_size_kg;
            aggMap[key].total_cost += Math.round(item.price_per_kg * (item.jumlah_karung * item.packaging_size_kg));
          } else {
            aggMap[key] = {
              id: item.id,
              nama: item.nama,
              image_url: item.image_url,
              jumlah_karung: item.jumlah_karung,
              packaging_size_kg: item.packaging_size_kg || 50,
              total_kg: item.jumlah_karung * (item.packaging_size_kg || 50),
              total_cost: Math.round(item.price_per_kg * (item.jumlah_karung * (item.packaging_size_kg || 50))),
            };
          }
        });
      }
    });

    return Object.values(aggMap);
  };

  const aggregatedItems = getAggregatedItems();

  // Helper ringkasan text display di footer
  const renderFooterQtyText = () => {
    if (aggregatedItems.length === 0) return "0 Karung";
    return aggregatedItems.map(item => {
      const wholeBags = Math.floor(item.jumlah_karung);
      const remainderKg = Math.round((item.jumlah_karung - wholeBags) * item.packaging_size_kg);
      
      let text = "";
      if (wholeBags > 0) text += `${wholeBags} Karung`;
      if (remainderKg > 0) text += `${wholeBags > 0 ? " + " : ""}${remainderKg} Kg Eceran`;
      if (wholeBags === 0 && remainderKg === 0) text = "0 Karung";
      
      return `${text} (${item.nama})`;
    }).join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Container Utama Profil & List Informasi Lahan */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6 border-b border-gray-100 pb-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl text-emerald-600 flex-shrink-0">
            <FiUser className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Alamat</span>
              <span className="font-medium text-gray-700 block truncate max-w-[150px]">{farmer.user.address}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Total Kepemilikan</span>
              <span className="font-bold text-gray-800">{farmer.lands.length} Lahan</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Total Luas Area</span>
              <span className="font-bold text-gray-800">{farmer.total_land_area} Hektar</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Terdaftar Sejak</span>
              <span className="font-medium text-gray-700">
                {new Date(farmer.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><FiMap className="text-emerald-600" /> Informasi Detail Lahan</h4>
          <div className={`grid grid-cols-1 gap-4 ${farmer.lands.length > 1 ? "md:grid-cols-2" : ""}`}>
            {farmer.lands.map((land) => (
              <div key={land.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
                <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-3">
                  <div>
                    <h5 className="font-bold text-sm text-gray-800">{land.land_name}</h5>
                    <p className="text-[11px] text-gray-400">Hak: <span className="font-medium text-gray-600">{land.status}</span></p>
                  </div>
                  <span className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">{land.area} Ha</span>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-100/60 rounded-xl p-3 text-[11px]">
                  <h6 className="font-bold text-emerald-950 mb-1 flex items-center gap-1"><FiActivity className="text-emerald-700" /> Vegetasi</h6>
                  {land.plants?.[0] ? <span className="font-bold text-emerald-900 capitalize">{land.plants[0].name} ({land.plants[0].current_phase || "Vegetatif"})</span> : <span>Tidak ada vegetasi</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Prediksi per Lahan */}
      <div>
        <h4 className="text-sm font-bold text-gray-800">Prediksi Kebutuhan Pupuk</h4>
        <div className="grid grid-cols-1 gap-4 mt-3">
          {farmer.lands.map((land) => (
            <LandPredictionCard 
              key={land.id} 
              land={land} 
              village={farmer.village}
              onLandSummaryChange={handleLandSummaryChange}
            />
          ))}
        </div>
      </div>

      {/* Footer Summary & Action */}
      <div className="flex justify-between items-center mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex gap-6 items-center">
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Total Pupuk</span>
            <span className="text-xs font-bold text-emerald-700 block max-w-[280px] truncate">{renderFooterQtyText()}</span>
          </div>
          <div className="border-l pl-4 border-gray-200">
            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Total Estimasi Biaya</span>
            <span className="text-base font-black text-gray-800">Rp {grandTotalCost.toLocaleString("id-ID")}</span>
          </div>
        </div>
        
        <button 
          disabled={aggregatedItems.length === 0}
          onClick={() => onCheckout({ totalCost: grandTotalCost, items: aggregatedItems })}
          className="bg-emerald-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-900 transition shadow-sm disabled:opacity-50"
        >
          Lanjut Pembayaran
        </button>
      </div>
    </div>
  );
}