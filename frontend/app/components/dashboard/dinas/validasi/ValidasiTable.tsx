"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useProcurementStore } from "@/app/store/useProcurementStore";

interface ProcurementOrder {
  id: number;
  po_number: string;
  cooperative?: {
    name: string;
  };
  district?: string;
  total_weight_kg: number;
  status_verifikasi: string;
  created_at: string;
}

interface TableProps {
  orders: ProcurementOrder[];
}

export default function ValidasiTable({ orders }: TableProps) {
  const router = useRouter();
  const setSelectedId = useProcurementStore((state) => state.setSelectedId);

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "PENDING_KEMENKO":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "PENDING_DINAS":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "REJECTED_DINAS":
      case "REJECTED_KEMENKO":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-zinc-50 text-zinc-600 border border-zinc-200";
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "APPROVED" || status === "PENDING_KEMENKO") return "Disetujui";
    if (status === "PENDING_DINAS") return "Menunggu Validasi";
    if (status === "REJECTED_DINAS" || status === "REJECTED_KEMENKO") return "Ditolak";
    return status;
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/70 border-b border-zinc-100 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <th className="p-4 w-16 text-center">No</th>
              <th className="p-4">No. Pengajuan</th>
              <th className="p-4">Koperasi</th>
              <th className="p-4">Kecamatan</th>
              <th className="p-4">Total Pupuk</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Tanggal Pengajuan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-400 font-medium">
                  Tidak ada data pengajuan pengadaan pupuk.
                </td>
              </tr>
            ) : (
              orders.map((order, idx) => (
                <tr 
                  key={order.id} 
                  onClick={() => {
                    setSelectedId(order.id); // <-- 3. Simpan ID ke Zustand secara aman
                    router.push("/dashboard/dinas-pertanian/validasi-pengadaan/detail"); // <-- 4. Arahkan ke URL statis tanpa ID
                  }}
                  className="hover:bg-zinc-50/80 transition duration-150 cursor-pointer group"
                >
                  <td className="p-4 text-center font-semibold text-zinc-400">{idx + 1}</td>
                  <td className="p-4 font-bold text-emerald-700 group-hover:underline">
                    {order.po_number}
                  </td>
                  <td className="p-4 text-zinc-800 font-semibold">{order.cooperative?.name || "-"}</td>
                  <td className="p-4 text-zinc-500 font-medium">{order.district || "Sleman"}</td>
                  <td className="p-4 text-zinc-900 font-black">
                    {(order.total_weight_kg / 1000).toFixed(3)} Kg
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeStyle(order.status_verifikasi)}`}>
                      {getStatusLabel(order.status_verifikasi)}
                    </span>
                  </td>
                  <td className="p-4 text-right text-zinc-400 font-medium">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
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