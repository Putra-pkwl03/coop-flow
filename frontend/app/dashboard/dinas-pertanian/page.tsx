"use client";

import React, { useEffect, useState } from "react";
import api from "@/app/lib/axios"; 

import WelcomeBanner from "@/app/components/dashboard/dinas/WelcomeBanner";
import ActionCards from "@/app/components/dashboard/dinas/ActionCards";
import StatsGrid from "@/app/components/dashboard/dinas/StatsGrid";
import DashboardCharts from "@/app/components/dashboard/dinas/DashboardCharts";
import RecentLists from "@/app/components/dashboard/dinas/RecentLists";

export default function DinasDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dinas/dashboard")
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Gagal menyinkronkan data dari sistem backend.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-125 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        <span className="text-sm font-bold text-zinc-400 tracking-wide uppercase">Menghubungkan ke Hub Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50/50 border border-red-200/60 text-red-700 font-semibold rounded-2xl shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <WelcomeBanner />
      <ActionCards validasiCount={data?.badges.validasi_pengadaan_count || 0} />
      <StatsGrid metrics={data?.metrics} />
      <DashboardCharts donut={data?.donut_chart} line={data?.line_chart_tren} bar={data?.bar_chart_kecamatan} />
      <RecentLists orders={data?.pengajuan_menunggu} activities={data?.aktivitas_terbaru} />
    </div>
  );
}