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
  status_logistik: string;
  created_at: string;
}

interface TableProps {
  orders: ProcurementOrder[];
  loading?: boolean;
}

export default function ValidasiTable({ orders, loading }: TableProps) {
  const router = useRouter();
  const setSelectedId = useProcurementStore((state) => state.setSelectedId);

  const getVerifikasiBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "PENDING_KEMENKO":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "REJECTED_KEMENKO":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-zinc-50 text-zinc-600 border border-zinc-200";
    }
  };

  const getVerifikasiLabel = (status: string) => {
    if (status === "APPROVED") return "Disetujui";
    if (status === "PENDING_KEMENKO") return "Menunggu Kuota";
    if (status === "REJECTED_KEMENKO") return "Ditolak";
    return status;
  };

  const getLogistikBadge = (status: string) => {
    switch (status) {
      case "SELESAI":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "PROD_LINI_1_2":
      case "GUDANG_LINI_3":
      case "SIAP_TEBUS_LINI_4":
        return "bg-teal-50 text-teal-700 border border-teal-200";
      default:
        return "bg-zinc-50 text-zinc-500 border border-zinc-200";
    }
  };

  const getLogistikLabel = (status: string) => {
    const map: Record<string, string> = {
      NONE: "Belum Dirilis",
      PROD_LINI_1_2: "Dalam Perjalanan",
      GUDANG_LINI_3: "Tiba Lini 3",
      SIAP_TEBUS_LINI_4: "Siap Tebus",
      SELESAI: "Selesai",
    };
    return map[status] || status;
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
              <th className="p-4">Total Pupuk</th>
              <th className="p-4">Status Kuota</th>
              <th className="p-4">Status Logistik</th>
              <th className="p-4 text-right">Tanggal Pengajuan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="p-4 text-center">
                    <div className="h-3 w-4 bg-zinc-200 rounded mx-auto" />
                  </td>
                  <td className="p-4">
                    <div className="h-3 w-24 bg-zinc-200 rounded" />
                  </td>
                  <td className="p-4">
                    <div className="h-3 w-32 bg-zinc-200 rounded" />
                  </td>
                  <td className="p-4">
                    <div className="h-3 w-16 bg-zinc-200 rounded" />
                  </td>
                  <td className="p-4">
                    <div className="h-5 w-20 bg-zinc-200 rounded-full" />
                  </td>
                  <td className="p-4">
                    <div className="h-5 w-20 bg-zinc-200 rounded-full" />
                  </td>
                  <td className="p-4 flex justify-end">
                    <div className="h-3 w-24 bg-zinc-200 rounded" />
                  </td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-zinc-400 font-medium"
                >
                  Tidak ada data pengajuan yang perlu ditangani Kemenko.
                </td>
              </tr>
            ) : (
              orders.map((order, idx) => (
                <tr
                  key={order.id}
                  onClick={() => {
                    setSelectedId(order.id);
                    router.push(
                      "/dashboard/kemenko-pangan/validasi-pengadaan/detail",
                    );
                  }}
                  className="hover:bg-zinc-50/80 transition duration-150 cursor-pointer group"
                >
                  <td className="p-4 text-center font-semibold text-zinc-400">
                    {idx + 1}
                  </td>
                  <td className="p-4 font-bold text-emerald-700 group-hover:underline">
                    {order.po_number}
                  </td>
                  <td className="p-4 text-zinc-800 font-semibold">
                    {order.cooperative?.name || "-"}
                  </td>
                  <td className="p-4 text-zinc-900 font-black">
                    {(order.total_weight_kg / 1000).toFixed(3)} Kg
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getVerifikasiBadge(order.status_verifikasi)}`}
                    >
                      {getVerifikasiLabel(order.status_verifikasi)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getLogistikBadge(order.status_logistik)}`}
                    >
                      {getLogistikLabel(order.status_logistik)}
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
