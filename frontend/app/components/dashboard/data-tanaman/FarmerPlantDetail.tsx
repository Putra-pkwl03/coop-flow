'use client';

import React, { useState } from 'react';
import { 
  FaPlus, 
  FaBoxOpen, 
  FaSearch, 
  FaFilter, 
  FaChevronDown,
  FaChartArea,       // Icon untuk Luas Lahan
  FaFileContract,    // Icon untuk Status Lahan
  FaMapMarkerAlt,    // Icon untuk Lokasi Utama
  FaLayerGroup       // Icon untuk Jumlah Lahan
} from 'react-icons/fa';
import { Farmer, Plant } from '@/app/types/farmer'; 
import AddPlantForm from './AddPlantForm';
import PlantCard from './PlantCard';

interface FarmerPlantDetailProps {
  selectedFarmer: Farmer | null;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  onSavePlant: (newData: { land_id: number; plants: { name: string; planting_date: string }[] }) => void;
  onDeletePlant: (plantId: string | number) => void;
  onDeleteAllPlantsInLand: (landId: number, plantIds: (string | number)[]) => void;
  onUpdatePlant: (plantId: string | number, updatedData: { name: string; planting_date: string; land_id: number }) => void;
}

export default function FarmerPlantDetail({
  selectedFarmer,
  isAdding,
  setIsAdding,
  onSavePlant,
  onDeletePlant,
  onDeleteAllPlantsInLand,
  onUpdatePlant,
}: FarmerPlantDetailProps) {
  
  const [editingPlant, setEditingPlant] = useState<(Plant & { land_id: number }) | null>(null);
  const [searchLocation, setSearchLocation] = useState('');

  if (!selectedFarmer) {
    return (
      <div className="bg-white border border-dashed border-zinc-200 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px] shadow-sm">
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 shadow-inner">
          <FaBoxOpen className="text-3xl" />
        </div>
        <h3 className="text-base font-extrabold text-zinc-800 tracking-tight">Belum Ada Petani Terpilih</h3>
        <p className="text-sm text-zinc-400 font-medium max-w-sm mt-1 leading-relaxed">
          Silakan cari dan pilih nama petani di panel sebelah kiri terlebih dahulu untuk melihat data tanaman.
        </p>
      </div>
    );
  }

  const handleEditClick = (plant: Plant, landId: number) => {
    setEditingPlant({
      id: plant.id,
      name: plant.name,
      planting_date: plant.planting_date,
      created_at: plant.created_at,
      updated_at: plant.updated_at,
      land_id: landId
    });
    setIsAdding(true); 
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingPlant(null);
  };

  const landList = selectedFarmer.lands || [];

  // Meratakan (flatten) data dari semua lahan agar didapatkan satu list tanaman utuh beserta info lahannya
  const allPlants = landList.flatMap((land) => 
    (land.plants || []).map((plant) => ({
      ...plant,
      land_id: land.id,
      land_name: land.land_name,
      land_area: land.area,
      location_address: land.location_address,
      polygon_coordinates: land.polygon_coordinates,
      village_name: selectedFarmer.village?.name
    }))
  );

  // Filter pencarian berdasarkan nama lokasi/lahan sesuai input box di Figma
  const filteredPlants = allPlants.filter(p => 
    p.land_name?.toLowerCase().includes(searchLocation.toLowerCase()) ||
    p.location_address?.toLowerCase().includes(searchLocation.toLowerCase())
  );

  // Hitung total akumulasi luas lahan dari seluruh lahan petani
  const totalHectares = landList.reduce((acc, curr) => acc + (parseFloat(curr.area) || 0), 0);

  // Mengambil status lahan yang unik dari array lands
  const landStatuses = Array.from(new Set(landList.map(land => land.status).filter(Boolean)));
  const displayStatus = landStatuses.length > 0 ? landStatuses.join(', ') : '-';

  // Helper untuk memformat tanggal pendaftaran (created_at dari BE)
  const formatRegistrationDate = (dateString?: string) => {
    if (!dateString) return { date: '-', time: '' };
    try {
      const dateObj = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      const dateFormatted = dateObj.toLocaleDateString('id-ID', options);
      const timeFormatted = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
      return { date: dateFormatted, time: timeFormatted };
    } catch (e) {
      return { date: '-', time: '' };
    }
  };

  const registration = formatRegistrationDate(selectedFarmer.created_at);

  return (
    <div className="space-y-4 w-full">
      {/* 1. Header Profil Atas (Nama Petani, NIK, Kelompok, Tanggal) */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 shrink-0">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-3-8-3z"/></svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900">{selectedFarmer.user?.name || 'Tanpa Nama'}</h2>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">NIK: {selectedFarmer.nik || '-'}</p>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5">Kelompok: {selectedFarmer.farmer_group?.name || '-'}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Tanggal Pendaftaran</p>
          <p className="text-sm font-extrabold text-zinc-800 mt-0.5">
            {registration.date} <span className="text-zinc-500 font-medium ml-1">{registration.time}</span>
          </p>
        </div>
      </div>

      {/* 2. Empat Kotak Ringkasan Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Luas Lahan */}
        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-green-50 border border-cyan-100 text-[#0da132] rounded-xl text-base shrink-0">
            <FaChartArea />
          </div>
          <div>
            <p className="text-[8px] text-zinc-400 font-bold uppercase">Total Luas Lahan</p>
            <p className="text-xs font-bold text-zinc-600">{totalHectares} Hektar</p>
          </div>
        </div>

        {/* Status Lahan */}
        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-green-50 border border-cyan-100 text-[#0da132] rounded-xl text-base shrink-0">
            <FaFileContract />
          </div>
          <div>
            <p className="text-[8px] text-zinc-400 font-bold uppercase">Status Lahan</p>
            <p className="text-xs font-bold text-zinc-600 capitalize">{displayStatus}</p>
          </div>
        </div>

        {/* Lokasi Utama */}
        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-green-50 border border-cyan-100 text-[#0da132] rounded-xl text-base shrink-0">
            <FaMapMarkerAlt />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] text-zinc-400 font-bold uppercase">Lokasi</p>
            <p className="text-xs font-bold text-zinc-600 truncate">{selectedFarmer.village?.name || 'Ds. Sleman'}</p>
          </div>
        </div>

        {/* Jumlah Lahan */}
        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-green-50 border border-cyan-100 text-[#0da132] rounded-xl text-base shrink-0">
            <FaLayerGroup />
          </div>
          <div>
            <p className="text-[8px] text-zinc-400 font-bold uppercase">Jumlah Lahan</p>
            <p className="text-xs font-bold text-zinc-600">{landList.length}</p>
          </div>
        </div>
      </div>

      {/* Tombol Tambah Tanaman */}
      {!isAdding && (
        <div className="flex justify-end">
          <button
            onClick={() => { setEditingPlant(null); setIsAdding(true); }}
            className="bg-[#05643c] hover:bg-[#044e2e] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <FaPlus />
            <span>Tambah Tanaman</span>
          </button>
        </div>
      )}

      {/* Form Dialog */}
      {isAdding && (
        <AddPlantForm
          lands={landList}
          onCancel={handleCancelForm}
          onSave={onSavePlant} 
          editingPlant={editingPlant}
          onUpdate={onUpdatePlant}
        />
      )}

      {/* 3. Container Utama List Tanaman Sesuai Figma */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-4">

        {/* List Baris Tanaman Terintegrasi */}
        <div className="space-y-3">
          {filteredPlants.map((plantItem) => (
            <PlantCard 
              key={plantItem.id}
              plant={plantItem}
              onDeleteSinglePlant={onDeletePlant}
              onEditPlant={handleEditClick}
            />
          ))}

          {/* Fallback Jika Tidak Ada Data Tanaman */}
          {filteredPlants.length === 0 && (
            <div className="text-center py-12 border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">🌱</span>
              <p className="text-xs text-zinc-400 font-bold">Belum ada komoditas tanaman terdaftar di lahan manapun</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}