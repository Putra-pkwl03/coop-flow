// src/app/components/dashboard/kemenko/FilterBar.tsx
"use client";

import React from "react";
import { FaSearch, FaSync } from "react-icons/fa";

interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onReset: () => void;
}

export default function FilterBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onReset,
}: FilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col xl:flex-row xl:items-center gap-3">
      {/* INPUT PENCARIAN TEKS */}
      <div className="relative flex-1">
        <FaSearch className="absolute left-4 top-3.5 text-zinc-400 text-sm" />
        <input
          type="text"
          placeholder="Cari nama koperasi, kode unik, atau lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B4A] transition-all text-zinc-700 placeholder-zinc-400"
        />
      </div>

      {/* DROPDOWN FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
        <select
          disabled
          className="bg-zinc-50 border border-zinc-200 text-zinc-400 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none cursor-not-allowed"
          defaultValue="all"
        >
          <option value="all">Semua Provinsi</option>
        </select>

        <select
          disabled
          className="bg-zinc-50 border border-zinc-200 text-zinc-400 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none cursor-not-allowed"
          defaultValue="all"
        >
          <option value="all">Semua Kabupaten/Kota</option>
        </select>

        {/* STATUS COOPERATIVE */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-xl py-2.5 px-4 text-sm font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#0F7B4A] cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pending</option>{" "}
          {/* Diselaraskan menjadi Pending */}
        </select>
      </div>

      {/* ACTION REFRESH BUTTON */}
      <button
        onClick={onReset}
        className="p-2.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all text-zinc-600 flex items-center justify-center gap-2 text-sm font-bold shrink-0"
        title="Reset Filters"
      >
        <FaSync size={13} className="text-zinc-500" />
        <span className="xl:hidden">Reset Filter</span>
      </button>
    </div>
  );
}
