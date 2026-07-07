"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/axios";

import InventorySummary from "@/app/components/cooperative/inventory/InventorySummary";
import StockTable from "@/app/components/cooperative/inventory/StockTable";
import WarehouseProgress from "@/app/components/cooperative/inventory/WarehouseProgress";

export default function StokSaatIniPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/cooperative/inventory/overview")
      .then((response) => {
        if (response.data.status === "success") {
          setData(response.data);
        }
      })
      .catch((error) => {
        console.error("Gagal mengambil data inventaris:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100 text-zinc-500">
        Memuat data inventaris...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 3 KARTU KONTEN - Menerima objek summary */}
      <InventorySummary summary={data?.summary} />

      {/* TABEL UTAMA STOK - Menerima array stocks */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 mb-4">
          Daftar Ketersediaan Pupuk
        </h2>
        <StockTable stocks={data?.stocks || []} />
      </div>

      {/* PROGRESS BAR GUDANG - Menerima array data gudang */}
      <div>
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
          Gudang
        </h2>
        <WarehouseProgress warehouses={data?.warehouses || []} />
      </div>
    </div>
  );
}
