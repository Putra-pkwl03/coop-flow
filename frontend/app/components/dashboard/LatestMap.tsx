'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import api from '../../lib/axios';
import { db, Farmer } from '../../lib/db';



interface ApiResponse {
  success: boolean;
  data: Farmer[];
}

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs animate-pulse">
      Memuat Peta Citra Satelit...
    </div>
  )
});

export default function LatestMap() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [totalLands, setTotalLands] = useState<number>(0);
  const [totalArea, setTotalArea] = useState<number>(0);
  const [totalFarmers, setTotalFarmers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State Status Koneksi
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Helper untuk memproses kalkulasi angka
  const processFarmersData = (dataFarmers: Farmer[]) => {
    setFarmers(dataFarmers);
    setTotalFarmers(dataFarmers.length);

    const count = dataFarmers.reduce((acc, farmer) => acc + (farmer.lands?.length || 0), 0);
    setTotalLands(count);

    const area = dataFarmers.reduce((acc, farmer) => {
     const farmerLandsArea = farmer.lands?.reduce((landAcc, land) => landAcc + parseFloat(String(land.area || 0)), 0) || 0;
      return acc + farmerLandsArea;
    }, 0);
    setTotalArea(parseFloat(area.toFixed(2)));
  };

  const fetchFarmerLands = async () => {
    setLoading(true);

    // Cek koneksi nyata
    const onlineStatus = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOnline(onlineStatus);

    if (onlineStatus) {
      try {
        const response = await api.get<ApiResponse>('/farmers');
        if (response.data && response.data.success) {
          const dataFarmers = response.data.data;
          processFarmersData(dataFarmers);

          // Simpan ke IndexedDB sebagai cache lokal untuk mode offline
          if (db?.farmers) {
            await db.farmers.clear();
            await db.farmers.bulkPut(dataFarmers);
          }
        }
      } catch (error) {
        console.error("Gagal fetching online, mencoba ambil data lokal:", error);
        await loadFromLocalCache();
      } finally {
        setLoading(false);
      }
    } else {
      // Mode Offline: Ambil dari Cache IndexedDB
      await loadFromLocalCache();
      setLoading(false);
    }
  };

  const loadFromLocalCache = async () => {
    try {
      if (db?.farmers) {
        const localFarmers = await db.farmers.toArray();
        if (localFarmers.length > 0) {
          processFarmersData(localFarmers);
          console.log("[Offline] Data berhasil dimuat dari IndexedDB");
        }
      }
    } catch (err) {
      console.error("Gagal membaca cache lokal:", err);
    }
  };

  useEffect(() => {
    fetchFarmerLands();

    // Event Listener untuk mendeteksi perubahan jaringan secara real-time
    const handleOnline = () => {
      setIsOnline(true);
      fetchFarmerLands(); // Refresh data saat koneksi kembali
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between h-[500px]">
      <div>
        <div className="flex justify-between items-center pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-zinc-800">
                Peta Sebaran Lahan & Kebutuhan
              </h3>

              {/* INDIKATOR STATUS ONLINE / OFFLINE */}
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              Visualisasi klaster spasial terdaftar
            </p>
          </div>

          <div className="text-[10px] text-zinc-800 font-medium flex items-center space-x-2">
            <span>+ Min: 1x</span>
            <span className="text-zinc-200">•</span>
            <span>- Maks: 22x</span>
          </div>
        </div>

        <div className="h-90 rounded-2xl relative overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner z-0">
          {!loading && <MapComponent farmers={farmers} />}
        </div>
      </div>

      {/* FOOTER INFORMASI */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 mt-4 pt-3 border-t border-zinc-100">
        {/* Sisi Kiri: Status Lahan */}
        <div className="flex items-center space-x-5">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              <span className="text-[10px] font-bold text-zinc-700">
                Terverifikasi
              </span>
            </div>
            <p className="text-[11px] font-medium text-zinc-400 pl-3.5">
              {totalLands} Lahan
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span className="text-[10px] font-bold text-zinc-700">
                Menunggu
              </span>
            </div>
            <p className="text-[11px] font-medium text-zinc-400 pl-3.5">
              0 Lahan
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Info Tambahan */}
        <div className="flex items-center space-x-5 text-right">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">
              Total Petani
            </span>
            <p className="text-[12px] font-bold text-zinc-800">
              {totalFarmers} Orang
            </p>
          </div>
          <div className="border-l border-zinc-200 h-6 hidden sm:block" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">
              Luas Wilayah
            </span>
            <p className="text-[12px] font-bold text-zinc-800">
              {totalArea} Ha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}