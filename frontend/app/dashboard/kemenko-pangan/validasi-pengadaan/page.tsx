"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import ValidasiStats from "@/app/components/dashboard/kemenko/validasi/ValidasiStats";
import ValidasiTable from "@/app/components/dashboard/kemenko/validasi/ValidasiTable";
import { HiMagnifyingGlass, HiArrowLeft } from "react-icons/hi2";

export default function ValidasiKemenkoPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    disetujui: 0,
    menunggu: 0,
    ditolak: 0,
  });

  useEffect(() => {
    api
      .get("/cooperative/procurement")
      .then((res) => {
        const data = res.data.data || [];
        setOrders(data);
        setFilteredOrders(data);

        const total = data.length;
        const disetujui = data.filter(
          (o: any) => o.status_verifikasi === "APPROVED",
        ).length;
        const menunggu = data.filter(
          (o: any) => o.status_verifikasi === "PENDING_KEMENKO",
        ).length;
        const ditolak = data.filter(
          (o: any) => o.status_verifikasi === "REJECTED_KEMENKO",
        ).length;

        setStats({ total, disetujui, menunggu, ditolak });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat data validasi Kemenko:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const result = orders.filter(
      (o: any) =>
        o.po_number.toLowerCase().includes(term) ||
        (o.cooperative?.name || "").toLowerCase().includes(term),
    );
    setFilteredOrders(result);
  }, [search, orders]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-3">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-emerald-600" />
        <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
          Sinkronisasi Dokumen...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start space-x-3">
        <button
          onClick={() => router.back()}
          className="mt-1 shrink-0 flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
          aria-label="Kembali"
        >
          <HiArrowLeft className="text-lg" />
        </button>

        <div>
          <div className="text-xs text-zinc-400 font-semibold mb-1 flex items-center space-x-1">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-zinc-600 font-bold">
              Validasi Kuota Kemenko
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0F7B4A] tracking-tight">
            Validasi Kuota & Logistik
          </h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            Kelola persetujuan kuota dan rilis armada pengiriman pupuk
          </p>
        </div>
      </div>

      <ValidasiStats stats={stats} />

      <div className="relative w-full sm:max-w-md">
        <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-lg" />
        <input
          type="text"
          placeholder="Cari no. pengajuan atau nama koperasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium placeholder-zinc-300"
        />
      </div>

      <ValidasiTable orders={filteredOrders} />
    </div>
  );
}
