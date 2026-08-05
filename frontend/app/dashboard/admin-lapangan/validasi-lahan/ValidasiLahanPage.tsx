'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaWifi, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import dynamicImport from 'next/dynamic';
import api from '../../../lib/axios'; 

// 🌟 IMPORT DEXIE DB & SYNC ENGINE UNTUK PWA OFFLINE MODE
import { db } from '../../../lib/db';
import { syncOfflineData } from '../../../lib/syncEngine';

import ValidationFarmerList from '@/app/components/dashboard/land-validation/ValidationFarmerList';
import ValidationForm from '@/app/components/dashboard/land-validation/ValidationForm';
import EmptyValidationState from '@/app/components/dashboard/land-validation/EmptyValidationState';

// 🌟 DYNAMIC IMPORT DENGAN SSR DISABLE UNTUK KOMPONEN PETA
const MapWorkspace = dynamicImport(
  () => import('@/app/components/dashboard/land-validation/MapWorkspace'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-zinc-100 animate-pulse rounded-2xl flex flex-col items-center justify-center text-zinc-400 gap-2 border border-zinc-200">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold">Memuat Peta Geospasial...</span>
      </div>
    )
  }
);

export interface Land {
  id: number | string;
  farmer_id?: number | string;
  land_name: string;
  area: string | number;
  unit?: string;
  status?: string; 
  location_address?: string;
  polygon_coordinates?: [number, number][]; 
  village_id?: string; 
  province_id?: string;
  city_id?: string;
  district_id?: string;
}

export interface Farmer {
  id: number | string;
  user_id: number;
  farmer_group_id?: number; 
  farmer_group?: {      
    id: number;
    name: string;
    description?: string;
  };
  nik: string;
  province_id?: string;  
  city_id?: string;      
  district_id?: string;  
  village_id?: string;   
  total_land_area: string | number;
  notes?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string | null;
  };
  lands?: Land[];
  status?: string; 
  village?: {
    id: string;
    code: string;
    name: string;
    meta?: {
      lat: string;
      long: string;
      pos: string;
    }
  };
}

