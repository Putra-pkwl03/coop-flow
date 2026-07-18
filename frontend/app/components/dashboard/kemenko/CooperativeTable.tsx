// src/app/components/dashboard/kemenko/CooperativeTable.tsx
"use client";

import React from "react";
import { FaEye, FaChevronDown, FaClipboardList } from "react-icons/fa";

interface Cooperative {
  id: number;
  name: string;
  province: string;
  city_koor: string;
  status: string; // 'PENDING' | 'ACTIVE'
  created_at?: string;
}

interface CooperativeTableProps {
  data: Cooperative[];
  loading: boolean;
  actionLoading: number | null;
  // Prop baru untuk memicu terbukanya modal detail
  onViewDetail: (id: number) => void;
  // onActivate tetap dipertahankan opsional jika nanti ingin dipakai di dropdown cepat
  onActivate?: (id: number) => void;
}

export default function CooperativeTable({
  data,
  loading,
  actionLoading,
  onViewDetail,
  onActivate,
}: CooperativeTableProps) {
  // Helper sederhana untuk memformat tanggal
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/70 border-b border-zinc-200 text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-4 px-6 text-center w-14">No</th>
              <th className="py-4 px-4">Nama Koperasi</th>
              <th className="py-4 px-4">Provinsi</th>
              <th className="py-4 px-4">Kabupaten/Kota</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-4 text-center">Tanggal Terdaftar</th>
              <th className="py-4 px-6 text-center w-40">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-zinc-400 font-medium"
                >
                  Memuat data master koperasi...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-zinc-400 font-medium"
                >
                  Tidak ada data koperasi yang ditemukan.
                </td>
              </tr>
            ) : (
              data.map((coop, index) => (
                <tr
                  key={coop.id}
                  className="hover:bg-zinc-50/50 transition-all duration-150"
                >
                  {/* KOLOM 1: NO */}
                  <td className="py-3.5 px-6 text-center font-semibold text-zinc-400">
                    {index + 1}
                  </td>

                  {/* KOLOM 2: NAMA KOPERASI */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-zinc-900">{coop.name}</div>
                  </td>

                  {/* KOLOM 3: PROVINSI */}
                  <td className="py-3.5 px-4 text-zinc-600 font-medium">
                    {coop.province}
                  </td>

                  {/* KOLOM 4: KABUPATEN / KOTA */}
                  <td className="py-3.5 px-4 text-zinc-600 font-medium">
                    {coop.city_koor}
                  </td>

                  {/* KOLOM 5: STATUS */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wide ${
                        coop.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      {coop.status === "ACTIVE" ? "Aktif" : "Pending"}
                    </span>
                  </td>

                  {/* KOLOM 6: TANGGAL TERDAFTAR */}
                  <td className="py-3.5 px-4 text-center text-zinc-600 font-medium">
                    {formatDate(coop.created_at)}
                  </td>

                  {/* KOLOM 7: AKSI (Disesuaikan untuk Flow Baru) */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center justify-center">
                      {coop.status === "PENDING" ? (
                        <div className="inline-flex rounded-lg border border-emerald-200 shadow-sm">
                          <button
                            onClick={() => onViewDetail(coop.id)}
                            disabled={actionLoading === coop.id}
                            className="bg-white hover:bg-emerald-50/50 text-emerald-600 text-[12px] pl-3 pr-2 py-1.5 rounded-l-lg font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 border-r border-emerald-100"
                          >
                            <FaClipboardList
                              size={11}
                              className="text-emerald-500"
                            />
                            {actionLoading === coop.id
                              ? "Memuat..."
                              : "Periksa"}
                          </button>
                          {/* Tombol dropdown dipertahankan untuk opsi tambahan nanti (misal: Tolak Cepat) */}
                          <button className="bg-white hover:bg-emerald-50/50 text-emerald-600 px-2 py-1.5 rounded-r-lg transition-all">
                            <FaChevronDown size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex rounded-lg border border-zinc-200 shadow-sm">
                          <button
                            onClick={() => onViewDetail(coop.id)}
                            className="bg-white hover:bg-zinc-50 text-zinc-600 text-[12px] pl-3 pr-2 py-1.5 rounded-l-lg font-bold flex items-center gap-1.5 transition-all"
                          >
                            <FaEye size={11} className="text-zinc-400" />
                            Lihat Detail
                          </button>
                          <button className="bg-white hover:bg-zinc-50 text-zinc-500 px-2 py-1.5 rounded-r-lg transition-all border-l border-zinc-100">
                            <FaChevronDown size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
