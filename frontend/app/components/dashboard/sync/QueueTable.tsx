"use client";

import React from "react";
import { FaSyncAlt, FaCheckCircle, FaEye, FaTrash } from "react-icons/fa";
import { SyncQueue } from "../../../lib/db";

interface Props {
  queueItems: SyncQueue[];
  loading: boolean;
  onViewPayload: (payload: Record<string, any>) => void;
  onDeleteItem: (id?: number) => void;
}

export default function QueueTable({ queueItems, loading, onViewPayload, onDeleteItem }: Props) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "UPDATE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DELETE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span>Daftar Data Belum Tersinkron</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {queueItems.length}
          </span>
        </h2>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <FaSyncAlt className="animate-spin text-3xl mx-auto mb-3 text-emerald-600" />
          <p className="text-sm font-medium">Memuat data antrean...</p>
        </div>
      ) : queueItems.length === 0 ? (
        <div className="p-12 text-center">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center text-2xl mb-3">
            <FaCheckCircle />
          </div>
          <h3 className="text-slate-800 font-bold text-base">Semua Data Tersinkronisasi</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
            Tidak ada antrean data lokal. Seluruh aktivitas Anda telah tersimpan dengan aman di server.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-6">Tabel / Fitur</th>
                <th className="py-3.5 px-4">Aksi</th>
                <th className="py-3.5 px-4">Endpoint Backend</th>
                <th className="py-3.5 px-4">Waktu Dibuat</th>
                <th className="py-3.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {queueItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-800 capitalize">
                    {item.table_name.replace(/_/g, " ")}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getActionBadge(
                        item.action
                      )}`}
                    >
                      {item.action}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
                      {item.method || "POST"} {item.endpoint}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewPayload(item.payload)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Lihat Detail Payload Data"
                      >
                        <FaEye className="text-sm" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus dari Antrean"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}