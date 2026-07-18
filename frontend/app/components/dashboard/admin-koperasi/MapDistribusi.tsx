"use client";

import React from "react";

export default function MapDistribusi() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm w-full lg:w-105 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            Peta Distribusi Wilayah
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sebaran area penerima pasokan
          </p>
        </div>
        {/* Dropdown wilayah tiruan */}
        <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-600 focus:outline-none">
          <option>Jawa Tengah</option>
          <option>D.I. Yogyakarta</option>
        </select>
      </div>

      {/* Wadah Gambar Peta Wilayah */}
      <div className="h-44 w-full bg-slate-50 border border-slate-100 rounded-xl mt-4 overflow-hidden relative group">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
          alt="Peta Wilayah Koperasi"
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-500"
        />
        {/* Lapisan gradasi estetik */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Indikator Legenda Peta */}
      <div className="flex items-center gap-4 mt-4 text-[11px] font-bold text-slate-500">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
          <span>Tinggi</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
          <span>Sedang</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          <span>Rendah</span>
        </div>
      </div>
    </div>
  );
}
