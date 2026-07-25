"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import ValidasiStats from "@/app/components/dashboard/dinas/validasi/ValidasiStats";
import ValidasiTable from "@/app/components/dashboard/dinas/validasi/ValidasiTable";
import {
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiArrowLeft,
} from "react-icons/hi2";

export default function ValidasiPengadaanPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    disetujui: 0,
    menunggu: 0,
    perluKonfirmasiFisik: 0,
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

        const menunggu = data.filter(
          (o: any) => o.status_verifikasi === "PENDING_DINAS",
        ).length;

        const disetujui = data.filter(
          (o: any) =>
            [
              "PENDING_KEMENKO",
              "PENDING_KEMENKO_ADJUSTED",
              "APPROVED_ADJUSTED",
            ].includes(o.status_verifikasi) &&
            !["GUDANG_LINI_3"].includes(o.status_logistik),
        ).length;

        const perluKonfirmasiFisik = data.filter(
          (o: any) => o.status_logistik === "GUDANG_LINI_3",
          "APPROVED",
        ).length;

        const ditolak = data.filter((o: any) =>
          ["REJECTED_DINAS", "REJECTED_KEMENKO"].includes(o.status_verifikasi),
        ).length;

        setStats({ total, disetujui, menunggu, perluKonfirmasiFisik, ditolak });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat berkas verifikasi:", err);
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

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb & Title */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="mt-2.5 p-2 rounded-full hover:bg-zinc-200 text-zinc-500 transition-colors"
          aria-label="Kembali ke halaman sebelumnya"
        >
          <HiArrowLeft className="text-xl" />
        </button>

        <div>
          <div className="text-xs text-zinc-400 font-semibold mb-1 flex items-center space-x-1">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-zinc-600 font-bold">Validasi Pengadaan</span>
          </div>
          <h1 className="text-2xl font-black text-emerald-700 tracking-tight">
            Validasi Pengadaan
          </h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            Kelola validasi pengadaan pupuk
          </p>
        </div>
      </div>

      {/* Komponen Statistik Grid */}
      <ValidasiStats stats={stats} loading={loading} />

      {/* Toolbar Pencarian & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-lg" />
          <input
            type="text"
            placeholder="Cari nama, NIK petani, tanaman...."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium placeholder-zinc-300"
          />
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-zinc-200 text-zinc-500 px-5 py-2 rounded-xl text-sm font-bold transition cursor-not-allowed">
          <HiAdjustmentsHorizontal className="text-base" />
          <span>Filter</span>
        </button>
      </div>

      {/* Komponen Tabel Utama */}
      <ValidasiTable orders={filteredOrders} loading={loading} />
    </div>
  );
}
