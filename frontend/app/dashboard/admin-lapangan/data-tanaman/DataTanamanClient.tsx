'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FaWifi, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../../lib/axios'; 

import { Farmer } from '@/app/types/farmer';
import { Toast, confirmDialog } from '@/app/lib/toast';
import PlantDetailSkeleton from '../../../components/dashboard/data-tanaman/PlantDetailSkeleton';

// 🌟 IMPORT DEXIE DB & SYNC ENGINE UNTUK PWA OFFLINE MODE
import { db } from '../../../lib/db';
import { syncOfflineData } from '../../../lib/syncEngine';

const FarmerListPanel = dynamic(
  () => import('../../../components/dashboard/data-tanaman/FarmerListPanel'),
  { ssr: false }
);

const FarmerPlantDetail = dynamic(
  () => import('../../../components/dashboard/data-tanaman/FarmerPlantDetail'),
  { ssr: false }
);

export default function DataTanamanClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [adminName, setAdminName] = useState('Andi');
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFarmer, setSearchFarmer] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // 🌟 STATE MONITORING KONEKSI INTERNET/SERVER
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // -------------------------------------------------------------
  // 1. MONITORING KONEKSI REAL-TIME & AUTO SYNC
  // -------------------------------------------------------------
  useEffect(() => {
    setIsMounted(true);

    if (typeof window === 'undefined') return;

    const checkActualConnection = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
        return;
      }

      try {
        const response = await fetch(`/api/health?t=${Date.now()}`, { 
          method: 'HEAD',
          cache: 'no-store'
        });
        setIsOnline(response.ok);
      } catch (err) {
        setIsOnline(false);
      }
    };

    checkActualConnection();

    const handleOnline = async () => {
      await checkActualConnection();
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        await syncOfflineData();
        await fetchFarmers();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const intervalId = setInterval(checkActualConnection, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // -------------------------------------------------------------
  // 2. FETCH DATA PETANI & TANAMAN (HYBRID: ONLINE API / OFFLINE INDEXEDDB)
  // -------------------------------------------------------------
  const fetchFarmers = async () => {
    setLoading(true);
    const isOnlineNow = typeof navigator !== 'undefined' && navigator.onLine && isOnline;

    if (isOnlineNow) {
      try {
        const response = await api.get('/farmers');
        if (response.data && response.data.success) {
          const apiFarmers = response.data.data;
          setFarmers(apiFarmers);

          // Sync data yang baru didapat ke Cache Dexie
          if (db?.farmers) {
            await db.farmers.clear();
            await db.farmers.bulkPut(apiFarmers);
          }
        }
      } catch (error) {
        console.warn("Koneksi API bermasalah, memuat data dari Dexie IndexedDB...", error);
        await loadFarmersFromIndexedDB();
      } finally {
        setLoading(false);
      }
    } else {
      await loadFarmersFromIndexedDB();
      setLoading(false);
    }
  };

  const loadFarmersFromIndexedDB = async () => {
    if (db?.farmers) {
      const localFarmers = await db.farmers.toArray();
      setFarmers(localFarmers as unknown as Farmer[]);
    }
  };

  useEffect(() => {
    fetchFarmers();

    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('user_profile');
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          if (parsed.name) setAdminName(parsed.name);
        } catch (e) {
          console.error('Gagal parse user_profile', e);
        }
      }
    }
  }, []);

  const handleSelectFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsAdding(false);
  };

