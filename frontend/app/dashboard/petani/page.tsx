'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaHome, FaMapMarkedAlt, FaSeedling, FaReceipt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '@/app/lib/axios';

// DEXIE DB & SYNC ENGINE
import { db } from '@/app/lib/db';
import { syncOfflineData } from '@/app/lib/syncEngine';

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
    </div>
  );
}

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
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // 1. HELPER LOAD OFFLINE DATA DARI INDEXEDDB
  const loadLocalDashboard = useCallback(async () => {
    if (db?.petaniDashboard) {
      const cached = await db.petaniDashboard.get('petani_summary');
      if (cached) {
        setData(cached);
        setError(null);
      }
    }
  }, []);

  const loadLocalLands = useCallback(async () => {
    if (db?.lands) {
      const cachedLands = await db.lands.toArray();
      if (cachedLands.length > 0) setLandsData(cachedLands);
    }
  }, []);

  const loadLocalFertilizers = useCallback(async () => {
    if (db?.fertilizers) {
      const cachedFertilizers = await db.fertilizers.toArray();
      if (cachedFertilizers.length > 0) setFertilizersData(cachedFertilizers);
    }
  }, []);

  const loadLocalTransactions = useCallback(async () => {
    if (db?.transactions) {
      const cachedTx = await db.transactions.toArray();
      if (cachedTx.length > 0) setTransactionsData(cachedTx);
    }
  }, []);

  // 2. FETCH DASHBOARD UTAMA (Mencegah Flashing)
  const fetchDashboard = useCallback(async () => {
    // 💡 Muat dulu data lokal secara silent jika data state belum ada
    if (!data) {
      await loadLocalDashboard();
    }

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        // Hanya munculkan skeleton jika benar-benar belum punya data sama sekali
        if (!data) setLoading(true);

        const response = await api.get('/farmer/dashboard-summary');
        const apiData = response.data.data;
        setData(apiData);
        setError(null);

        if (db?.petaniDashboard) {
          await db.petaniDashboard.put({
            id: 'petani_summary',
            ...apiData,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.warn('Gagal koneksi API dashboard, memuat cache offline...', err);
        await loadLocalDashboard();
      } finally {
        setLoading(false);
      }
    } else {
      await loadLocalDashboard();
      setLoading(false);
    }
  }, [loadLocalDashboard, data]);

  // 3. MONITOR KONEKSI & AUTO-SYNC AUTOMATION (DIPERBAIKI)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const triggerSync = async () => {
      const synced = await syncOfflineData();
      if (synced) {
        await fetchDashboard();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: '🔄 Data lokal berhasil disinkronkan!',
          showConfirmButton: false,
          timer: 3000
        });
      }
    };

    const checkActualConnection = async () => {
      // 💡 JIKA BROWSER SUDAH OFFLINE, JANGAN LAKUKAN FETCH HEALTH CHECK
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
        return;
      }

      try {
        const response = await fetch(`/api/health?t=${Date.now()}`, { 
          method: 'HEAD',
          cache: 'no-store'
        });
        
        const isHealthy = response.ok;
        setIsOnline(prev => {
          if (!prev && isHealthy) triggerSync();
          return isHealthy;
        });
      } catch (err) {
        // Hanya set state jika sebelumnya bernilai true agar tidak re-render tak terbatas
        setIsOnline(prev => (prev ? false : prev));
      }
    };

    // Jalankan awal
    checkActualConnection();

    const handleOnline = async () => {
      setIsOnline(true);
      await triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Polling setiap 15 detik HANYA JIKA navigator.onLine bernilai true
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkActualConnection();
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [fetchDashboard]);

  // Initial load
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Fetch data lahan
  useEffect(() => {
    if (currentView === 'lands') {
      const fetchLands = async () => {
        await loadLocalLands(); // Muat lokal dulu tanpa loading
        if (navigator.onLine) {
          try {
            const res = await api.get('/farmer/my-lands');
            const result = res.data.data || [];
            setLandsData(result);
            if (db?.lands && result.length > 0) {
              await db.transaction('rw', db.lands, async () => {
                await db.lands.clear();
                await db.lands.bulkPut(result);
              });
            }
          } catch (err) {
            console.warn('Gagal memuat lahan online', err);
          }
        }
      };
      fetchLands();
    }
  }, [currentView, loadLocalLands]);

  // Fetch data pupuk
  useEffect(() => {
    if (currentView === 'fertilizers') {
      const fetchFertilizers = async () => {
        await loadLocalFertilizers();
        if (navigator.onLine) {
          try {
            const res = await api.get('/farmer/fertilizers');
            const result = res.data.data || [];
            setFertilizersData(result);
            if (db?.fertilizers && result.length > 0) {
              await db.transaction('rw', db.fertilizers, async () => {
                await db.fertilizers.clear();
                await db.fertilizers.bulkPut(result);
              });
            }
          } catch (err) {
            console.warn('Gagal memuat pupuk online', err);
          }
        }
      };
      fetchFertilizers();
    }
  }, [currentView, loadLocalFertilizers]);

  // Fetch data transaksi
  useEffect(() => {
    if (currentView === 'transactions') {
      const fetchTransactions = async () => {
        await loadLocalTransactions();
        if (navigator.onLine) {
          try {
            const res = await api.get('/farmer/transactions'); 
            const result = res.data.data || [];
            setTransactionsData(result);
            if (db?.transactions && result.length > 0) {
              await db.transaction('rw', db.transactions, async () => {
                await db.transactions.clear();
                await db.transactions.bulkPut(result);
              });
            }
          } catch (err) {
            console.warn('Gagal memuat transaksi online', err);
          }
        }
      };
      fetchTransactions();
    }
  }, [currentView, loadLocalTransactions]);

  const navigateTo = (viewName: string) => {
    if (viewName === 'home') {
      router.push('/dashboard/petani');
    } else {
      router.push(`?view=${viewName}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto font-sans bg-slate-50 min-h-screen relative pb-28 px-3">
      {loading && !data ? (
        <DashboardSkeleton />
      ) : error && !data ? (
        <div className="w-full p-8 text-center text-red-500 text-sm font-medium min-h-[60vh] flex items-center justify-center">
          {error}
        </div>
      ) : (
        <>
          {currentView === 'lands' ? (
            <LandsView lands={landsData} />
          ) : currentView === 'fertilizers' ? (
            <FertilizersView fertilizers={fertilizersData} />
          ) : currentView === 'transactions' ? (
            <TransactionsView transactions={transactionsData} />
          ) : (
            <div className="space-y-5">
              {data && (
                <>
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
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* BOTTOM NAVIGATION BAR MOBILE */}
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

export default function PetaniDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PetaniDashboardContent />
    </Suspense>
  );
}