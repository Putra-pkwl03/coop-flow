// src/app/components/dashboard/kemenko/MetricCards.tsx
"use client";

import React from "react";
import {
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaCalendarPlus,
} from "react-icons/fa";

interface MetricCardsProps {
  total: number;
  active: number;
  inactive: number; // Walau propnya inactive di page.tsx, kita render sebagai Pending
  newThisMonth: number;
}

export default function MetricCards({
  total,
  active,
  inactive, // Ini merepresentasikan data PENDING
  newThisMonth,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
      {/* CARD 1: TOTAL */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
        <div className="p-3.5 bg-zinc-100 rounded-xl text-zinc-600">
          <FaUsers size={22} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Koperasi
          </p>
          <h3 className="text-2xl font-black text-zinc-800">
            {total.toLocaleString("id-ID")}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            ↑ 8.5%{" "}
            <span className="text-zinc-400 font-normal">dari bulan lalu</span>
          </p>
        </div>
      </div>

      {/* CARD 2: ACTIVE */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
        <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
          <FaCheckCircle size={22} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
            Koperasi Aktif
          </p>
          <h3 className="text-2xl font-black text-zinc-800">
            {active.toLocaleString("id-ID")}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            ↑ 6.2%{" "}
            <span className="text-zinc-400 font-normal">dari bulan lalu</span>
          </p>
        </div>
      </div>

      {/* CARD 3: PENDING (Sebelumnya Inactive) */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
        <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600">
          <FaClock size={22} /> {/* Menggunakan ikon jam untuk antrean */}
        </div>
        <div>
          <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
            Koperasi Pending
          </p>
          <h3 className="text-2xl font-black text-zinc-800">
            {inactive.toLocaleString("id-ID")}
          </h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
            ↓ 2.1%{" "}
            <span className="text-zinc-400 font-normal">dari bulan lalu</span>
          </p>
        </div>
      </div>

      {/* CARD 4: NEW THIS MONTH */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
        <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
          <FaCalendarPlus size={22} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
            Terdaftar Bulan Ini
          </p>
          <h3 className="text-2xl font-black text-zinc-800">
            {newThisMonth.toLocaleString("id-ID")}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            ↑ 14.3%{" "}
            <span className="text-zinc-400 font-normal">dari bulan lalu</span>
          </p>
        </div>
      </div>
    </div>
  );
}
