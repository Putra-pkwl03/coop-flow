'use client';

import React, { useState, useMemo } from 'react';
import { FaUser, FaLayerGroup } from 'react-icons/fa';
import { Farmer } from '@/app/types/farmer';
import FarmerFilterCard from './FarmerFilterCard'; 

interface FarmerListPanelProps {
  farmers: Farmer[];
  searchFarmer: string;
  setSearchFarmer: (val: string) => void;
  selectedFarmer: Farmer | null;
  onSelectFarmer: (farmer: Farmer) => void;
}

export default function FarmerListPanel({
  farmers,
  searchFarmer,
  setSearchFarmer,
  selectedFarmer,
  onSelectFarmer,
}: FarmerListPanelProps) {
  const [selectedPlant, setSelectedPlant] = useState('Semua jenis');
  const [selectedRegion, setSelectedRegion] = useState('Semua Wilayah');
  const [selectedGroup, setSelectedGroup] = useState('Semua Kelompok Tani');

  // 1. Ekstrak data unik dari props farmers secara dinamis menggunakan useMemo
  const { availablePlants, availableVillages, availableGroups } = useMemo(() => {
    const plantsSet = new Set<string>();
    const villagesSet = new Set<string>();
    const groupsSet = new Set<string>();

    farmers.forEach((farmer) => {
      if (farmer.village?.name) {
        villagesSet.add(farmer.village.name);
      }
      if (farmer.farmer_group?.name) {
        groupsSet.add(farmer.farmer_group.name);
      }
      farmer.lands?.forEach((land) => {
        land.plants?.forEach((plant) => {
          if (plant.name) plantsSet.add(plant.name);
        });
      });
    });

    return {
      availablePlants: Array.from(plantsSet),
      availableVillages: Array.from(villagesSet),
      availableGroups: Array.from(groupsSet),
    };
  }, [farmers]);

  // 2. Logic filter gabungan dinamis
  const filteredFarmers = farmers.filter((f) => {
    const matchSearch = 
      f.user?.name?.toLowerCase().includes(searchFarmer.toLowerCase()) || 
      f.village?.name?.toLowerCase().includes(searchFarmer.toLowerCase());
    
    const matchRegion = selectedRegion === 'Semua Wilayah' || f.village?.name === selectedRegion;
    const matchGroup = selectedGroup === 'Semua Kelompok Tani' || f.farmer_group?.name === selectedGroup;
    
    const matchPlant = selectedPlant === 'Semua jenis' || f.lands?.some((land) => 
      land.plants?.some((plant) => plant.name === selectedPlant)
    );

    return matchSearch && matchRegion && matchGroup && matchPlant;
  });

  const handleReset = () => {
    setSearchFarmer('');
    setSelectedPlant('Semua jenis');
    setSelectedRegion('Semua Wilayah');
    setSelectedGroup('Semua Kelompok Tani');
  };

  const handleApply = () => {
    console.log('Filter diterapkan:', { selectedPlant, selectedRegion, selectedGroup });
  };

  return (
    <div className="w-full space-y-4">
      {/* Komponen Form Filter dengan item opsi dinamis */}
      <FarmerFilterCard
        searchFarmer={searchFarmer}
        setSearchFarmer={setSearchFarmer}
        selectedPlant={selectedPlant}
        setSelectedPlant={setSelectedPlant}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        onReset={handleReset}
        onApply={handleApply}
        availablePlants={availablePlants}
        availableVillages={availableVillages}
        availableGroups={availableGroups}
      />

      {/* Daftar List Petani Terfilter */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {filteredFarmers.map((farmer) => {
          const isSelected = selectedFarmer?.id === farmer.id;
          
          // Kalkulasi data statistik jumlah lahan internal
          const totalLands = farmer.lands?.length || 0;
          const unmappedLands = farmer.lands?.filter(l => !l.plants || l.plants.length === 0).length || 0;
          const activeLands = totalLands - unmappedLands;

          return (
            <div
              key={farmer.id}
              onClick={() => onSelectFarmer(farmer)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/10 shadow-md'
                  : 'border-zinc-200 hover:border-zinc-300 shadow-sm'
              }`}
            >
              {/* Sisi Kiri: Profil Petani */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs">
                  <FaUser className="text-xl text-gray-400" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-base font-bold text-zinc-900 truncate">
                    {farmer.user?.name || 'Tanpa Nama'}
                  </h3>
                  <p className="text-xs font-bold text-zinc-400">
                    Desa: <span className="text-zinc-400">{farmer.village?.name || '-'}</span>
                  </p>
                  <p className="text-xs text-zinc-500 font-medium truncate">
                    Kelompok: {farmer.farmer_group?.name || 'Tanpa Kelompok'}
                  </p>
                </div>
              </div>

              {/* Sisi Kanan: Informasi Total Jumlah Lahan (Sblm Di-Klik) */}
              <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 shrink-0">
                {/* Badge Utama Info Total Lahan */}
                <div className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  Total<span>{totalLands} Lahan</span>
                </div>

                {/* Status Peringatan Lahan */}
                <div className="text-right">
                  {unmappedLands > 0 ? (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-extrabold rounded-full block">
                      {unmappedLands} Lahan Belum Ditanami
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full block">
                      Semua Lahan Aktif ({activeLands})
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredFarmers.length === 0 && (
          <p className="text-center text-xs text-zinc-400 py-10 bg-white rounded-2xl border border-dashed border-zinc-200">
            Petani tidak ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}