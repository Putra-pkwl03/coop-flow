'use client';

import React, { useState, useMemo } from 'react';
import { Farmer, Land } from '@/app/dashboard/admin-lapangan/validasi-lahan/page'; 
import ValidationFilterForm from './ValidationFilterForm';
import FarmerLandCard from './FarmerLandCard';

interface ValidationFarmerListProps {
  farmers: Farmer[];
  selectedFarmer: Farmer | null;
  selectedLand: Land | null;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onSelectLand: (farmer: Farmer, land: Land) => void;
  activeTab: 'belum' | 'sudah';
  setActiveTab: (tab: 'belum' | 'sudah') => void;
  onSync?: () => void;
}

export default function ValidationFarmerList({
  farmers,
  selectedFarmer,
  selectedLand,
  searchTerm,
  setSearchTerm,
  onSelectLand,
  activeTab,
  setActiveTab,
  onSync
}: ValidationFarmerListProps) {
  
  // State filter yang telah diaplikasikan
  const [appliedFilters, setAppliedFilters] = useState({
    status: 'Semua Status',
    wilayah: '', 
    group: '',
    startDate: '',
    endDate: ''
  });

  // Proses Filter Data Gabungan (Search + Dropdown Filter)
  const filteredFarmers = useMemo(() => {
    return farmers.map(farmer => {
      const filteredLands = farmer.lands?.filter(land => {
        if (selectedLand && selectedLand.id === land.id && selectedFarmer && selectedFarmer.id === farmer.id) {
          return true;
        }

        const hasMap = land.polygon_coordinates && land.polygon_coordinates.length > 0;
        
        if (appliedFilters.status === 'Belum Dimapping') return !hasMap;
        if (appliedFilters.status === 'Sudah Dimapping') return hasMap;

        return activeTab === 'sudah' ? hasMap : !hasMap;
      }) || [];

      return { ...farmer, lands: filteredLands };
    }).filter(f => {
      const isCurrentActiveFarmer = selectedFarmer && selectedFarmer.id === f.id;
      if (f.lands.length === 0 && !isCurrentActiveFarmer) return true;
      
      const name = f.user?.name || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || f.nik.includes(searchTerm);
      const matchesGroup = !appliedFilters.group || f.farmer_group?.id === Number(appliedFilters.group);
      
      // PERBAIKAN DI SINI: Mencocokkan filter wilayah dengan kode desa dinamis dari objek village
      const farmerVillageCode = f.village?.code?.trim() || f.village_id?.trim() || '';
      const matchesWilayah = !appliedFilters.wilayah || farmerVillageCode === appliedFilters.wilayah.trim();

      return matchesSearch && matchesGroup && matchesWilayah;
    });
  }, [farmers, searchTerm, activeTab, appliedFilters, selectedFarmer, selectedLand]);

  // Ekstrak daftar unik kelompok tani untuk opsi dropdown filter
  const uniqueGroups = useMemo(() => {
    const groups: { id: number; name: string }[] = [];
    farmers.forEach(f => {
      if (f.farmer_group && !groups.some(g => g.id === f.farmer_group?.id)) {
        groups.push({ id: f.farmer_group.id, name: f.farmer_group.name });
      }
    });
    return groups;
  }, [farmers]);

  return (
    <div className="space-y-4 w-full">
      {/* COMPONENT 1: FORM FILTER PENCARIAN */}
      <ValidationFilterForm 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        uniqueGroups={uniqueGroups}
        farmers={farmers} // <-- PERBAIKAN: Menambahkan props farmers di sini
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onApplyFilters={setAppliedFilters}
        onSync={onSync}
      />

      {/* STATUS PREFERENCE MODE */}
      <div className="flex text-[11px] font-bold text-zinc-400 px-1 gap-1">
        <span>Menampilkan mode:</span>
        <span className={activeTab === 'sudah' ? 'text-green-600' : 'text-amber-600'}>
          {activeTab === 'sudah' ? 'Lahan Sudah Dimapping' : 'Lahan Belum Dimapping'}
        </span>
      </div>

      {/* COMPONENT 2: LIST CARDS DATA PETANI */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredFarmers.length > 0 ? (
          filteredFarmers.map((farmer) => (
            <FarmerLandCard 
              key={farmer.id}
              farmer={farmer}
              selectedFarmer={selectedFarmer}
              selectedLand={selectedLand}
              activeTab={activeTab}
              onSelectLand={onSelectLand}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-white border border-dashed rounded-2xl text-zinc-400 text-xs font-medium">
            Tidak ada data lahan yang sesuai filter penyaringan.
          </div>
        )}
      </div>
    </div>
  );
}