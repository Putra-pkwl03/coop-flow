'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import GreetingBanner from './GreetingBanner';
import MenuGrid from './MenuGrid';
import TaskAndActivities from './TaskAndActivities';
import SummaryAndActivities from './SummaryAndActivities';
import TipsAlert from './TipsAlert';

interface OverviewContentProps {
  adminName: string;
}

export default function OverviewContent({ adminName }: OverviewContentProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin-lapangan/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Gagal mengambil data dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Bagian Sapaan Atas */}
      <GreetingBanner adminName={adminName} />

      {/* 2. Bagian Menu Utama */}
      <MenuGrid />

      {/* 3. Bagian Grafik Komoditas & Peta GIS */}
      <TaskAndActivities
        chartSeries={dashboardData?.commodity_chart?.chart_series}
        topCards={dashboardData?.commodity_chart?.top_cards}
        isLoading={loading}
      />

      {/* 4. Bagian Ringkasan Aktivitas & Timeline Aktivitas */}
      <SummaryAndActivities
        summary={dashboardData?.summary}
        recentActivities={dashboardData?.recent_activities}
        isLoading={loading}
      />

      {/* 5. Bagian Tips Informasi Penutup */}
      <TipsAlert />
    </div>
  );
}