'use client';

import React, { useState, useMemo } from 'react';
import { FaSearch, FaUserPlus, FaUserAlt, FaFilter, FaSyncAlt } from 'react-icons/fa';

interface Land {
  id?: number;
  land_name: string;
  city_id?: string;
  district_id?: string;
  village_id?: string;
  area: number;
  unit: string;
  status: string;
  current_use?: string;
  soil_type?: string;
  water_source?: string;
  irrigation_type?: string;
  ownership_document?: string;
  location_address?: string;
  polygon_coordinates?: any;
}

interface Farmer {
  id: number;
  user_id?: number;
  farmer_group_id?: number; 
  farmer_group?: { id: number; name: string }; 
  nik: string;
  city_id?: string;     
  district_id?: string; 
  village_id?: string;  
  total_land_area?: number;
  notes?: string;
  user?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  lands?: Land[];    
  name?: string;
  phone?: string;
  address?: string;
  status?: string;
}

interface FarmerListProps {
  farmers: Farmer[];
  selectedFarmer: Farmer | null;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onSelectFarmer: (farmer: Farmer) => void;
  onInitAdd: () => void;
  farmerGroups: Array<{ id: number; name: string }>; 
  districts?: Array<{ code: string; name: string }>;  
  villages?: Array<{ code: string; name: string }>;   
  onSync?: () => void; 
  onFilterRegionChange?: (type: 'district' | 'village', code: string) => void;
}

export default function FarmerList({
  farmers,
  selectedFarmer,
  searchTerm,
  setSearchTerm,
  onSelectFarmer,
  onInitAdd,
  farmerGroups = [],
  districts = [],
  villages = [],
  onSync,
  onFilterRegionChange 
}: FarmerListProps) {
  
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterVillage, setFilterVillage] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  const [tempDistrict, setTempDistrict] = useState('');
  const [tempVillage, setTempVillage] = useState('');
  const [tempGroup, setTempGroup] = useState('');

  const handleApplyFilter = () => {
    setFilterDistrict(tempDistrict);
    setFilterVillage(tempVillage);
    setFilterGroup(tempGroup);
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setTempDistrict('');
    setTempVillage('');
    setTempGroup('');
    setFilterDistrict('');
    setFilterVillage('');
    setFilterGroup('');
    if (onFilterRegionChange) {
      onFilterRegionChange('district', '');
    }
  };

  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const name = f.user?.name || f.name || '';
      const nik = f.nik || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || nik.includes(searchTerm);

      const matchesDistrict = !filterDistrict || 
        f.district_id === filterDistrict || 
        f.lands?.some(l => l.district_id === filterDistrict);

      const matchesVillage = !filterVillage || 
        f.village_id === filterVillage || 
        f.lands?.some(l => l.village_id === filterVillage);

      const matchesGroup = !filterGroup || f.farmer_group_id === Number(filterGroup);

      return matchesSearch && matchesDistrict && matchesVillage && matchesGroup;
    });
  }, [farmers, searchTerm, filterDistrict, filterVillage, filterGroup]);

  return (
    <div className="space-y-4 w-full">
      {/* CARD CONTEXT ALAT PENYARINGAN */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-3.5 w-full box-border">
        
        {/* BARIS 1: INPUT SEARCH DI ATAS */}
        <div className="relative w-full">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
          <input
            type="text"
            placeholder="Cari nama atau NIK petani...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-600 transition box-border"
          />
        </div>

        {/* BARIS 2: DERETAN BUTTON DI BAWAH */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <button 
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`w-full py-1 rounded-lg text-sm font-medium cursor-pointer transition flex items-center justify-center gap-2 whitespace-nowrap border h-[40px] ${
              isFilterOpen || filterDistrict || filterVillage || filterGroup
                ? 'bg-zinc-100 text-zinc-800 border-zinc-300' 
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
            }`}
          >
            <FaFilter className="text-zinc-700 text-xs" />
            <span>Filter</span>
            <span className="text-[10px] text-zinc-400 ml-0.5">▼</span>
          </button>

          <button 
            type="button"
            onClick={onSync}
            className="bg-[#86c295] hover:bg-[#94c286] cursor-pointer text-white w-full py-1 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 whitespace-nowrap h-[40px]"
          >
            <FaSyncAlt className="text-xs" />
            <span>Sinkronisasi</span>
          </button>

          <button 
            type="button"
            onClick={onInitAdd}
            className="bg-[#107349] hover:bg-[#179661] cursor-pointer text-white w-full py-1 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 whitespace-nowrap h-[40px]"
          >
            <FaUserPlus className="text-sm" />
            <span>Tambah</span>
          </button>
        </div>

        {/* CONTAINER PANEL FILTER DROPDOWN */}
        {isFilterOpen && (
          <div className="pt-4 border-t border-zinc-100 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Dropdown 1: Kecamatan */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Kecamatan</label>
                <select 
                  value={tempDistrict} 
                  onChange={(e) => {
                    const code = e.target.value;
                    setTempDistrict(code);
                    setTempVillage(''); 
                    
                    if (onFilterRegionChange) {
                      onFilterRegionChange('district', code);
                    }
                  }}
                  className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Semua Kecamatan</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Desa/Kelurahan */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Desa / Kelurahan</label>
                <select 
                  value={tempVillage} 
                  onChange={(e) => setTempVillage(e.target.value)}
                  className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Semua Desa</option>
                  {villages.map((v) => (
                    <option key={v.code} value={v.code}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Dropdown 3: Kelompok Tani */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Kelompok Tani</label>
                <select 
                  value={tempGroup} 
                  onChange={(e) => setTempGroup(e.target.value)}
                  className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Semua Kelompok</option>
                  {farmerGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Button Aksi Panel */}
            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={handleResetFilter}
                className="px-5 py-2 border border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-700 transition"
              >
                Reset
              </button>
              <button 
                type="button" 
                onClick={handleApplyFilter}
                className="px-5 py-2 bg-[#107349] hover:bg-[#179661] text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Terapkan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DAFTAR DATA PETANI */}
      <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 w-full">
        {filteredFarmers.map((farmer) => {
          const name = farmer.user?.name || farmer.name;
          const groupName = farmer.farmer_group?.name || 'Belum Ada Kelompok Tani';
          const totalLands = farmer.lands?.length || 0;
          
          return (
            <div 
              key={farmer.id}
              onClick={() => onSelectFarmer(farmer)}
              className={`bg-white p-4 rounded-2xl border transition flex flex-col justify-between gap-3 shadow-sm cursor-pointer ${
                selectedFarmer?.id === farmer.id ? 'border-green-500 ring-1 ring-green-500' : 'border-zinc-100 hover:border-zinc-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-zinc-50 text-zinc-500 rounded-lg mt-0.5">
                    <FaUserAlt className="text-sm" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-zinc-800">{name}</h3>
                    <p className="text-xs text-zinc-400 font-medium">NIK: {farmer.nik}</p>
                    <p className="text-xs text-zinc-500 font-bold mt-1 text-blue-600">{groupName}</p>
                    <p className="text-[11px] text-zinc-400 font-medium mt-1">
                      Total Lahan: <span className="text-zinc-700 font-semibold">{totalLands} Lahan</span> ({farmer.total_land_area || 0} Ha)
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  farmer.status === 'Data Belum Tersinkronisasi' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                }`}>
                  {farmer.status || 'Data Sudah Tersinkronisasi'}
                </span>
              </div>
            </div>
          );
        })}
        
        {filteredFarmers.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-6 font-medium">Data Petani tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
}