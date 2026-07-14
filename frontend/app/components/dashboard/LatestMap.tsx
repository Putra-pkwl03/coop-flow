'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import api from '../../lib/axios';

interface Plant {
  id: number;
  land_id: number;
  name: string;
}

interface Land {
  id: number;
  farmer_id: number;
  land_name: string;
  area: string | number;
  location_address: string | null;
  polygon_coordinates: [number, number][];
  plants?: Plant[];
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
}

interface Farmer {
  id: number;
  user_id: number;
  farmer_group_id: number;
  nik: string | null;
  total_land_area: string | number;
  notes: string | null;
  user?: User;
  lands?: Land[];
}

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

  useEffect(() => {
    const fetchFarmerLands = async () => {
      try {
        const response = await api.get<ApiResponse>('/farmers');
        if (response.data && response.data.success) {
          const dataFarmers = response.data.data;
          setFarmers(dataFarmers);
          setTotalFarmers(dataFarmers.length);
          
          const count = dataFarmers.reduce((acc, farmer) => acc + (farmer.lands?.length || 0), 0);
          setTotalLands(count);

          const area = dataFarmers.reduce((acc, farmer) => {
            const farmerLandsArea = farmer.lands?.reduce((landAcc, land) => landAcc + parseFloat(land.area as string || '0'), 0) || 0;
            return acc + farmerLandsArea;
          }, 0);
          setTotalArea(parseFloat(area.toFixed(2)));
        }
      } catch (error) {
        console.error("Gagal memuat peta data lahan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerLands();
  }, []);

  return (
    <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between h-full">
      <div>
       <div className="flex justify-between items-center pb-3">
  <h3 className="text-sm font-bold text-zinc-800">Peta Lahan Terbaru</h3>
  <div className="text-[10px] text-zinc-800 font-medium flex items-center space-x-2">
    <span>+ Min: 1x</span>
    <span className="text-zinc-200">•</span>
    <span>- Maks: 22x</span>
  </div>
</div>
        
        <div className="h-115 rounded-2xl relative overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner z-0">
          {!loading && <MapComponent farmers={farmers} />}
        </div>
      </div>

      {/* FOOTER INFORMASI */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 mt-4 pt-3 border-t border-zinc-100">
        
        {/* Sisi Kiri: Status Lahan (Didekatkan menggunakan flex space-x-4) */}
        <div className="flex items-center space-x-5">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              <span className="text-[10px] font-bold text-zinc-700">Terverifikasi</span>
            </div>
            <p className="text-[11px] font-medium text-zinc-400 pl-3.5">{totalLands} Lahan</p>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span className="text-[10px] font-bold text-zinc-700">Menunggu</span>
            </div>
            <p className="text-[11px] font-medium text-zinc-400 pl-3.5">0 Lahan</p>
          </div>
        </div>

        {/* Sisi Kanan: Info Tambahan Berdasarkan Data API */}
        <div className="flex items-center space-x-5 text-right">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Total Petani</span>
            <p className="text-[12px] font-bold text-zinc-800">{totalFarmers} Orang</p>
          </div>
          <div className="border-l border-zinc-200 h-6 hidden sm:block" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Luas Wilayah</span>
            <p className="text-[12px] font-bold text-zinc-800">{totalArea} Ha</p>
          </div>
        </div>

      </div>
    </div>
  );
}