'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/app/lib/axios';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaSeedling, 
  FaGlobeAsia, 
  FaWifi, 
  FaExclamationTriangle,
  FaChartLine,
  FaTimes,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

const MapComponent = dynamic(
  () => import('@/app/components/dashboard/MapComponent'), 
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-56 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs font-semibold">
        Memuat Peta GIS Lahan...
      </div>
    )
  }
);

interface LandsViewProps {
  lands: Array<any>;
  loading?: boolean;
  farmerName?: string;
  farmerId?: number; // Opsional jika kamu punya ID farmer langsung dari props
}

function LandsSkeleton() {
  return (
    <div className="space-y-3 w-full box-border min-w-0 animate-pulse">
      <div className="w-full h-56 bg-slate-200 rounded-2xl" />
      {[1, 2].map((i) => (
        <div key={i} className="w-full bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-slate-200 rounded-md w-1/2" />
                <div className="h-2.5 bg-slate-200 rounded-md w-2/3" />
              </div>
            </div>
            <div className="h-4 bg-slate-200 rounded-full w-12 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandsView({ lands, loading, farmerName, farmerId }: LandsViewProps) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fertilizers, setFertilizers] = useState<any[]>([]);
  const [loadingFertilizers, setLoadingFertilizers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data Form Modal
  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [formData, setFormData] = useState({
    fertilizer_name: '',
    amount: '',
    unit: 'kg',
    application_date: new Date().toISOString().split('T')[0],
    phase: '',
    notes: '',
  });

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch daftar pupuk dari Backend
  const fetchFertilizers = async () => {
    try {
      setLoadingFertilizers(true);
      const response = await api.get('/farmer/my-fertilizers');
      // Menangani berbagai format response
      const data = response.data.data || response.data;
      setFertilizers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil daftar pupuk:', error);
    } finally {
      setLoadingFertilizers(false);
    }
  };

  const getPlantEmoji = (plantName: string): string => {
    const name = plantName?.toLowerCase() || '';
    if (name.includes('padi')) return '🌾';
    if (name.includes('jagung')) return '🌽';
    if (name.includes('cabai') || name.includes('cabe')) return '🌶️';
    if (name.includes('bawang')) return '🧅';
    if (name.includes('tomat')) return '🍅';
    return '🌱';
  };

  // Handler Buka Modal
  const handleOpenModal = (landId: number, plant: any) => {
    if (!isOnline) {
      alert("Maaf, pengajuan pemupukan membutuhkan koneksi internet.");
      return;
    }

    setSelectedLandId(landId);
    setSelectedPlant(plant);
    setFormData({
      fertilizer_name: '',
      amount: '',
      unit: 'kg',
      application_date: new Date().toISOString().split('T')[0],
      phase: plant?.current_phase || '',
      notes: '',
    });

    setIsModalOpen(true);
    fetchFertilizers();
  };

  // Submit Ke Backend
  const handleSubmitFertilizer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fertilizer_name) {
      alert("Silakan pilih pupuk terlebih dahulu.");
      return;
    }

    // fallback farmer_id diambil dari prop atau dari objek land jika ada
    const activeFarmerId = farmerId || (lands.length > 0 ? lands[0]?.farmer_id : null);

    try {
      setSubmitting(true);
      const payload = {
        farmer_id: activeFarmerId,
        land_id: selectedLandId,
        plant_id: selectedPlant?.id || null,
        fertilizer_name: formData.fertilizer_name,
        amount: parseFloat(formData.amount),
        unit: formData.unit,
        application_date: formData.application_date,
        phase: formData.phase,
        notes: formData.notes,
        status: 'submitted'
      };

      await api.post('/fertilizer-histories', payload);
      alert('Pengajuan pemupukan berhasil disimpan!');
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Gagal menyimpan data pemupukan.');
    } finally {
      setSubmitting(false);
    }
  };

  const mapFarmersData = [
    {
      id: 1,
      name: farmerName || 'Saya',
      lands: lands || [],
    },
  ];

  return (
    <div className="w-full max-w-full space-y-3 box-border overflow-hidden font-sans relative">
      
      {/* Sub Header Navigation */}
      <div className="flex items-center gap-2.5 py-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 w-full min-w-0">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition active:scale-95 shrink-0 shadow-xs flex items-center justify-center cursor-pointer"
          aria-label="Kembali"
        >
          <FaArrowLeft className="text-slate-800 text-xs" />
        </button>
        <div className="w-0 flex-1 min-w-0">
          <h1 className="font-black text-slate-900 text-sm leading-tight truncate">Lahan & Tanaman Saya</h1>
          <p className="text-[10px] text-slate-500 font-medium truncate">Kelola data lahan dan pemupukan</p>
        </div>
      </div>

      {loading ? (
        <LandsSkeleton />
      ) : lands && lands.length > 0 ? (
        <div className="space-y-3 w-full box-border min-w-0">
          
          <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative bg-slate-100">
            <MapComponent farmers={mapFarmersData as any} />
          </div>

          {/* DAFTAR LAHAN */}
          {lands.map((land) => (
            <div 
              key={land.id} 
              className="w-full bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 box-border overflow-hidden min-w-0"
            >
              <div className="flex items-center justify-between gap-2 w-full min-w-0">
                <div className="flex items-center gap-2 w-0 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <FaGlobeAsia className="text-sm" />
                  </div>
                  <div className="w-0 flex-1 min-w-0">
                    <h2 className="font-extrabold text-slate-900 text-xs leading-tight truncate">
                      {land.land_name}
                    </h2>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium truncate">
                      <FaMapMarkerAlt className="text-emerald-600 text-[9px] shrink-0" /> 
                      <span className="truncate">{land.location_address || 'Lokasi Lahan'}</span>
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {land.status || 'Aktif'}
                </span>
              </div>

              <div className="w-full bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1.5 border border-slate-200/60 font-medium box-border min-w-0">
                <div className="flex justify-between items-center gap-2 min-w-0">
                  <span className="text-slate-500 shrink-0">Luas Lahan</span>
                  <span className="font-extrabold text-slate-900 truncate text-right shrink-0">{land.area} {land.unit}</span>
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-200/80 pt-1.5 gap-2 min-w-0">
                  <span className="text-slate-500 shrink-0 flex items-center gap-1">
                    <FaChartLine className="text-emerald-600 text-[10px]" /> Indeks NDVI
                  </span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
                    {land.current_ndvi !== null && land.current_ndvi !== undefined 
                      ? Number(land.current_ndvi).toFixed(4) 
                      : 'Belum dianalisis'}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200/80 pt-1.5 gap-2 min-w-0">
                  <span className="text-slate-500 shrink-0">Jumlah Tanaman</span>
                  <span className="font-extrabold text-emerald-700 truncate text-right shrink-0">
                    {land.plants ? `${land.plants.length} Jenis Tanaman` : '0 Jenis Tanaman'}
                  </span>
                </div>
              </div>

              {/* Daftar Tanaman */}
              <div className="space-y-2 pt-0.5 w-full box-border min-w-0">
                <p className="text-[11px] font-extrabold text-slate-800 px-0.5 flex items-center gap-1.5">
                  <FaSeedling className="text-emerald-600 text-xs" /> Daftar Tanaman:
                </p>
                
                {land.plants && land.plants.length > 0 ? (
                  land.plants.map((plant: any) => (
                    <div 
                      key={plant.id} 
                      className="w-full bg-emerald-50/60 border border-emerald-200/80 p-2.5 rounded-xl space-y-2 shadow-xs box-border overflow-hidden min-w-0"
                    >
                      <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
                        <div className="flex items-center gap-2 w-0 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-lg border border-emerald-200 bg-white flex items-center justify-center text-xs shrink-0">
                            {getPlantEmoji(plant.name)}
                          </div>
                          <div className="w-0 flex-1 min-w-0">
                            <h3 className="font-extrabold text-emerald-950 text-xs capitalize truncate">
                              {plant.name}
                            </h3>
                            <p className="text-[9px] text-slate-600 font-medium truncate">
                              Tgl Tanam: <span className="font-bold text-slate-900">{plant.planting_date || '-'}</span>
                            </p>
                          </div>
                        </div>

                        <span className="bg-emerald-200/90 text-emerald-900 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0">
                          {plant.current_phase || 'Fase Tanam'}
                        </span>
                      </div>

                      {/* Tombol Membuka Modal */}
                      <button
                        onClick={() => handleOpenModal(land.id, plant)}
                        className={`w-full text-white text-[11px] font-extrabold py-2 rounded-lg transition text-center flex items-center justify-center gap-2 cursor-pointer 
                          ${isOnline 
                            ? 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 active:scale-[0.98]' 
                            : 'bg-slate-400 cursor-not-allowed'
                          }`}
                        title={isOnline ? 'Ajukan pemupukan' : 'Fitur ini butuh internet'}
                      >
                        {isOnline ? (
                          <>
                            <FaWifi className="text-[10px]" /> Pupuk Sekarang
                          </>
                        ) : (
                          <>
                            <FaExclamationTriangle className="text-[10px]" /> Sedang Offline
                          </>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full bg-slate-50 border border-dashed border-slate-200 p-2 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 italic font-medium">Belum ada tanaman terdaftar di lahan ini.</p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-8 italic font-medium">Belum ada data lahan terdaftar.</p>
      )}

      {/* 🌟 MODAL DIALOG PEMUPUKAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-100 space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-black text-slate-800 text-sm">Catat / Ajukan Pemupukan</h3>
                <p className="text-[10px] text-slate-500">Tanaman: <span className="font-bold text-emerald-700">{selectedPlant?.name}</span></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitFertilizer} className="space-y-3 text-xs">
              
              {/* Select Pupuk dari BE */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Pupuk</label>
                {loadingFertilizers ? (
                  <div className="p-2 text-[10px] text-slate-400 flex items-center gap-2">
                    <FaSpinner className="animate-spin" /> Memuat daftar pupuk...
                  </div>
                ) : (
                  <select
                    required
                    value={formData.fertilizer_name}
                    onChange={(e) => setFormData({ ...formData, fertilizer_name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium"
                  >
                    <option value="">-- Pilih Jenis Pupuk --</option>
                    {fertilizers.map((item: any, idx: number) => {
                      const name = item.name || item.fertilizer_name || item;
                      return (
                        <option key={idx} value={name}>
                          {name} {item.stock ? `(Stok: ${item.stock})` : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Jumlah & Satuan */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Jumlah</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Contoh: 10"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium"
                  >
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="liter">liter</option>
                  </select>
                </div>
              </div>

              {/* Tanggal Pemupukan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={formData.application_date}
                  onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium"
                />
              </div>

              {/* Fase Tanam */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fase Pertumbuhan</label>
                <input
                  type="text"
                  placeholder="Misal: Vegetatif / Generatif"
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Opsional..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Submit
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}