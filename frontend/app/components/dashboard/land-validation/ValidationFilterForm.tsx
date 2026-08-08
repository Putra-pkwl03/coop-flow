'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaFilter, FaCloudUploadAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Farmer } from '@/app/dashboard/admin-lapangan/validasi-lahan/ValidasiLahanPage';

interface ValidationFilterFormProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  uniqueGroups: { id: number; name: string }[];
  farmers: Farmer[];
  activeTab: 'belum' | 'sudah';
  setActiveTab: (tab: 'belum' | 'sudah') => void;
  onApplyFilters: (filters: {
    status: string;
    wilayah: string;
    group: string;
    startDate: string;
    endDate: string;
  }) => void;
  onSync?: () => void;
}

export default function ValidationFilterForm({
  searchTerm,
  setSearchTerm,
  uniqueGroups,
  farmers,
  activeTab,
  setActiveTab,
  onApplyFilters,
  onSync
}: ValidationFilterFormProps) {
  // Default false, lalu sesuaikan saat mount di client
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Set default terbuka di desktop dan tertutup di mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsFilterOpen(window.innerWidth >= 768);
    }
  }, []);

  // Filter local state
  const [status, setStatus] = useState('Semua Status');
  const [wilayah, setWilayah] = useState('');
  const [group, setGroup] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const uniqueWilayah = useMemo(() => {
    const maps = new Map<string, string>();

    farmers.forEach((farmer) => {
      const villageData = farmer.village;

      if (villageData && villageData.code) {
        const villageCode = villageData.code.trim();
        const villageName = villageData.name ? `Desa ${villageData.name}` : `Kode Desa (${villageCode})`;

        maps.set(villageCode, villageName);
      } else if (farmer.village_id) {
        maps.set(farmer.village_id.trim(), `Kode Desa: ${farmer.village_id}`);
      }
    });

    return Array.from(maps.entries()).map(([id, name]) => ({ id, name }));
  }, [farmers]);

  const handleApply = () => {
    onApplyFilters({ status, wilayah, group, startDate, endDate });
    if (status === 'Belum Dimapping') setActiveTab('belum');
    else if (status === 'Sudah Dimapping') setActiveTab('sudah');
  };

  const handleReset = () => {
    setStatus('Semua Status');
    setWilayah('');
    setGroup('');
    setStartDate('');
    setEndDate('');
    onApplyFilters({ status: 'Semua Status', wilayah: '', group: '', startDate: '', endDate: '' });
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4 w-full box-border">
      {/* BARIS UTAMA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
          <input
            type="text"
            placeholder="Cari nama atau NIK petani...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-600 font-medium transition box-border"
          />
        </div>

        {/* Action Buttons (Filter & Sync) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex-1 md:flex-none bg-[#4cd396] hover:bg-[#3cb881] text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap h-[44px] cursor-pointer min-w-[110px]"
          >
            <FaFilter className="text-white text-xs" />
            <span>Filter</span>
            {isFilterOpen ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
          </button>

          <button 
            type="button"
            onClick={onSync}
            className="flex-1 md:flex-none bg-[#0b61fd] hover:bg-[#0952d6] text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap h-[44px] cursor-pointer min-w-[130px]"
          >
            <FaCloudUploadAlt className="text-base" />
            <span>Sinkronisasi</span>
          </button>
        </div>
      </div>

      {/* DROPDOWN FILTER COLLAPSIBLE */}
      {isFilterOpen && (
        <div className="pt-2 border-t border-zinc-100 md:border-t-0 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Status Validasi</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-zinc-200 bg-white rounded-xl p-2.5 text-xs font-medium text-zinc-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Belum Dimapping">Belum Dimapping</option>
                <option value="Sudah Dimapping">Sudah Dimapping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Wilayah (Desa)</label>
              <select 
                value={wilayah} 
                onChange={(e) => setWilayah(e.target.value)}
                className="w-full border border-zinc-200 bg-white rounded-xl p-2.5 text-xs font-medium text-zinc-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="">Semua Desa / Wilayah</option>
                {uniqueWilayah.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Kelompok Tani</label>
              <select 
                value={group} 
                onChange={(e) => setGroup(e.target.value)}
                className="w-full border border-zinc-200 bg-white rounded-xl p-2.5 text-xs font-medium text-zinc-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="">Semua Kelompok Tani</option>
                {uniqueGroups.map((g) => (
                  <option key={g.id} value={g.id.toString()}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Tanggal Pengajuan</label>
            <div className="grid grid-cols-2 gap-2.5 max-w-md">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-zinc-200 bg-white rounded-xl p-2.5 text-xs font-medium text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-zinc-200 bg-white rounded-xl p-2.5 text-xs font-medium text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tombol Reset & Terapkan */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button 
              type="button" 
              onClick={handleReset}
              className="flex-1 sm:flex-none px-5 py-2.5 border border-zinc-300 hover:bg-zinc-50 rounded-xl text-xs font-bold text-zinc-700 transition cursor-pointer text-center"
            >
              Reset
            </button>
            <button 
              type="button" 
              onClick={handleApply}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#1b6947] hover:bg-[#145236] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer text-center"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}