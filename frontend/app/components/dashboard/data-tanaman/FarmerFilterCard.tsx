'use client';

import React from 'react';
import { FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';

interface FarmerFilterCardProps {
  searchFarmer: string;
  setSearchFarmer: (val: string) => void;
  selectedPlant: string;
  setSelectedPlant: (val: string) => void;
  selectedRegion: string;
  setSelectedRegion: (val: string) => void;
  selectedGroup: string;
  setSelectedGroup: (val: string) => void;
  onReset: () => void;
  onApply: () => void;
  // Props baru untuk data dinamis
  availablePlants: string[];
  availableVillages: string[];
  availableGroups: string[];
}

export default function FarmerFilterCard({
  searchFarmer,
  setSearchFarmer,
  selectedPlant,
  setSelectedPlant,
  selectedRegion,
  setSelectedRegion,
  selectedGroup,
  setSelectedGroup,
  onReset,
  onApply,
  availablePlants,
  availableVillages,
  availableGroups,
}: FarmerFilterCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
      {/* Row 1: Search Bar & Tombol Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3.5 text-zinc-400 text-sm" />
          <input
            type="text"
            placeholder="Cari nama atau desa petani...."
            value={searchFarmer}
            onChange={(e) => setSearchFarmer(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-zinc-700 placeholder-zinc-400 transition"
          />
        </div>
        <button className="flex items-center gap-2 bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-lg text-sm shadow-sm transition-colors duration-200">
          <FaFilter className="text-xs text-gray-500" />
          <span>Filter</span>
          <FaChevronDown className="text-xs ml-1 text-gray-500" />
        </button>
      </div>

      {/* Row 2: Tiga Dropdown Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Filter Jenis Tanaman */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">Jenis Tanaman</label>
          <div className="relative">
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-zinc-800 appearance-none focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="Semua jenis">Semua jenis</option>
              {availablePlants.map((plant) => (
                <option key={plant} value={plant}>{plant}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-3 text-zinc-400 text-[10px] pointer-events-none" />
          </div>
        </div>

        {/* Filter Wilayah / Desa */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">Wilayah (Desa)</label>
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-zinc-800 appearance-none focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="Semua Wilayah">Semua Wilayah</option>
              {availableVillages.map((village) => (
                <option key={village} value={village}>{village}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-3 text-zinc-400 text-[10px] pointer-events-none" />
          </div>
        </div>

        {/* Filter Kelompok Tani */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">Kelompok Tani</label>
          <div className="relative">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-zinc-800 appearance-none focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="Semua Kelompok Tani">Semua Kelompok Tani</option>
              {availableGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-3 text-zinc-400 text-[10px] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 3: Tombol Aksi Kanan Bawah */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onReset}
          className="px-4 py-1.5 cursor-pointer border border-zinc-300 hover:bg-zinc-50 rounded-lg text-sm font-bold text-zinc-800 transition shadow-sm"
        >
          Reset
        </button>
        <button
          onClick={onApply}
          className="px-4 py-1.5 bg-[#1e6042] cursor-pointer hover:bg-[#154530] text-white rounded-lg text-sm font-bold transition shadow-sm"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}