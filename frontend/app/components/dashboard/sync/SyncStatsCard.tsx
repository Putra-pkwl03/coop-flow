"use client";

import React from "react";
import { FaDatabase, FaCloudUploadAlt, FaSyncAlt } from "react-icons/fa";

interface Props {
  queueLength: number;
  isOnline: boolean;
}

export default function SyncStatsCard({ queueLength, isOnline }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Pending */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
        <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
          <FaDatabase className="text-xl" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Antrean
          </p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">
            {queueLength} <span className="text-xs font-normal text-slate-400">item</span>
          </p>
        </div>
      </div>

      {/* Status Koneksi */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
        <div
          className={`p-3.5 rounded-2xl ${
            isOnline ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}
        >
          <FaCloudUploadAlt className="text-xl" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status Sistem
          </p>
          <p className={`text-sm font-bold mt-0.5 ${isOnline ? "text-emerald-600" : "text-rose-600"}`}>
            {isOnline ? "Siap Sinkronasi" : "Penyimpanan Lokal"}
          </p>
        </div>
      </div>

      {/* Auto Sync */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
        <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl">
          <FaSyncAlt className="text-xl" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Auto Sync
          </p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
            Otomatis saat terhubung kembali.
          </p>
        </div>
      </div>
    </div>
  );
}