export default function ValidasiLahanPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Andi');
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'belum' | 'sudah'>('belum');
  
  // 🌟 STATE STATUS KONEKSI ONLINE / OFFLINE
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const isReMappingRef = useRef<boolean>(false);
  const previousTabRef = useRef<'belum' | 'sudah'>('belum');
  
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedLand, setSelectedLand] = useState<Land | null>(null);

  const [plantingDate, setPlantingDate] = useState('2026-11-20');
  const [areaHectares, setAreaHectares] = useState('0');
  const [polygonCoordinates, setPolygonCoordinates] = useState<[number, number][]>([]);

  // 1. MONITOR KONEKSI INTERNET SECARA REAL-TIME
  useEffect(() => {
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
        
        if (response.ok) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
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

  useEffect(() => {
    if (isReMappingRef.current) {
      isReMappingRef.current = false;
      setPolygonCoordinates([]);
      previousTabRef.current = activeTab;
      return; 
    }

    if (previousTabRef.current !== activeTab) {
      setSelectedFarmer(null);
      setSelectedLand(null);
      setPolygonCoordinates([]);
      previousTabRef.current = activeTab;
    }
  }, [activeTab]);

  const handlePolygonUpdate = (coords: [number, number][]) => {
    setPolygonCoordinates(coords);
    if (coords.length >= 3) {
      const calculatedArea = (coords.length * 0.12).toFixed(2);
      setAreaHectares(calculatedArea);
    } else {
      if (selectedLand) setAreaHectares(parseFloat(selectedLand.area as string).toString());
    }
  };

  // 2. FETCH DATA PETANI (SUPPORT HYBRID: API + INDEXEDDB)
  const fetchFarmers = async () => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const response = await api.get('/farmers');
        if (response.data.success) {
          const apiFarmers: Farmer[] = response.data.data;
          setFarmers(apiFarmers);

          // 💾 SIMPAN DATA KE CACHE INDEXEDDB LOKAL
          if (db?.farmers) {
            await db.farmers.clear();
            await db.farmers.bulkPut(apiFarmers as any);
          }
        }
      } catch (error) {
        console.warn("Gagal koneksi server, mengambil dari IndexedDB lokal...", error);
        await loadFromLocalIndexedDB();
      }
    } else {
      await loadFromLocalIndexedDB();
    }
  };

  const loadFromLocalIndexedDB = async () => {
    if (db?.farmers) {
      const localFarmers = await db.farmers.toArray();
      setFarmers(localFarmers as any);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('user_profile');
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          if (parsed.name) setAdminName(parsed.name);
        } catch (e) {
          console.error(e);
        }
      }
      fetchFarmers();
    }
  }, []);

  const handleSelectLandForMapping = (farmer: Farmer, land: Land) => {
    setSelectedFarmer(farmer);
    setSelectedLand(land);
    setAreaHectares(parseFloat(land.area as string).toString());
    
    if (land.polygon_coordinates && land.polygon_coordinates.length > 0) {
      setPolygonCoordinates(land.polygon_coordinates);
    } else {
      setPolygonCoordinates([]); 
    }
  };

  const handleTabChange = (tab: 'belum' | 'sudah') => {
    setSelectedFarmer(null);
    setSelectedLand(null);
    setPolygonCoordinates([]);
    setActiveTab(tab);
  };

  // 3. HANDLER SAVE MAPPING
  const handleSaveMapping = async (
    eOrClimateData: React.FormEvent | any, 
    optionalClimateData?: any
  ) => {
    let agroClimateData = optionalClimateData;

    if (eOrClimateData && typeof eOrClimateData.preventDefault === 'function') {
      eOrClimateData.preventDefault();
    } else if (eOrClimateData && !optionalClimateData) {
      agroClimateData = eOrClimateData;
    }

    if (!selectedFarmer || !selectedLand) return;

    const payload = {
      name: (selectedFarmer.user?.name || '').trim(),
      email: (selectedFarmer.user?.email || '').trim(),
      phone: selectedFarmer.user?.phone || null,
      address: selectedFarmer.user?.address || null,
      farmer_group_id: selectedFarmer.farmer_group?.id || null,
      nik: String(selectedFarmer.nik).trim(),
      notes: selectedFarmer.notes || null,
      
      lands: selectedFarmer.lands?.map((land) => {
        if (land.id === selectedLand.id) {
          return {
            id: land.id, 
            land_name: land.land_name,
            area: parseFloat(areaHectares) || 0, 
            unit: land.unit || 'Hektar(Ha)', 
            status: land.status || 'Milik Sendiri', 
            location_address: land.location_address || null,
            polygon_coordinates: polygonCoordinates, 
            planting_date: plantingDate, 

            center_latitude: agroClimateData?.center_latitude || null,
            center_longitude: agroClimateData?.center_longitude || null,
            average_temperature: agroClimateData?.average_temperature || null,
            average_humidity: agroClimateData?.average_humidity || null,
            average_monthly_precipitation: agroClimateData?.average_monthly_precipitation || null,
          };
        }
        
        return {
          id: land.id, 
          land_name: land.land_name,
          area: parseFloat(land.area as string) || 0,
          unit: land.unit || 'Hektar(Ha)', 
          status: land.status || 'Milik Sendiri', 
          location_address: land.location_address || null,
          polygon_coordinates: land.polygon_coordinates || null, 
          center_latitude: (land as any).center_latitude || null,
          center_longitude: (land as any).center_longitude || null,
          average_temperature: (land as any).average_temperature || null,
          average_humidity: (land as any).average_humidity || null,
          average_monthly_precipitation: (land as any).average_monthly_precipitation || null,
        };
      }) || []
    };

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const response = await api.put(`/farmers/${selectedFarmer.id}`, payload);

        if (response.data.success) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Geospasial "${selectedLand.land_name}" berhasil disinkronisasi!`,
            showConfirmButton: false,
            timer: 3000
          });

          resetWorkspace();
          await fetchFarmers(); 
        }
      } catch (error: any) {
        console.error("Gagal sinkronisasi ke backend online", error);
        await saveToOfflineQueue(payload);
      }
    } else {
      await saveToOfflineQueue(payload);
    }
  };

  // 🛠️ FUNGSI PENYIMPANAN OFFLINE DENGAN LOGIKA PENANGANAN ID LOKAL/ONLINE
const saveToOfflineQueue = async (payload: any) => {
  try {
    if (!selectedFarmer || !selectedLand) return;

    // 1. Update State React Lokal
    const updatedFarmers = farmers.map((f) => {
      if (f.id === selectedFarmer.id) {
        return {
          ...f,
          lands: payload.lands
        };
      }
      return f;
    });

    setFarmers(updatedFarmers);

    // 2. Simpan atau Update ke IndexedDB (Dexie) Lokal
    if (db?.farmers) {
      const targetFarmer = updatedFarmers.find(f => f.id === selectedFarmer.id);
      if (targetFarmer) {
        // Menggunakan put spesifik objek agar tidak merusak record lain
        await db.farmers.put(targetFarmer as any);
      }
    }

    // 3. Masukkan ke Antrean Sinkronisasi (Sync Queue)
    if (db?.syncQueue) {
      // Cek apakah ID bersifat sementara (misal dibuat secara offline)
      const isTemporaryId = typeof selectedFarmer.id === 'string' && selectedFarmer.id.startsWith('temp_');

      await db.syncQueue.add({
        table_name: 'farmers',
        endpoint: `/farmers/${selectedFarmer.id}`,
        method: isTemporaryId ? 'POST' : 'PUT', // Gunakan POST jika baru, PUT jika update
        action: isTemporaryId ? 'CREATE' : 'UPDATE',
        payload: payload,
        created_at: new Date().toISOString()
      });
    }

    // 4. Notifikasi Toast ke Admin Lapangan
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: '📱 Data Tersimpan di HP (Offline)',
      text: `Validasi lahan "${selectedLand.land_name}" masuk antrean offline. Akan tersinkronisasi otomatis saat mendapat sinyal!`,
      showConfirmButton: false,
      timer: 4000
    });

    resetWorkspace();
  } catch (err) {
    console.error("Gagal menyimpan data offline:", err);
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan Local',
      text: 'Terjadi kesalahan saat menyimpan data ke penyimpanan HP.'
    });
  }
};
 
  const resetWorkspace = () => {
    setSelectedFarmer(null);
    setSelectedLand(null);
    setPolygonCoordinates([]);
    
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-800 antialiased font-sans pb-12">
      {/* TOPBAR HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard/admin-lapangan')}
            className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-800 shadow-sm transition cursor-pointer"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Validasi Lahan Geospasial</h1>
            <p className="text-xs text-zinc-500 font-medium">Filter lahan belum atau sudah dimapping sebelum melakukan validasi fisik</p>
          </div>
        </div>
        
        {/* INDICATOR STATUS KONEKSI */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm self-start sm:self-auto transition-colors ${
          isOnline 
            ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
            : 'bg-amber-50 border border-amber-200 text-amber-700 animate-pulse'
        }`}>
          {isOnline ? <FaWifi /> : <FaExclamationTriangle />}
          <span>{isOnline ? 'Koneksi Server Aktif' : 'Mode Offline (PWA Active)'}</span>
        </div>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* PANEL KIRI: DAFTAR PETANI */}
        <div className="lg:col-span-5 sticky top-6">
          <ValidationFarmerList 
            farmers={farmers}
            selectedFarmer={selectedFarmer}
            selectedLand={selectedLand}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectLand={handleSelectLandForMapping}
            activeTab={activeTab}
            setActiveTab={handleTabChange} 
          />
        </div>

        {/* PANEL KANAN: WORKSPACE AREA */}
        <div className="lg:col-span-7">
          {selectedFarmer && selectedLand ? (
            <div className="flex flex-col space-y-4 bg-white border p-6 shadow-sm border-zinc-100 rounded-2xl">
              <ValidationForm 
                selectedFarmer={selectedFarmer}
                selectedLand={selectedLand as any}
                areaHectares={areaHectares}
                setAreaHectares={setAreaHectares}
                plantingDate={plantingDate}
                setPlantingDate={setPlantingDate}
                onSubmit={handleSaveMapping}
                onCancel={resetWorkspace}
                
                mapWorkspaceComponent={
                  <MapWorkspace 
                    onPolygonChange={handlePolygonUpdate} 
                    initialPolygon={polygonCoordinates} 
                    allFarmersData={farmers} 
                    selectedLandId={selectedLand?.id || null} 
                    selectedLandData={selectedLand}
                    onSelectLandDirectly={handleSelectLandForMapping}
                    activeTab={activeTab} 
                    calculatedAreaText={areaHectares}
                    onTriggerReMapping={() => {
                      isReMappingRef.current = true; 
                      setActiveTab('belum');        
                    }}
                    onSave={handleSaveMapping}
                    onCancel={resetWorkspace}
                  />
                }
              />
            </div>
          ) : (
            <div className="w-full rounded-2xl bg-white shadow-sm p-8.5 min-h-100 flex items-center justify-center text-center">
              <EmptyValidationState />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}