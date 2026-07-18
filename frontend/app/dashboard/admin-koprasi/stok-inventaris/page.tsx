"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/axios";

// Import Ikon dari react-icons/fa
import { FaSearch, FaFilter, FaBrain, FaChevronDown, FaChevronUp } from "react-icons/fa";

import InventorySummary from "@/app/components/dashboard/admin-koperasi/inventory/InventorySummary";
import StockTable from "@/app/components/dashboard/admin-koperasi/inventory/StockTable";

export default function StokSaatIniPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [summary, setSummary] = useState<any>(null);
  const [stocks, setStocks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // State untuk kontrol filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("none"); 

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    // 1. Ambil data overview untuk 5 Card
    const fetchOverview = api.get("/cooperative/inventory/overview", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2. Ambil data master pupuk untuk list tabel
    const fetchFertilizers = api.get("/cooperative/fertilizers", {
      headers: { Authorization: `Bearer ${token}` },
    });

    Promise.all([fetchOverview, fetchFertilizers])
      .then(([overviewRes, fertilizersRes]) => {
        if (overviewRes.data.success) {
          setSummary(overviewRes.data.data);
        }
        if (fertilizersRes.data.success) {
          setStocks(fertilizersRes.data.data);
        }
      })
      .catch((error) => {
        console.error("Gagal mengambil data inventaris:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Menutup filter seandainya klik di luar area modal dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGIC FILTERING & SORTING DI SISI CLIENT ---
  const getProcessedStocks = () => {
    let result = [...stocks];

    // 1. Filter Kata Kunci Nama Pupuk
    if (search.trim() !== "") {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 2. Filter Berdasarkan Status Stok (Asumsi ambang batas: menipis < 200kg, habis = 0)
    if (statusFilter !== "all") {
      result = result.filter((item) => {
        const stock = item.current_stock_kg || 0;
        if (statusFilter === "habis") return stock === 0;
        if (statusFilter === "menipis") return stock > 0 && stock <= 200;
        if (statusFilter === "tersedia") return stock > 200;
        return true;
      });
    }

    // 3. Sorting Berdasarkan Nilai Harga per Kg
    if (priceSort === "highest") {
      result.sort((a, b) => (b.price_per_kg || 0) - (a.price_per_kg || 0));
    } else if (priceSort === "lowest") {
      result.sort((a, b) => (a.price_per_kg || 0) - (b.price_per_kg || 0));
    }

    return result;
  };

  const filteredStocks = getProcessedStocks();

  // --- RENDERING MODERN SKELETON LOADER ---
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Top Bar Tools */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
          <div className="flex items-center w-full md:flex-1 gap-3">
            <div className="h-10 bg-zinc-200 rounded-md flex-1"></div>
            <div className="h-10 bg-zinc-200 rounded-md w-24"></div>
          </div>
          <div className="h-10 bg-zinc-200 rounded-md w-full md:w-44"></div>
        </div>

        {/* Skeleton 5 Cards Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 border border-zinc-200/60 rounded-xl p-4 space-y-3">
              <div className="h-3 bg-zinc-200 rounded w-2/3"></div>
              <div className="h-6 bg-zinc-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Skeleton Nav Tabs & Action */}
        <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
          <div className="flex gap-4">
            <div className="h-4 bg-zinc-200 rounded w-20"></div>
            <div className="h-4 bg-zinc-200 rounded w-24"></div>
          </div>
          <div className="h-9 bg-zinc-200 rounded-md w-32"></div>
        </div>

        {/* Skeleton Table Rows */}
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
          <div className="h-12 bg-zinc-50 border-b border-zinc-200"></div>
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                <div className="flex items-center gap-3 w-1/4">
                  <div className="w-9 h-9 bg-zinc-200 rounded-md flex-shrink-0"></div>
                  <div className="h-4 bg-zinc-200 rounded w-full"></div>
                </div>
                <div className="h-4 bg-zinc-200 rounded w-16"></div>
                <div className="h-4 bg-zinc-200 rounded w-20"></div>
                <div className="h-4 bg-zinc-200 rounded w-24"></div>
                <div className="h-6 bg-zinc-200 rounded-full w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* BAR ALAT: SEARCH BAR FULL & PREDIKSI AI */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
        
        {/* Sisi Kiri: Search Bar Panjang bersatu dengan Button Filter */}
        <div className="flex items-center w-full md:flex-1 gap-3 relative" ref={dropdownRef}>
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <FaSearch className="text-zinc-400 text-sm" />
            </span>
            <input
              type="text"
              placeholder="Cari pupuk...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-zinc-800"
            />
          </div>
          
          {/* Tombol Filter dengan Toggle Arrow Icon */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-3 px-4 py-2 border rounded-md text-sm font-medium transition-colors flex-shrink-0 ${
              isFilterOpen || statusFilter !== "all" || priceSort !== "none"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <FaFilter className="text-xs" />
            <span>Filter</span>
            {isFilterOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
          </button>

          {/* DROPDOWN OPTIONS PANEL */}
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-zinc-200 rounded-lg shadow-xl p-4 z-50 text-zinc-700 space-y-4 animate-fadeIn">
              {/* Grup 1: Status Stok */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">Status Stok</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-zinc-200 rounded-md p-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="tersedia">Stok Tersedia</option>
                  <option value="menipis">Stok Menipis</option>
                  <option value="habis">Stok Habis</option>
                </select>
              </div>

              {/* Grup 2: Urutan Harga */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">Urutan Harga</label>
                <select 
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className="w-full border border-zinc-200 rounded-md p-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="none">Bawaan</option>
                  <option value="highest">Harga Tertinggi</option>
                  <option value="lowest">Harga Terendah</option>
                </select>
              </div>

              {/* Reset Button */}
              <button 
                onClick={() => { setStatusFilter("all"); setPriceSort("none"); setIsFilterOpen(false); }}
                className="w-full text-center text-xs text-red-500 font-semibold hover:underline pt-1 block"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
        
        {/* Sisi Kanan: Tombol AI */}
        <div className="w-full md:w-auto flex justify-end flex-shrink-0">
          <button 
            onClick={() => router.push("/dashboard/admin-koprasi/stok-inventaris/prediksi-ai")}
            className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all shadow-sm w-full md:w-auto justify-center whitespace-nowrap"
          >
            <FaBrain className="text-sm" />
            <span>Prediksi Pengadaan</span>
          </button>
        </div>
      </div>

      {/* 5 KARTU KONTEN SUMMARY */}
      <InventorySummary summary={summary} />

      {/* TABEL UTAMA STOK */}
      <div>
        {/* Mengirimkan filteredStocks hasil filter & sorting ke komponen tabel */}
        <StockTable stocks={filteredStocks} refreshData={() => window.location.reload()} />
      </div>
    </div>
  );
}