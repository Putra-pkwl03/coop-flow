"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "../../../lib/axios";

// Import Ikon
import { FaSearch, FaFilter, FaBrain, FaChevronDown, FaChevronUp, FaBoxes } from "react-icons/fa";
import InventorySummary from "@/app/components/dashboard/admin-koperasi/inventory/InventorySummary";
import StockTable from "@/app/components/dashboard/admin-koperasi/inventory/StockTable";
import AiProcurementPanel from "@/app/components/dashboard/admin-koperasi/inventory/AiProcurementPanel"; 

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};


export default function StokSaatIniPage() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  
  const [summary, setSummary] = useState<any>(null);
  const [stocks, setStocks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // State Kontrol Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("none");

  // State untuk Prediksi AI Terintegrasi
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    const token = getCookie("access_token");

    const fetchOverview = api.get("/cooperative/inventory/overview", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const fetchFertilizers = api.get("/cooperative/fertilizers", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    Promise.all([fetchOverview, fetchFertilizers])
      .then(([overviewRes, fertilizersRes]) => {
        if (overviewRes.data.success) setSummary(overviewRes.data.data);
        if (fertilizersRes.data.success) setStocks(fertilizersRes.data.data);
      })
      .catch((error) => {
        console.error("Gagal mengambil data inventaris:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleTriggerPrediction = async () => {
    setLoadingAI(true);
    try {
      const token = getCookie("access_token");
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };

      const res = await api.post("/cooperative/inventory/fertilizers/predict-all", {}, config);

      if (res.data.success) {
        setAiData(res.data.data);
      }
    } catch (error) {
      console.error("Gagal melakukan prediksi AI:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getProcessedStocks = () => {
    let result = [...stocks];
    if (search.trim() !== "") {
      result = result.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== "all") {
      result = result.filter((item) => {
        const stock = item.current_stock_kg || 0;
        if (statusFilter === "habis") return stock === 0;
        if (statusFilter === "menipis") return stock > 0 && stock <= 200;
        if (statusFilter === "tersedia") return stock > 200;
        return true;
      });
    }
    if (priceSort === "highest") {
      result.sort((a, b) => (b.price_per_kg || 0) - (a.price_per_kg || 0));
    } else if (priceSort === "lowest") {
      result.sort((a, b) => (a.price_per_kg || 0) - (b.price_per_kg || 0));
    }
    return result;
  };

  const filteredStocks = getProcessedStocks();

  // --- SKELETON LOADING DENGAN STRUKTUR LAYOUT YANG DISESUAIKAN ---
  if (loading) {
    return (
      <div className="flex flex-col h-full space-y-6 animate-pulse">
        {/* 1. Skeleton Bar Alat */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
          <div className="flex flex-wrap md:flex-nowrap items-center w-full md:flex-1 gap-3">
            <div className="h-10 bg-zinc-200 rounded-md flex-1 min-w-[200px]"></div>
            <div className="h-10 bg-zinc-200 rounded-md w-24"></div>
            <div className="h-10 bg-zinc-200 rounded-md w-32"></div>
          </div>
          <div className="h-10 bg-zinc-200 rounded-md w-full md:w-44"></div>
        </div>

        {/* 2. Skeleton Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-28 bg-zinc-100 border border-zinc-200/60 rounded-xl p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
                <div className="h-3 bg-zinc-200 rounded w-3/4"></div>
              </div>
              <div className="h-6 bg-zinc-200 rounded w-1/3 mt-2"></div>
            </div>
          ))}
        </div>

        {/* 3. Skeleton Table */}
        <div className="border border-zinc-200 rounded-xl bg-white p-4 space-y-4 flex-1">
          <div className="h-8 bg-zinc-100 rounded-md w-full mb-2"></div>
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-4 py-2 border-b border-zinc-100 last:border-0">
              <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
              <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
              <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn">
      
      {/* BAR ALAT: SEARCH BAR FULL, FILTER, MANAGE & PREDIKSI AI */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full flex-shrink-0">
        <div className="flex flex-wrap md:flex-nowrap items-center w-full md:flex-1 gap-3 relative" ref={dropdownRef}>
          
          {/* Input Search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <FaSearch className="text-sm" />
            </span>
            <input
              type="text"
              placeholder="Cari pupuk...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-zinc-800"
            />
          </div>
          
          {/* Button Filter */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-3 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              isFilterOpen || statusFilter !== "all" || priceSort !== "none"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <FaFilter className="text-xs" />
            <span>Filter</span>
            {isFilterOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
          </button>

          {/* BUTTON BARU: MANGAGE/KELOLA PUPUK (SCROLL SHORTCUT) */}
          <button
            onClick={scrollToTable}
            className="flex items-center gap-2 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-2xs"
          >
            <FaBoxes className="text-xs text-zinc-500" />
            <span>Kelola Pupuk</span>
          </button>

          {/* Dropdown Menu Filter */}
          {isFilterOpen && (
            <div className="absolute right-0 md:left-auto top-full mt-2 w-64 bg-white border border-zinc-200 rounded-lg shadow-xl p-4 z-50 text-zinc-700 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">Status Stok</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border border-zinc-200 rounded-md p-1.5 text-sm bg-white">
                  <option value="all">Semua Status</option>
                  <option value="tersedia">Stok Tersedia</option>
                  <option value="menipis">Stok Menipis</option>
                  <option value="habis">Stok Habis</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">Urutan Harga</label>
                <select value={priceSort} onChange={(e) => setPriceSort(e.target.value)} className="w-full border border-zinc-200 rounded-md p-1.5 text-sm bg-white">
                  <option value="none">Bawaan</option>
                  <option value="highest">Harga Tertinggi</option>
                  <option value="lowest">Harga Terendah</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Button Prediksi AI */}
        <div className="w-full md:w-auto flex justify-end flex-shrink-0">
          <button 
            onClick={handleTriggerPrediction}
            disabled={loadingAI}
            className="flex items-center gap-2 bg-[#497ecf] cursor-pointer hover:bg-[#3d6baf]  disabled:bg-green-300 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all shadow-sm w-full md:w-auto justify-center whitespace-nowrap"
          >
            <FaBrain className={`text-sm ${loadingAI ? "animate-spin" : "animate-pulse"}`} />
            <span>{loadingAI ? "Menganalisis..." : "Prediksi Pengadaan ML"}</span>
          </button>
        </div>
      </div>

      {/* --- PANEL PENGADAAN AI --- */}
      {aiData && <AiProcurementPanel aiData={aiData} />}

      <div className="flex-shrink-0">
        <InventorySummary summary={summary} />
      </div>

      {/* Memasang target ref ke pembungkus tabel stok */}
      <div ref={tableRef} className="flex-1 min-h-0 pt-2">
        <StockTable stocks={filteredStocks} refreshData={fetchData} />
      </div>
    </div>
  );
}