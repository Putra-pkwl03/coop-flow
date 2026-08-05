'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaHome, FaMapMarkedAlt, FaSeedling, FaReceipt } from 'react-icons/fa';
import api from '@/app/lib/axios';
import FarmerHeader from '@/app/components/dashboard/petani/PetaniHeaderWeather';
import SummaryCards from '@/app/components/dashboard/petani/SummaryCards';
import QuickMenu from '@/app/components/dashboard/petani/QuickActions';
import CalendarSection from '@/app/components/dashboard/petani/CalendarSection';
import RecentActivities from '@/app/components/dashboard/petani/RecentActivities';
import LandsView from '@/app/components/dashboard/petani/LandsView';
import FertilizersView from '@/app/components/dashboard/petani/FertilizersView'; 
import TransactionsView from '@/app/components/dashboard/petani/TransactionsView'; 

interface DashboardData {
  profile: {
    name: string;
    role: string;
    avatar: string | null;
    village: string;
  };
  summary: {
    total_land_ha: number;
    fertilizer_received_kg: number;
    total_transactions: number;
    main_commodity: string;
  };
  recent_activities: Array<any>;
  calendars: {
    planting: Array<any>;
    fertilizer: Array<any>;
  };
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="bg-slate-200 h-24 rounded-3xl w-full" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded-md w-32" />
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-200 h-20 rounded-2xl" />
          <div className="bg-slate-200 h-20 rounded-2xl" />
          <div className="bg-slate-200 h-20 rounded-2xl" />
          <div className="bg-slate-200 h-20 rounded-2xl" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded-md w-28" />
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-slate-200 h-32 rounded-2xl" />
          <div className="bg-slate-200 h-32 rounded-2xl" />
          <div className="bg-slate-200 h-32 rounded-2xl" />
          <div className="bg-slate-200 h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// 1. Pindahkan logika utama ke dalam inner component
function PetaniDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = searchParams.get('view') || 'home';

  const [data, setData] = useState<DashboardData | null>(null);
  const [landsData, setLandsData] = useState<Array<any>>([]);
  const [fertilizersData, setFertilizersData] = useState<Array<any>>([]);
  const [transactionsData, setTransactionsData] = useState<Array<any>>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data dashboard utama
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/farmer/dashboard-summary');
        setData(response.data.data);
      } catch (err: any) {
        console.error('Error dashboard:', err);
        setError(err?.response?.data?.message || 'Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch data lahan
  useEffect(() => {
    if (currentView === 'lands') {
      const fetchLands = async () => {
        try {
          const res = await api.get('/farmer/my-lands');
          setLandsData(res.data.data || []);
        } catch (err) {
          console.error('Gagal memuat data lahan:', err);
        }
      };
      fetchLands();
    }
  }, [currentView]);

  // Fetch data pupuk
  useEffect(() => {
    if (currentView === 'fertilizers') {
      const fetchFertilizers = async () => {
        try {
          const res = await api.get('/farmer/fertilizers');
          setFertilizersData(res.data.data || []);
        } catch (err) {
          console.error('Gagal memuat data pupuk:', err);
        }
      };
      fetchFertilizers();
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'transactions') {
      const fetchTransactions = async () => {
        try {
          const res = await api.get('/farmer/transactions'); 
          setTransactionsData(res.data.data || []);
        } catch (err) {
          console.error('Gagal memuat data transaksi:', err);
        }
      };
      fetchTransactions();
    }
  }, [currentView]);

  // Helper fungsi Navigasi
  const navigateTo = (viewName: string) => {
    if (viewName === 'home') {
      router.push('/dashboard/petani');
    } else {
      router.push(`?view=${viewName}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto font-sans bg-slate-50 min-h-screen relative pb-28 px-3">
      
      {loading ? (
        <DashboardSkeleton />
      ) : error || !data ? (
        <div className="w-full p-8 text-center text-red-500 text-sm font-medium min-h-[60vh] flex items-center justify-center">
          {error || 'Data tidak ditemukan.'}
        </div>
      ) : (
        <>
          {/* Kondisi Rendering View berdasarkan Query Params */}
          {currentView === 'lands' ? (
            <LandsView lands={landsData} />
          ) : currentView === 'fertilizers' ? (
            <FertilizersView fertilizers={fertilizersData} />
          ) : currentView === 'transactions' ? (
            <TransactionsView transactions={transactionsData} />
          ) : (
            /* Tampilan Utama Dashboard (Home) */
            <div className="space-y-5">
              <FarmerHeader
                name={data.profile?.name}
                role={data.profile?.role}
                avatar={data.profile?.avatar}
              />

              <SummaryCards
                totalLandHa={data.summary?.total_land_ha}
                fertilizerReceivedKg={data.summary?.fertilizer_received_kg}
                totalTransactions={data.summary?.total_transactions}
                mainCommodity={data.summary?.main_commodity}
              />

              <QuickMenu />

              <CalendarSection calendars={data.calendars} />

              <RecentActivities activities={data.recent_activities} />
            </div>
          )}
        </>
      )}

      {/* 📱 BOTTOM NAVIGATION BAR MOBILE */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-1">
          
          <button
            onClick={() => navigateTo('home')}
            className={`flex flex-col items-center justify-center w-full py-1 transition cursor-pointer ${
              currentView === 'home' ? 'text-emerald-700 font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FaHome className={`text-xl mb-0.5 ${currentView === 'home' ? 'scale-110' : ''} transition`} />
            <span className="text-[10px] tracking-tight">Beranda</span>
          </button>

          <button
            onClick={() => navigateTo('lands')}
            className={`flex flex-col items-center justify-center w-full py-1 transition cursor-pointer ${
              currentView === 'lands' ? 'text-emerald-700 font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FaMapMarkedAlt className={`text-xl mb-0.5 ${currentView === 'lands' ? 'scale-110' : ''} transition`} />
            <span className="text-[10px] tracking-tight">Lahan Saya</span>
          </button>

          <button
            onClick={() => navigateTo('fertilizers')}
            className={`flex flex-col items-center justify-center w-full py-1 transition cursor-pointer ${
              currentView === 'fertilizers' ? 'text-emerald-700 font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FaSeedling className={`text-xl mb-0.5 ${currentView === 'fertilizers' ? 'scale-110' : ''} transition`} />
            <span className="text-[10px] tracking-tight">Pupuk KDKMP</span>
          </button>

          <button
            onClick={() => navigateTo('transactions')}
            className={`flex flex-col items-center justify-center w-full py-1 transition cursor-pointer ${
              currentView === 'transactions' ? 'text-emerald-700 font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FaReceipt className={`text-xl mb-0.5 ${currentView === 'transactions' ? 'scale-110' : ''} transition`} />
            <span className="text-[10px] tracking-tight">Nota</span>
          </button>

        </div>
      </nav>

    </div>
  );
}

// 2. Export Halaman Utama dengan Suspense Boundary
export default function PetaniDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PetaniDashboardContent />
    </Suspense>
  );
}