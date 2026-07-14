"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/axios";

import InventorySummary from "@/app/components/dashboard/cooperative/inventory/InventorySummary";
import StockTable from "@/app/components/dashboard/cooperative/inventory/StockTable";
import WarehouseProgress from "@/app/components/dashboard/cooperative/inventory/WarehouseProgress";

export default function StokSaatIniPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    api
      .get("/cooperative/inventory/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.status === "success") {
          const backendData = response.data;

          // DISELARASKAN: Disni Fikriiiiiiiiiiiiii harus sama dengan reponse be
          const formattedData = {
            summary: {
              total_stock_kg: backendData.summary.total_stock_kg,
              total_value_idr: backendData.summary.total_value_idr,
              active_warehouses: backendData.summary.active_warehouses,
            },
            stocks: backendData.stocks.map((stock: any) => ({
              ...stock,
              stokTersedia: stock.current_stock,
              stokMinimal: stock.minimum_stock,
            })),
            warehouses: backendData.warehouses,
          };

          setData(formattedData);
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
      <div className="flex items-center justify-center min-h-[400px] text-zinc-500 font-medium">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat data inventaris...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 3 KARTU KONTEN SUMMARY */}
      <InventorySummary summary={data?.summary} />

      {/* TABEL UTAMA STOK */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 mb-4">
          Daftar Ketersediaan Pupuk
        </h2>
        <StockTable stocks={data?.stocks || []} />
      </div>

      {/* PROGRESS BAR GUDANG */}
      <div>
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
          Kapasitas Gudang
        </h2>
        <WarehouseProgress warehouses={data?.warehouses || []} />
      </div>
    </div>
  );
}