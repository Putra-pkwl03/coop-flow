'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaWifi, FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../../../lib/axios'; 

import FarmerList from '@/app/components/dashboard/farmers/FarmerList';
import FarmerForm from '@/app/components/dashboard/farmers/FarmerForm';
import EmptyState from '@/app/components/dashboard/farmers/EmptyState';

export default function DataPetaniPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Andi');
  const [farmers, setFarmers] = useState([]);
  const [farmerGroups, setFarmerGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // STATE MODAL CUSTOM
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // STATE MASTER WILAYAH UNTUK FILTER (DILUAR FORM)
  const [filterDistricts, setFilterDistricts] = useState([]);
  const [filterVillages, setFilterVillages] = useState([]);

  // STATE MASTER WILAYAH KHUSUS FORM PROFIL/EDIT PETANI
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  // STATE FORM DATA
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    farmer_group_id: '', 
    nik: '',
    province_id: '', 
    city_id: '',
    district_id: '',
    village_id: '',
    notes: '', 
    lands: [
      { 
        id: undefined,
        land_name: '', 
        province_id: '', 
        city_id: '', 
        district_id: '', 
        village_id: '', 
        area: '', 
        unit: 'Hektar(Ha)', 
        status: 'Milik Sendiri',
        current_use: '',
        soil_type: '',
        water_source: '',
        irrigation_type: '',
        ownership_document: '', 
        document_preview: null,
        location_address: ''
      }
    ]
  });

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const fetchFarmers = async () => {
    try {
      const response = await api.get('/farmers');
      if (response.data.success) {
        setFarmers(response.data.data);
        // Pemicu otomatis untuk memuat data wilayah filter berdasarkan data petani yang ada
        fetchGlobalRegionsForFilter(response.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat data petani", error);
    }
  };

  const fetchFarmerGroups = async () => {
    try {
      const response = await api.get('/farmer-groups');
      if (response.data.success) setFarmerGroups(response.data.data);
    } catch (error) {
      console.error("Gagal memuat data kelompok tani", error);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/regional/provinces'); 
      setProvinces(response.data || []);
    } catch (error) {
      console.error("Gagal memuat data provinsi", error);
    }
  };

  /**
   * FUNGSI BARU: Mengambil data kecamatan & desa secara menyeluruh untuk keperluan Filter Dropdown.
   * Anda bisa menyesuaikan endpoint ini jika backend Anda punya route regional global atau berdasarkan City ID tertentu.
   */
  const fetchGlobalRegionsForFilter = async (farmersData: any[]) => {
    try {
      // Opsi 1: Jika admin lapangan memegang kota tertentu, langsung tembak kota tersebut.
      // Misal kita ambil sampel city_id dari petani pertama yang ada jika tersedia
      const sampleCityId = farmersData.find(f => f.city_id)?.city_id || '32.04'; // default kode kota Anda jika kosong

      if (sampleCityId) {
        const resDist = await api.get(`/regional/cities/${sampleCityId}/districts`);
        setFilterDistricts(resDist.data || []);

        // Untuk desa, jika ingin langsung diload semua berdasarkan kecamatan pertama:
        if (resDist.data && resDist.data.length > 0) {
          const firstDistrictCode = resDist.data[0].code;
          const resVill = await api.get(`/regional/districts/${firstDistrictCode}/villages`);
          setFilterVillages(resVill.data || []);
        }
      }
    } catch (error) {
      console.error("Gagal memuat master regional untuk panel filter", error);
    }
  };

  // Handler dinamis untuk perubahan region di dalam komponen Form (Bukan Filter)
  const handleProfileRegionChange = async (type: 'province' | 'city' | 'district' | 'village', code: string) => {
    try {
      if (type === 'province') {
        setFormData(prev => ({ ...prev, province_id: code, city_id: '', district_id: '', village_id: '' }));
        if (!code) {
          setCities([]); setDistricts([]); setVillages([]);
          return;
        }
        const res = await api.get(`/regional/provinces/${code}/cities`);
        setCities(res.data || []);
        setDistricts([]);
        setVillages([]);
      } else if (type === 'city') {
        setFormData(prev => ({ ...prev, city_id: code, district_id: '', village_id: '' }));
        if (!code) {
          setDistricts([]); setVillages([]);
          return;
        }
        const res = await api.get(`/regional/cities/${code}/districts`);
        setDistricts(res.data || []);
        setVillages([]);
      } else if (type === 'district') {
        setFormData(prev => ({ ...prev, district_id: code, village_id: '' }));
        if (!code) {
          setVillages([]);
          return;
        }
        const res = await api.get(`/regional/districts/${code}/villages`);
        setVillages(res.data || []);
      } else if (type === 'village') {
        setFormData(prev => ({ ...prev, village_id: code }));
      }
    } catch (err) {
      console.error(`Gagal memuat region via handler untuk ${type}`, err);
    }
  };


  // Handler khusus untuk perubahan dropdown di panel FILTER (Bukan Form)
  const handleFilterRegionChange = async (type: 'district' | 'village', code: string) => {
    try {
      if (type === 'district') {
        if (!code) {
          setFilterVillages([]);
          return;
        }
        // Ambil data desa terbaru berdasarkan kecamatan yang dipilih pada filter
        const res = await api.get(`/regional/districts/${code}/villages`);
        setFilterVillages(res.data || []);
      }
    } catch (err) {
      console.error(`Gagal memuat desa untuk filter kecamatan ${code}`, err);
    }
  };

  useEffect(() => {
    const profile = localStorage.getItem('user_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed.name) setAdminName(parsed.name);
    }
    fetchFarmers();
    fetchFarmerGroups();
    fetchProvinces(); 
  }, []);

  const handleSelectFarmer = async (farmer: any) => {
    setIsAdding(false);
    setSelectedFarmer(farmer);

    const BACKEND_URL = 'http://localhost:8000'; 

    const cleanProvinceId = farmer.province_id ? farmer.province_id.toString().trim() : '';
    const cleanCityId = farmer.city_id ? farmer.city_id.toString().trim() : '';
    const cleanDistrictId = farmer.district_id ? farmer.district_id.toString().trim() : '';
    const cleanVillageId = farmer.village_id ? farmer.village_id.toString().trim() : '';

    try {
      if (cleanProvinceId) {
        const resCity = await api.get(`/regional/provinces/${cleanProvinceId}/cities`);
        setCities(resCity.data || []);
      }
      if (cleanCityId) {
        const resDist = await api.get(`/regional/cities/${cleanCityId}/districts`);
        setDistricts(resDist.data || []);
      }
      if (cleanDistrictId) {
        const resVill = await api.get(`/regional/districts/${cleanDistrictId}/villages`);
        setVillages(resVill.data || []);
      }
    } catch (error) {
      console.error("Gagal menyinkronkan data regional untuk mode edit", error);
    }

    setFormData({
      name: farmer.user?.name || '',
      email: farmer.user?.email || '',
      phone: farmer.user?.phone || '',
      address: farmer.user?.address || '',
      farmer_group_id: farmer.farmer_group_id ? farmer.farmer_group_id.toString() : '',
      nik: farmer.nik || '',
      province_id: cleanProvinceId, 
      city_id: cleanCityId,
      district_id: cleanDistrictId,
      village_id: cleanVillageId,
      notes: farmer.notes || '', 
      lands: farmer.lands && farmer.lands.length > 0 
        ? farmer.lands.map((l: any) => {
            let fullDocUrl = l.ownership_document || '';
            if (fullDocUrl && !fullDocUrl.startsWith('http')) {
              fullDocUrl = `${BACKEND_URL}${fullDocUrl}`;
            }
            const hasDoc = fullDocUrl !== '';
            return {
              id: l.id, 
              land_name: l.land_name,
              province_id: l.province_id ? l.province_id.toString().trim() : '',
              city_id: l.city_id ? l.city_id.toString().trim() : '',
              district_id: l.district_id ? l.district_id.toString().trim() : '',
              village_id: l.village_id ? l.village_id.toString().trim() : '',
              area: l.area !== undefined && l.area !== null ? l.area.toString() : '',
              unit: l.unit || 'Hektar(Ha)',
              status: l.status || 'Milik Sendiri',
              current_use: l.current_use || '',
              soil_type: l.soil_type || '',
              water_source: l.water_source || '',
              irrigation_type: l.irrigation_type || '',
              ownership_document: fullDocUrl, 
              document_preview: hasDoc ? { 
                name: 'Dokumen Terarsip', 
                type: fullDocUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg', 
                url: fullDocUrl 
              } : null,
              location_address: l.location_address || '',
              notes: l.notes || farmer.notes || ''
            };
          })
        : [{ 
            id: undefined, land_name: '', province_id: '', city_id: '', district_id: '', village_id: '', 
            area: '', unit: 'Hektar(Ha)', status: 'Milik Sendiri', current_use: '', soil_type: '', 
            water_source: '', irrigation_type: '', ownership_document: '', document_preview: null, location_address: '' 
          }]
    });
  };

  const handleInitAdd = () => {
    setSelectedFarmer(null);
    setIsAdding(true);
    setCities([]);
    setDistricts([]);
    setVillages([]);
    setFormData({ 
      name: '', email: '', phone: '', address: '', 
      farmer_group_id: farmerGroups.length > 0 ? (farmerGroups[0] as any).id.toString() : '', 
      nik: '', province_id: '', city_id: '', district_id: '', village_id: '', notes: '',
      lands: [{ 
        id: undefined, land_name: '', province_id: '', city_id: '', district_id: '', village_id: '', 
        area: '', unit: 'Hektar(Ha)', status: 'Milik Sendiri', current_use: '', soil_type: '', 
        water_source: '', irrigation_type: '', ownership_document: '', document_preview: null, location_address: '' 
      }] 
    });
  };

  const handleSaveFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nik.length !== 16) {
      Toast.fire({ icon: 'error', title: 'Format NIK Salah. Harus 16 digit!' });
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('email', formData.email);
    payload.append('phone', formData.phone);
    payload.append('address', formData.address || '');
    payload.append('farmer_group_id', formData.farmer_group_id);
    payload.append('nik', formData.nik);
    payload.append('province_id', formData.province_id);
    payload.append('city_id', formData.city_id);
    payload.append('district_id', formData.district_id);
    payload.append('village_id', formData.village_id);
    payload.append('notes', formData.notes || '');

    if (isAdding) {
      payload.append('password', 'password123');
    } else {
      payload.append('_method', 'PUT');
    }

    (formData.lands || []).forEach((land: any, index: number) => {
      if (land.id) payload.append(`lands[${index}][id]`, land.id.toString());
      payload.append(`lands[${index}][land_name]`, land.land_name || '');
      payload.append(`lands[${index}][province_id]`, land.province_id ? land.province_id.toString() : '');
      payload.append(`lands[${index}][city_id]`, land.city_id ? land.city_id.toString() : '');
      payload.append(`lands[${index}][district_id]`, land.district_id ? land.district_id.toString() : '');
      payload.append(`lands[${index}][village_id]`, land.village_id ? land.village_id.toString() : '');
      
      const parsedArea = land.area ? parseFloat(land.area.toString().replace(',', '.')) : 0;
      payload.append(`lands[${index}][area]`, isNaN(parsedArea) ? '0' : parsedArea.toString());
      
      payload.append(`lands[${index}][unit]`, land.unit || 'Hektar(Ha)');
      payload.append(`lands[${index}][status]`, land.status || 'Milik Sendiri');
      payload.append(`lands[${index}][current_use]`, land.current_use || '');
      payload.append(`lands[${index}][soil_type]`, land.soil_type || '');
      payload.append(`lands[${index}][water_source]`, land.water_source || '');
      payload.append(`lands[${index}][irrigation_type]`, land.irrigation_type || '');
      payload.append(`lands[${index}][location_address]`, land.location_address || '');

      if (land.ownership_document instanceof File) {
        payload.append(`lands[${index}][ownership_document]`, land.ownership_document);
      } else if (typeof land.ownership_document === 'string' && land.ownership_document !== '') {
        payload.append(`lands[${index}][ownership_document]`, land.ownership_document);
      }
    });

    try {
      if (isAdding) {
        await api.post('/farmers', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Toast.fire({ icon: 'success', title: 'Petani baru didaftarkan!' });
      } else if (selectedFarmer) {
        await api.post(`/farmers/${selectedFarmer.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Toast.fire({ icon: 'success', title: 'Profil petani diperbarui!' });
      }
      setIsAdding(false); setSelectedFarmer(null); fetchFarmers(); 
    } catch (error: any) {
      const msg = error.response?.data ? Object.values(error.response.data).flat().join(', ') : 'Terjadi kesalahan sistem.';
      Toast.fire({ icon: 'error', title: msg });
    }
  };

  const handleOpenGroupModal = () => {
    setNewGroupName('');
    setNewGroupDesc('');
    setIsGroupModalOpen(true);
  };

  const handleSaveGroupCustom = async () => {
    if (!newGroupName.trim()) {
      Toast.fire({ icon: 'error', title: 'Nama kelompok tani wajib diisi!' });
      return;
    }

    try {
      const response = await api.post('/farmer-groups', {
        name: newGroupName,
        description: newGroupDesc
      });

      if (response.data.success) {
        Toast.fire({ icon: 'success', title: 'Kelompok Tani Baru berhasil dibuat!' });
        await fetchFarmerGroups();
        setFormData(prev => ({ ...prev, farmer_group_id: response.data.data.id.toString() }));
        setIsGroupModalOpen(false);
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Gagal menyimpan kelompok tani.' });
    }
  };

  const handleDeleteFarmer = async () => {
    if (!selectedFarmer) return;
    Swal.fire({
      title: 'Apakah Anda yakin?', text: "Data master petani akan dihapus permanen!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#71717a', confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/farmers/${selectedFarmer.id}`);
          Toast.fire({ icon: 'success', title: 'Data petani telah dibuang.' });
          setSelectedFarmer(null); fetchFarmers();
        } catch (error) {
          Toast.fire({ icon: 'error', title: 'Gagal menghapus data.' });
        }
      }
    });
  };

  const handleSyncFarmers = async () => {
    try {
      Toast.fire({ icon: 'info', title: 'Memulai sinkronisasi data...' });
      await fetchFarmers();
      await fetchFarmerGroups();
      Toast.fire({ icon: 'success', title: 'Data berhasil disinkronkan!' });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Gagal melakukan sinkronisasi.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-800 antialiased font-sans pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin-lapangan" className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-800 shadow-sm transition flex items-center justify-center">
              <FaArrowLeft className="text-sm" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Manajemen Data Petani</h1>
              <p className="text-xs text-zinc-500 font-medium">Integrasi Real-Time dengan Database Master Docker Backend</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-3 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-center shadow-sm">
            <FaWifi /> <span>Koneksi Server Aktif</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <div className="lg:col-span-4">
            {/* PERBAIKAN: Melempar `filterDistricts` dan `filterVillages` 
              yang bersifat global untuk kebutuhan filter pencarian
            */}
            <FarmerList 
              farmers={farmers} 
              selectedFarmer={selectedFarmer} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              onSelectFarmer={handleSelectFarmer} 
              onInitAdd={handleInitAdd}
              farmerGroups={farmerGroups}
              districts={filterDistricts} 
              villages={filterVillages}   
              onSync={handleSyncFarmers}
              onFilterRegionChange={handleFilterRegionChange}
            />
          </div>
          <div className="lg:col-span-6">
            {isAdding || selectedFarmer ? (
              <FarmerForm 
                isAdding={isAdding} 
                formData={formData} 
                setFormData={setFormData} 
                farmerGroups={farmerGroups} 
                onAddFarmerGroupClick={handleOpenGroupModal} 
                onSubmit={handleSaveFarmer}
                onCancel={() => { setSelectedFarmer(null); setIsAdding(false); }} 
                onDelete={handleDeleteFarmer}
                provinces={provinces} 
                cities={cities} 
                districts={districts} // Form tetap memakai state wilayah aslinya sendiri
                villages={villages}
                onProfileRegionChange={handleProfileRegionChange}
              />
            ) : ( <EmptyState /> )}
          </div>
        </div>
   

      {/* COMPONENT MODAL CUSTOM INLINE */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl w-105 p-5 shadow-xl border border-zinc-100 flex flex-col items-center">
            <h3 className="text-[#00aa5b] font-bold text-lg tracking-wide text-center w-full mb-4">
              Kelompok Petani
            </h3>
            <div className="w-full space-y-3.5">
              <div className="w-full">
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Nama kelompok petani</label>
                <input 
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-3 bg-[#f3f4f6] border border-zinc-200 rounded-xl text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] transition box-border" 
                  placeholder="Masukkan nama kelompok tani..."
                />
              </div>
              <div className="w-full">
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Deskripsi</label>
                <textarea 
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-3 py-6 bg-[#f3f4f6] border border-zinc-200 rounded-xl text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] transition resize-none box-border" 
                  placeholder="Masukkan keterangan/deskripsi..."
                ></textarea>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full mt-5">
              <button 
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="bg-[#f3f4f6] hover:bg-zinc-200 text-zinc-900 font-bold py-2.5 rounded-xl text-sm transition flex-1 text-center border border-zinc-300 cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleSaveGroupCustom}
                className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-2.5 rounded-xl text-sm transition flex-1 text-center cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}