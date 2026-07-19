"use client";

import { useState, useEffect } from "react";
import { Farmer } from "@/app/types/farmer";
import FarmerList from "@/app/components/dashboard/penyaluran/FarmerList";
import FarmerDetailPanel, { LandSummary } from "@/app/components/dashboard/penyaluran/FarmerDetailPanel";
import TransactionPanel, { SelectedFertilizerItem } from "@/app/components/dashboard/penyaluran/TransactionPanel";
import api from "@/app/lib/axios"; 

function PenyaluranSkeleton() {
  return (
    <div className="animate-pulse w-full">
      <div className="mb-6 space-y-2">
        <div className="h-7 bg-gray-200 rounded-lg w-48"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-64"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start h-[calc(100vh-180px)] min-h-137.5">
        <div className="lg:col-span-6 flex flex-col gap-4 w-full h-full">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-sm shrink-0">
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-8 bg-gray-200 rounded-lg"></div>
              <div className="h-8 bg-gray-200 rounded-lg"></div>
              <div className="h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          <div className="space-y-3 overflow-hidden flex-1 bg-white/40 p-1 rounded-xl">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-full space-y-6">
          <div className="flex items-center gap-4 border-b pb-5 shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full shrink-0"></div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-1.5"><div className="h-3 bg-gray-200 rounded w-12"></div><div className="h-4 bg-gray-200 rounded w-24"></div></div>
              <div className="space-y-1.5"><div className="h-3 bg-gray-200 rounded w-16"></div><div className="h-4 bg-gray-200 rounded w-16"></div></div>
            </div>
          </div>
          <div className="space-y-3 overflow-hidden">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="border border-gray-100 rounded-xl p-5 space-y-4">
              <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-32"></div><div className="h-4 bg-gray-200 rounded w-20"></div></div>
              <div className="h-24 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PenyaluranPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"detail" | "checkout">("detail");
  
  // State land kustomisasi ditaruh di parent ini agar aman dari unmount
  const [landsSummary, setLandsSummary] = useState<Record<string, LandSummary>>({});

const [checkoutData, setCheckoutData] = useState<{
  totalBags: number;
  totalCost: number;
  totalKg: number;
  items: SelectedFertilizerItem[];
}>({ totalBags: 0, totalCost: 0, totalKg: 0, items: [] });

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/farmers"); 
        const farmersData = response.data.data || response.data;
        setFarmers(farmersData);
        if (farmersData.length > 0) {
          setSelectedFarmer(farmersData[0]); 
        }
      } catch (err: any) {
        console.error("Gagal mengambil data petani:", err);
        setError(err.response?.data?.message || "Gagal memuat data petani dari server.");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const handleSelectFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setViewMode("detail"); 
    setLandsSummary({});
  };

  const handleGoToCheckout = (summary: { totalBags: number; totalCost: number; totalKg: number; items: any[] }) => {
    setCheckoutData(summary);
    setViewMode("checkout");
  };

  if (loading) {
    return (
      <div className="bg-gray-50 text-gray-800 w-full p-1">
        <PenyaluranSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 flex items-center justify-center min-h-100">
        <div className="bg-white border border-red-100 rounded-xl p-6 text-center shadow-sm max-w-md">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-md font-bold text-red-600 mt-2">Error</h3>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-emerald-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-800 w-full overflow-hidden -mt-2.5">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#115e59] tracking-tight">Penyaluran</h1>
        <p className="text-xs text-zinc-500 font-medium mt-1">Pilih petani dan salurkan pupuk mereka</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start h-[calc(100vh-180px)] min-h-137.5">
        {/* PANEL KIRI */}
        <div className="lg:col-span-6 flex flex-col w-full h-full overflow-hidden">
          <FarmerList 
            farmers={farmers} 
            selectedId={selectedFarmer?.id || null} 
            onSelectFarmer={handleSelectFarmer} 
          />
        </div>

        {/* PANEL KANAN */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-full overflow-y-auto custom-scrollbar">
          {!selectedFarmer ? (
            <div className="text-center py-12 text-gray-400">Silakan pilih petani di panel kiri.</div>
          ) : viewMode === "checkout" ? (
            <TransactionPanel 
  farmerId={selectedFarmer.id} 
  grandTotalCost={checkoutData.totalCost}
  items={checkoutData.items}
  onBack={() => setViewMode("detail")}
  farmerName={selectedFarmer.user.name}
  farmerAddress={selectedFarmer.user.address || "-"}
  villageName={selectedFarmer.village?.name || "-"}
  onSuccess={() => {
    setViewMode("detail");
    setLandsSummary({});
  }}
/>
          ) : (
            <FarmerDetailPanel 
              farmer={selectedFarmer} 
              landsSummary={landsSummary}
              onLandsSummaryChange={setLandsSummary}
              onCheckout={handleGoToCheckout} 
            />
          )}
        </div>
      </div>
    </div>
  );
}