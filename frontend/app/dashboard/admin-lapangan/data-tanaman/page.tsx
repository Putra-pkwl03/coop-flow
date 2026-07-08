'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaWifi, FaArrowLeft } from 'react-icons/fa';
import Navbar from '@/app/components/dashboard/Navbar';
import api from '../../../lib/axios'; 

// Import hasil pemecahan komponen & utils
import { Farmer } from '@/app/types/farmer';
import { Toast, confirmDialog } from '@/app/lib/toast';
import PlantDetailSkeleton from '../../../components/dashboard/data-tanaman/PlantDetailSkeleton';
import FarmerListPanel from '../../../components/dashboard/data-tanaman/FarmerListPanel';
import FarmerPlantDetail from '../../../components/dashboard/data-tanaman/FarmerPlantDetail';

export default function DataTanamanPetaniPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Andi');
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFarmer, setSearchFarmer] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/farmers');
        if (response.data && response.data.success) {
          setFarmers(response.data.data);
        }
      } catch (error) {
        console.error('Gagal memuat data petani:', error);
        Toast.fire({ icon: 'error', title: 'Gagal memuat data dari server.' });
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();

    const profile = localStorage.getItem('user_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed.name) setAdminName(parsed.name);
    }
  }, []);

  const handleSelectFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsAdding(false);
  };

  const handleSavePlant = async (newData: { land_id: number; plants: { name: string; planting_date: string }[] }) => {
    if (!selectedFarmer) return;
    try {
      const response = await api.post('/plants', newData);
      if (response.data && response.data.success) {
        const savedPlantsFromDB = response.data.data; 
        const updatedLands = selectedFarmer.lands.map((land) => {
          if (land.id === newData.land_id) {
            return {
              ...land,
              plants: [...(land.plants || []), ...savedPlantsFromDB], 
              updated_at: new Date().toISOString(),
            };
          }
          return land;
        });

        updateFarmerState(updatedLands);
        Toast.fire({ icon: 'success', title: 'Varietas berhasil disimpan!' });
      }
    } catch (error: any) {
      Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Gagal menyimpan varietas.' });
    }
  };

  const handleUpdatePlant = async (plantId: string | number, updatedData: { name: string; planting_date: string; land_id: number }) => {
    if (!selectedFarmer) return;
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

        updateFarmerState(updatedLands);
        Toast.fire({ icon: 'success', title: 'Data berhasil diperbarui!' });
      }
    } catch (error: any) {
      Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Gagal memperbarui data.' });
    }
  };

  const handleDeleteAllPlants = (landId: number, plantIds: (string | number)[]) => {
    confirmDialog('Hapus semua varietas?', `Seluruh (${plantIds.length}) tanaman pada lahan ini akan dibersihkan.`, 'Ya, Kosongkan')
      .then(async (result) => {
        if (result.isConfirmed && selectedFarmer) {
          try {
            await Promise.all(plantIds.map(id => api.delete(`/plants/${id}`)));
            const updatedLands = selectedFarmer.lands.map(l => l.id === landId ? { ...l, plants: [] } : l);
            updateFarmerState(updatedLands);
            Toast.fire({ icon: 'success', title: 'Lahan berhasil dikosongkan.' });
          } catch (error) {
            Toast.fire({ icon: 'error', title: 'Gagal mengosongkan lahan.' });
          }
        }
      });
  };

  const handleDeletePlant = (plantId: string | number) => {
    confirmDialog('Hapus varietas ini?', 'Data komoditas terpilih akan dihapus permanen.', 'Ya, Hapus')
      .then(async (result) => {
        if (result.isConfirmed && selectedFarmer) {
          try {
            const response = await api.delete(`/plants/${plantId}`);
            if (response.data && response.data.success) {
              const updatedLands = selectedFarmer.lands.map(l => ({
                ...l,
                plants: l.plants?.filter(p => p.id !== plantId) || []
              }));
              updateFarmerState(updatedLands);
              Toast.fire({ icon: 'success', title: 'Varietas berhasil dihapus.' });
            }
          } catch (error) {
            Toast.fire({ icon: 'error', title: 'Gagal menghapus data.' });
          }
        }
      });
  };

  // Helper function mengurangi redudansi update state
  const updateFarmerState = (updatedLands: any[]) => {
    if (!selectedFarmer) return;
    setFarmers(farmers.map(f => f.id === selectedFarmer.id ? { ...f, lands: updatedLands } : f));
    setSelectedFarmer({ ...selectedFarmer, lands: updatedLands });
    setIsAdding(false);
  };

return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-800 antialiased font-sans pb-12">
      <Navbar adminName={adminName} roleName="admin-lapangan" handleLogout={() => router.push('/auth/login')} />

      <div className="max-w-8xl mx-auto px-4 sm:px-4 lg:px-13 mt-6">
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
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-center shadow-sm">
            <FaWifi />
            <span>Koneksi Server Aktif</span>
          </div>
        </div>

        {loading ? (
          <PlantDetailSkeleton />
        ) : (
          /* Mengubah pembagian grid menjadi 12 kolom agar Card List Petani memiliki ruang horizontal yang lebar seperti di gambar */
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
    </div>
  );
}