"use client";

import React, { useState, useEffect } from "react";
import OverviewContent from "../../components/dashboard/admin-koperasi/OverViewContent";
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
        // 💡 AMBIL TOKEN REAL-TIME
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;

        // 💡 SUNTIKKAN TOKEN KE HEADERS
        const response = await api.get("/cooperative/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const backendData = response.data.data;

          setMetricsData({
            ...backendData.metrics,
            chartData: backendData.chartData,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        // Berikan delay sedikit agar transisi skeleton/pulse halus
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
