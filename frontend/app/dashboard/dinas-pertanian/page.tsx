"use client";

import React, { useEffect, useState } from "react";
import api from "@/app/lib/axios"; 

import WelcomeBanner from "@/app/components/dashboard/dinas/WelcomeBanner";
import ActionCards from "@/app/components/dashboard/dinas/ActionCards";
import StatsGrid from "@/app/components/dashboard/dinas/StatsGrid";
import DashboardCharts from "@/app/components/dashboard/dinas/DashboardCharts";
import RecentLists from "@/app/components/dashboard/dinas/RecentLists";

// Component Sub-Skeleton UI
function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8 animate-pulse">
      {/* 1. Welcome Banner Skeleton */}
      <div className="w-full h-32 bg-zinc-200/80 rounded-3xl" />

      {/* 2. Action Cards Skeleton (2 Card Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-28 bg-zinc-200/80 rounded-3xl p-6 flex items-center space-x-5">
          <div className="w-16 h-16 bg-zinc-300 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-300 rounded w-1/2" />
            <div className="h-3 bg-zinc-300/70 rounded w-3/4" />
            <div className="h-3 bg-zinc-300 rounded w-1/3 pt-1" />
          </div>
        </div>
        <div className="h-28 bg-zinc-200/80 rounded-3xl p-6 flex items-center space-x-5">
          <div className="w-16 h-16 bg-zinc-300 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-300 rounded w-1/2" />
            <div className="h-3 bg-zinc-300/70 rounded w-3/4" />
            <div className="h-3 bg-zinc-300 rounded w-1/3 pt-1" />
          </div>
        </div>
      </div>

      {/* 3. Stats Grid Skeleton (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-zinc-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-zinc-300 rounded w-1/2" />
              <div className="w-8 h-8 bg-zinc-300 rounded-xl" />
            </div>
            <div className="h-6 bg-zinc-300 rounded w-2/3" />
            <div className="h-3 bg-zinc-300/60 rounded w-1/3" />
          </div>
        ))}
      </div>

      {/* 4. Charts Skeleton (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-zinc-200/80 rounded-2xl p-5 space-y-4">
          <div className="h-4 bg-zinc-300 rounded w-1/3" />
          <div className="h-72 bg-zinc-300/50 rounded-xl" />
        </div>
        <div className="h-96 bg-zinc-200/80 rounded-2xl p-5 space-y-4">
          <div className="h-4 bg-zinc-300 rounded w-1/2" />
          <div className="h-72 bg-zinc-300/50 rounded-xl" />
        </div>
      </div>

      {/* 5. Recent Lists Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-zinc-200/80 rounded-2xl p-5 space-y-4">
          <div className="h-4 bg-zinc-300 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-300/60 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="h-80 bg-zinc-200/80 rounded-2xl p-5 space-y-4">
          <div className="h-4 bg-zinc-300 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-300/60 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    return <DashboardSkeleton />;
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
      <WelcomeBanner adminName={data?.user?.name} />
      <ActionCards validasiCount={data?.badges?.validasi_pengadaan_count || 0} />
      <StatsGrid metrics={data?.metrics} />
      <DashboardCharts
        petaSebaran={data?.peta_sebaran}
        donut={data?.donut_chart}
        line={data?.line_chart_tren}
        bar={data?.bar_chart_kecamatan}
      />
      <RecentLists
        orders={data?.pengajuan_menunggu}
        activities={data?.aktivitas_terbaru}
      />
    </div>
  );
}