const updateFarmerState = async (updatedLands: any[]) => {
  if (!selectedFarmer) return;

  const updatedFarmer = { 
    ...selectedFarmer, 
    lands: updatedLands 
  };
  
  const updatedFarmersList = farmers.map(f => f.id === selectedFarmer.id ? updatedFarmer : f);

  setFarmers(updatedFarmersList);
  setSelectedFarmer(updatedFarmer);
  setIsAdding(false);

  // Perbarui IndexedDB lokal
  if (db?.farmers) {
    // 🌟 Cast ke unknown as any untuk menghindari konflik tipe IndexedDB vs UI Farmer
    await db.farmers.put(updatedFarmer as unknown as any);
  }
};

  // -------------------------------------------------------------
  // 3. TAMBAH TANAMAN (ONLINE / OFFLINE QUEUE)
  // -------------------------------------------------------------
  const handleSavePlant = async (newData: any) => {
    if (!selectedFarmer) return;

    const isOnlineNow = typeof navigator !== 'undefined' && navigator.onLine && isOnline;

    if (isOnlineNow) {
      try {
        const response = await api.post('/plants', newData);
        if (response.data && response.data.success) {
          const savedPlantsFromDB = response.data.data; 
          const updatedLands = selectedFarmer.lands.map((land) => {
            if (land.id === newData.land_id) {
              return {
                ...land,
                plants: [...(land.plants || []), ...(Array.isArray(savedPlantsFromDB) ? savedPlantsFromDB : [savedPlantsFromDB])], 
                updated_at: new Date().toISOString(),
              };
            }
            return land;
          });

          await updateFarmerState(updatedLands);
          Toast.fire({ icon: 'success', title: 'Varietas berhasil disimpan!' });
        }
      } catch (error: any) {
        console.warn("Gagal simpan online, mengalihkan ke antrean offline...", error);
        await savePlantOffline(newData);
      }
    } else {
      await savePlantOffline(newData);
    }
  };

  const savePlantOffline = async (newData: any) => {
    if (!selectedFarmer) return;

    const tempPlantId = `temp_plant_${Date.now()}`;
    const newPlantRecord = {
      id: tempPlantId,
      ...newData,
      created_at: new Date().toISOString()
    };

    const updatedLands = selectedFarmer.lands.map((land) => {
      if (land.id === newData.land_id) {
        return {
          ...land,
          plants: [...(land.plants || []), newPlantRecord],
          updated_at: new Date().toISOString()
        };
      }
      return land;
    });

    await updateFarmerState(updatedLands);

    // Antrean Sync Queue
    if (db?.syncQueue) {
      await db.syncQueue.add({
        table_name: 'plants',
        endpoint: '/plants',
        method: 'POST',
        action: 'CREATE',
        payload: newData,
        created_at: new Date().toISOString()
      });
    }

    Toast.fire({
      icon: 'warning',
      title: 'Tersimpan Offline',
      text: 'Data varietas disimpan di HP dan akan disinkronkan saat online.'
    });
  };

  // -------------------------------------------------------------
  // 4. UPDATE TANAMAN (ONLINE / OFFLINE QUEUE)
  // -------------------------------------------------------------
  const handleUpdatePlant = async (plantId: string | number, updatedData: any) => {
    if (!selectedFarmer) return;

    const isOnlineNow = typeof navigator !== 'undefined' && navigator.onLine && isOnline;

    if (isOnlineNow) {
      try {
        const response = await api.put(`/plants/${plantId}`, updatedData);
        if (response.data && response.data.success) {
          const updatedLands = selectedFarmer.lands.map((land) => {
            if (land.id === updatedData.land_id) {
              return {
                ...land,
                plants: land.plants?.map((p) => p.id === plantId ? response.data.data : p) || [],
                updated_at: new Date().toISOString(),
              };
            }
            return land;
          });

          await updateFarmerState(updatedLands);
          Toast.fire({ icon: 'success', title: 'Data berhasil diperbarui!' });
        }
      } catch (error: any) {
        console.warn("Gagal update online, mengalihkan ke mode offline...", error);
        await updatePlantOffline(plantId, updatedData);
      }
    } else {
      await updatePlantOffline(plantId, updatedData);
    }
  };

  const updatePlantOffline = async (plantId: string | number, updatedData: any) => {
    if (!selectedFarmer) return;

    const updatedLands = selectedFarmer.lands.map((land) => {
      if (land.id === updatedData.land_id) {
        return {
          ...land,
          plants: land.plants?.map((p) => p.id === plantId ? { ...p, ...updatedData } : p) || [],
          updated_at: new Date().toISOString(),
        };
      }
      return land;
    });

    await updateFarmerState(updatedLands);

    if (db?.syncQueue) {
      await db.syncQueue.add({
        table_name: 'plants',
        endpoint: `/plants/${plantId}`,
        method: 'PUT',
        action: 'UPDATE',
        payload: updatedData,
        created_at: new Date().toISOString()
      });
    }

    Toast.fire({
      icon: 'warning',
      title: 'Perubahan Tersimpan Offline',
      text: 'Perubahan akan dikirim ke server saat terkoneksi internet.'
    });
  };

  // -------------------------------------------------------------
  // 5. HAPUS TANAMAN (ONLINE / OFFLINE QUEUE)
  // -------------------------------------------------------------
  const handleDeletePlant = (plantId: string | number) => {
    confirmDialog('Hapus varietas ini?', 'Data komoditas terpilih akan dihapus permanen.', 'Ya, Hapus')
      .then(async (result) => {
        if (result.isConfirmed && selectedFarmer) {
          const isOnlineNow = typeof navigator !== 'undefined' && navigator.onLine && isOnline;

          const updatedLands = selectedFarmer.lands.map(l => ({
            ...l,
            plants: l.plants?.filter(p => p.id !== plantId) || []
          }));

          if (isOnlineNow) {
            try {
              const response = await api.delete(`/plants/${plantId}`);
              if (response.data && response.data.success) {
                await updateFarmerState(updatedLands);
                Toast.fire({ icon: 'success', title: 'Varietas berhasil dihapus.' });
              }
            } catch (error) {
              await deletePlantOffline(plantId, updatedLands);
            }
          } else {
            await deletePlantOffline(plantId, updatedLands);
          }
        }
      });
  };

  const deletePlantOffline = async (plantId: string | number, updatedLands: any[]) => {
    await updateFarmerState(updatedLands);

    if (db?.syncQueue) {
      await db.syncQueue.add({
        table_name: 'plants',
        endpoint: `/plants/${plantId}`,
        method: 'DELETE',
        action: 'DELETE',
        payload: { id: plantId },
        created_at: new Date().toISOString()
      });
    }

    Toast.fire({ icon: 'warning', title: 'Dihapus dalam mode offline.' });
  };

  const handleDeleteAllPlants = (landId: number, plantIds: (string | number)[]) => {
    confirmDialog('Hapus semua varietas?', `Seluruh (${plantIds.length}) tanaman pada lahan ini akan dibersihkan.`, 'Ya, Kosongkan')
      .then(async (result) => {
        if (result.isConfirmed && selectedFarmer) {
          const isOnlineNow = typeof navigator !== 'undefined' && navigator.onLine && isOnline;
          const updatedLands = selectedFarmer.lands.map(l => l.id === landId ? { ...l, plants: [] } : l);

          if (isOnlineNow) {
            try {
              await Promise.all(plantIds.map(id => api.delete(`/plants/${id}`)));
              await updateFarmerState(updatedLands);
              Toast.fire({ icon: 'success', title: 'Lahan berhasil dikosongkan.' });
            } catch (error) {
              await deleteAllPlantsOffline(plantIds, updatedLands);
            }
          } else {
            await deleteAllPlantsOffline(plantIds, updatedLands);
          }
        }
      });
  };

  const deleteAllPlantsOffline = async (plantIds: (string | number)[], updatedLands: any[]) => {
    await updateFarmerState(updatedLands);

    if (db?.syncQueue) {
      for (const id of plantIds) {
        await db.syncQueue.add({
          table_name: 'plants',
          endpoint: `/plants/${id}`,
          method: 'DELETE',
          action: 'DELETE',
          payload: { id },
          created_at: new Date().toISOString()
        });
      }
    }

    Toast.fire({ icon: 'warning', title: 'Pembersihan lahan masuk antrean offline.' });
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6">
        <PlantDetailSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-800 antialiased font-sans pb-12">
      {/* HEADER TOPBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin-lapangan" className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-800 shadow-sm transition flex items-center justify-center">
            <FaArrowLeft className="text-sm" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Komoditas & Data Tanaman Petani</h1>
            <p className="text-xs text-zinc-500 font-medium">Pencatatan jenis varietas tanaman aktif per komoditas garapan petani</p>
          </div>
        </div>

        {/* INDIKATOR KONEKSI REAL-TIME */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm self-start sm:self-auto transition-colors ${
          isOnline 
            ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
            : 'bg-amber-50 border border-amber-200 text-amber-700 animate-pulse'
        }`}>
          {isOnline ? <FaWifi /> : <FaExclamationTriangle />}
          <span>{isOnline ? 'Koneksi Server Aktif' : 'Mode Offline (PWA Active)'}</span>
        </div>
      </div>

      {loading ? (
        <PlantDetailSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5">
            <FarmerListPanel 
              farmers={farmers} 
              searchFarmer={searchFarmer} 
              setSearchFarmer={setSearchFarmer}
              selectedFarmer={selectedFarmer} 
              onSelectFarmer={handleSelectFarmer}
            />
          </div>
          <div className="lg:col-span-7 bg-white p-4 rounded-2xl border-zinc-100 border shadow-sm">
            <FarmerPlantDetail 
              selectedFarmer={selectedFarmer} 
              isAdding={isAdding} 
              setIsAdding={setIsAdding}
              onSavePlant={handleSavePlant} 
              onDeletePlant={handleDeletePlant}
              onDeleteAllPlantsInLand={handleDeleteAllPlants} 
              onUpdatePlant={handleUpdatePlant} 
            />
          </div>
        </div>
      )}
    </div>
  );
}