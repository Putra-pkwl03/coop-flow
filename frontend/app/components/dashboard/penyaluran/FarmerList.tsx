"use client";

import { useState, useMemo } from "react";
import { Farmer } from "@/app/types/farmer";
import { FaSearch, FaFilter, FaChevronDown, FaSortAmountDown, FaUser } from "react-icons/fa";

interface FarmerListProps {
  farmers: Farmer[];
  selectedId: number | null;
  onSelectFarmer: (farmer: Farmer) => void;
}

export default function FarmerList({ farmers, selectedId, onSelectFarmer }: FarmerListProps) {
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);

  // State Kontrol Filter & Search
  const [search, setSearch] = useState("");
  const [jenisTanaman, setJenisTanaman] = useState("Semua jenis");
  const [wilayah, setWilayah] = useState("Semua Wilayah");
  const [kelompokTani, setKelompokTani] = useState("Semua Kelompok Tani");
  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");

// 1. Ekstrak Opsi Dropdown secara Dinamis & Type-Safe dari Data Backend
  const filterOptions = useMemo(() => {
    const tanamanSet = new Set<string>();
    const wilayahSet = new Set<string>();
    const kelompokSet = new Set<string>();

    farmers.forEach((f) => {
      // Kelompok Tani aman karena object selalu ada
      if (f.farmer_group?.name) {
        kelompokSet.add(f.farmer_group.name);
      }
      
      // Ambil wilayah dari alamat user jika tidak null
      if (f.user?.address) {
        const parts = f.user.address.split(",");
        if (parts[0]) wilayahSet.add(parts[0].trim());
      }
      
      // Loop ke dalam array lands -> plants (Sesuai interface Land)
      f.lands?.forEach((l) => {
        l.plants?.forEach((p) => {
          if (p.name) tanamanSet.add(p.name);
        });
      });
    });

    return {
      tanaman: Array.from(tanamanSet),
      wilayah: Array.from(wilayahSet),
      kelompok: Array.from(kelompokSet),
    };
  }, [farmers]);

  // 2. Proses Filtering & Searching Data Secara Kombinatif (Type-Safe)
  const filteredFarmers = useMemo(() => {
    return farmers.filter((farmer) => {
      // Filter Search Bar (Nama atau NIK)
      const matchesSearch =
        search === "" ||
        farmer.user.name.toLowerCase().includes(search.toLowerCase()) ||
        farmer.nik.includes(search);

      // Filter Kelompok Tani
      const matchesKelompok =
        kelompokTani === "Semua Kelompok Tani" ||
        farmer.farmer_group?.name === kelompokTani;

      // Filter Wilayah (Proteksi jika address bernilai null)
      const matchesWilayah =
        wilayah === "Semua Wilayah" ||
        (farmer.user?.address
          ? farmer.user.address.toLowerCase().includes(wilayah.toLowerCase())
          : false);

      // Filter Jenis Tanaman (Mencari di dalam array plants milik tiap land)
      const matchesTanaman =
        jenisTanaman === "Semua jenis" ||
        farmer.lands?.some((l) =>
          l.plants?.some((p) => p.name === jenisTanaman)
        );

      return matchesSearch && matchesKelompok && matchesWilayah && matchesTanaman;
    });
  }, [farmers, search, jenisTanaman, wilayah, kelompokTani]);

  const handleReset = () => {
    setSearch("");
    setJenisTanaman("Semua jenis");
    setWilayah("Semua Wilayah");
    setKelompokTani("Semua Kelompok Tani");
    setDariTanggal("");
    setSampaiTanggal("");
  };

  return (
    <>
      {/* CARD 1: SEPARATOR UNTUK SEARCH BAR & EXPANDED FILTER */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-xs">
              <FaSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIK petani...."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 bg-[#4CD094] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-500 transition"
          >
            <FaFilter className="text-xs" />
            <span>Filter</span>
            <FaChevronDown className={`text-[10px] transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Panel Filter Dropdown */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 transition-all duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Dropdown Jenis Tanaman */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-gray-400">Jenis Tanaman</label>
                <select
                  value={jenisTanaman}
                  onChange={(e) => setJenisTanaman(e.target.value)}
                  className="w-full border border-gray-200 p-2 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option>Semua jenis</option>
                  {filterOptions.tanaman.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Dropdown Wilayah */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-gray-400">Wilayah</label>
                <select
                  value={wilayah}
                  onChange={(e) => setWilayah(e.target.value)}
                  className="w-full border border-gray-200 p-2 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option>Semua Wilayah</option>
                  {filterOptions.wilayah.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Dropdown Kelompok Tani */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-gray-400">Kelompok Tani</label>
                <select
                  value={kelompokTani}
                  onChange={(e) => setKelompokTani(e.target.value)}
                  className="w-full border border-gray-200 p-2 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option>Semua Kelompok Tani</option>
                  {filterOptions.kelompok.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">         
            <div className="flex justify-end gap-2 sm:col-start-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="px-4 py-1.5 bg-[#1B5E3A] text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition"
              >
                Terapkan
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm mt-4 flex flex-col flex-1 overflow-hidden min-h-[300px]">
        
        <div className="flex justify-between items-center text-xs text-gray-400 font-medium px-1 mb-3 shrink-0">
          <span>Total {filteredFarmers.length} data ditemukan</span>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-600">
            <span>Urutkan : <strong className="text-gray-700">Terbaru</strong></span>
            <FaSortAmountDown className="text-gray-500" />
          </div>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {filteredFarmers.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Tidak ada data petani yang cocok dengan kriteria filter.
            </div>
          ) : (
            filteredFarmers.map((farmer) => {
              const isSelected = farmer.id === selectedId;
              return (
                <div
                  key={farmer.id}
                  onClick={() => onSelectFarmer(farmer)}
                  className={`flex items-center gap-4 p-2 border rounded-lg cursor-pointer transition ${
                    isSelected 
                      ? "border-emerald-500 bg-emerald-50/20 shadow-sm" 
                      : "border-gray-150 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-lg flex-shrink-0">
                    <FaUser />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">
                      {farmer.user.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">NIK: {farmer.nik}</p>
                    <p className="text-xs text-gray-400 truncate">Kelompok Tani: {farmer.farmer_group?.name || "-"}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}