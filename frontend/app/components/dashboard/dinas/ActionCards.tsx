"use client";

import React from "react";
import Link from "next/link";
import {
  HiArrowUpRight,
  HiClipboardDocumentCheck,
  HiDocumentChartBar,
} from "react-icons/hi2";

interface ActionCardsProps {
  validasiCount: number;
}

export default function ActionCards({ validasiCount }: ActionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card Validasi Pengadaan */}
      <Link
        href="/dashboard/dinas-pertanian/validasi-pengadaan"
        className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center space-x-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      >
        {/* Wadah Ikon */}
        <div className="w-16 h-16 shrink-0 bg-emerald-50 rounded-2xl text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
          <HiClipboardDocumentCheck className="text-3xl" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-zinc-800 group-hover:text-emerald-700 transition-colors">
              Validasi Pengadaan
            </h3>
            {validasiCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {validasiCount}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Persetujuan pengajuan pupuk bersubsidi.
          </p>

          <span className="inline-flex pt-1 items-center text-xs font-bold text-emerald-600 group-hover:underline">
            Kelola Validasi{" "}
            <HiArrowUpRight className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>

      {/* Card Laporan */}
      <Link
        href="/dashboard/dinas-pertanian/laporan"
        className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center space-x-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      >
        {/* Wadah Ikon */}
        <div className="w-16 h-16 shrink-0 bg-amber-50 rounded-2xl text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-200">
          <HiDocumentChartBar className="text-3xl" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="font-bold text-zinc-800 group-hover:text-amber-700 transition-colors">
            Laporan & Rekapitulasi
          </h3>
          <p className="text-xs text-zinc-400">
            Rekap pengadaan dan pemantauan distribusi wilayah.
          </p>

          <span className="inline-flex pt-1 items-center text-xs font-bold text-amber-600 group-hover:underline">
            Kelola Laporan{" "}
            <HiArrowUpRight className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}