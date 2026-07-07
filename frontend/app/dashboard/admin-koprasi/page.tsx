"use client";

import React, { useState, useEffect } from "react";
import OverviewContent from "../../components/cooperative/OverViewContent";
import api from "../../lib/axios";

export default function DashboardOverviewPage() {
  const [metricsData, setMetricsData] = useState({
    totalPetani: 0,
    luasLahan: 0,
    totalPengajuan: 0,
    distribusiSelesai: 0,
    chartData: { months: [], prediksiCoords: [], stokCoords: [] },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await api.get("/cooperative/dashboard");
        if (response.data.success) {
          const backendData = response.data.data;

          // 💡 SOLUSI: Gabungkan objek 'metrics' dan 'chartData' ke dalam satu objek tingkat atas
          setMetricsData({
            ...backendData.metrics, // Mengeluarkan totalPetani, luasLahan, dll
            chartData: backendData.chartData, // Memasukkan objek chartData
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (isLoading)
    return (
      <div className="py-20 text-center font-medium text-zinc-500 animate-pulse">
        Sinkronisasi data ekosistem...
      </div>
    );

  return <OverviewContent data={metricsData} />;
}
