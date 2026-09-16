import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Sprout, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Info
} from 'lucide-react';

// ================= ============================================================
// 1. INTERFACES & TYPES
// ==============================================================================

export interface LandInfo {
  id: number;
  land_name?: string;
  name?: string;
  location?: string;
  area_ha?: number; // Luas lahan dalam Hektar
  area?: number;
}

export interface PlantInfo {
  id: number;
  plant_type?: string;
  name?: string;
}

export interface FertilizerHistoryItem {
  id: number | string;
  fertilizer_name: string;
  amount_kg?: number;
  amount?: number;
  unit?: string;
  application_date: string;
  status: 'submitted' | 'selesai' | 'jadwal' | 'terlewatin' | string;
  notes?: string;
  is_generated?: boolean;
  land?: LandInfo;
  plant?: PlantInfo;
}

interface IntervalRule {
  stage: string;
  daysToAdd: number;
  fertilizer: string;
  dosePerHa: number; // Dosis standar per 1 Hektar (kg/ha)
}

// ================= ============================================================
// 2. ATURAN JEDA & DOSIS DUKUNGAN (PER HEKTAR)
// ==============================================================================

const FERTILIZER_INTERVALS: Record<string, IntervalRule[]> = {
  padi: [
    { stage: 'Pemupukan Susulan 1', daysToAdd: 14, fertilizer: 'Urea & NPK Phonska', dosePerHa: 150 },
    { stage: 'Pemupukan Susulan 2', daysToAdd: 30, fertilizer: 'Urea & SP-36', dosePerHa: 100 },
    { stage: 'Pemupukan Penutup', daysToAdd: 45, fertilizer: 'KCL', dosePerHa: 50 },
  ],
  jagung: [
    { stage: 'Pemupukan Susulan 1', daysToAdd: 15, fertilizer: 'Urea & NPK', dosePerHa: 200 },
    { stage: 'Pemupukan Susulan 2', daysToAdd: 35, fertilizer: 'Urea', dosePerHa: 150 },
  ],
  temulawak: [
    { stage: 'Pemupukan Awal (Fase Vegetatif)', daysToAdd: 30, fertilizer: 'NPT Organik & Kompos', dosePerHa: 300 },
    { stage: 'Pemupukan Pembesaran Rimpang', daysToAdd: 90, fertilizer: 'KCL & NPK', dosePerHa: 200 },
  ],
};

// ================= ============================================================
// 3. FUNGSI GENERATOR DOSIS DINAMIS
// ==============================================================================

/**
 * Memunculkan estimasi pemupukan mendatang berdasarkan tanggal pemupukan pertama
 * dan dikalikan secara otomatis dengan Luas Lahan (Ha).
 */
const generateUpcomingSchedules = (existingData: FertilizerHistoryItem[]): FertilizerHistoryItem[] => {
  const generated: FertilizerHistoryItem[] = [];

  existingData.forEach((item) => {
    const plantType = (item.plant?.plant_type || item.plant?.name || '').toLowerCase();
    
    // Ambil luas lahan dalam Hektar (default ke 1 Ha jika data luas lahan tidak valid/kosong)
    const landArea = item.land?.area_ha || item.land?.area || 1;

    // Cari aturan yang sesuai dengan jenis tanaman
    let intervals: IntervalRule[] | null = null;
    if (plantType.includes('padi')) intervals = FERTILIZER_INTERVALS.padi;
    else if (plantType.includes('jagung')) intervals = FERTILIZER_INTERVALS.jagung;
    else if (plantType.includes('temulawak')) intervals = FERTILIZER_INTERVALS.temulawak;

    if (intervals && item.application_date) {
      const baseDate = new Date(item.application_date);

      intervals.forEach((rule, idx) => {
        const nextDate = new Date(baseDate);
        nextDate.setDate(nextDate.getDate() + rule.daysToAdd);

        // Kalkulasi dosis dinamis = Dosis per Ha * Luas Lahan
        const calculatedAmount = Math.round(rule.dosePerHa * landArea * 100) / 100;

        generated.push({
          id: `gen-${item.id}-${idx}`,
          fertilizer_name: `${rule.fertilizer} (${rule.stage})`,
          amount: calculatedAmount,
          unit: 'kg',
          application_date: nextDate.toISOString().split('T')[0],
          status: 'jadwal',
          notes: `Dosis dinamis: ${calculatedAmount} kg (Standar: ${rule.dosePerHa} kg/ha × ${landArea} ha)`,
          is_generated: true,
          land: item.land,
          plant: item.plant
        });
      });
    }
  });

  return generated;
};

// ================= ============================================================
// 4. MOCK DATA CONTOH
// ==============================================================================

const INITIAL_HISTORY: FertilizerHistoryItem[] = [
  {
    id: 101,
    fertilizer_name: 'Pupuk Dasar Organik',
    amount: 100,
    unit: 'kg',
    application_date: '2026-03-01',
    status: 'selesai',
    notes: 'Pemupukan awal sebelum tanam',
    land: { id: 1, land_name: 'Petak Sawah Barat', area_ha: 0.5, location: 'Desa Sukamaju' },
    plant: { id: 1, plant_type: 'Padi Ciherang' }
  },
  {
    id: 102,
    fertilizer_name: 'Pupuk Dasar NPK',
    amount: 150,
    unit: 'kg',
    application_date: '2026-03-05',
    status: 'selesai',
    notes: 'Awal tanam musim hujan',
    land: { id: 2, land_name: 'Ladang Jagung Utara', area_ha: 1.5, location: 'Desa Sukamaju' },
    plant: { id: 2, plant_type: 'Jagung Hibrida' }
  }
];

// ================= ============================================================
// 5. KOMPONEN UTAMA (REACT COMPONENT)
// ==============================================================================

export default function FertilizerScheduleManager() {
  const [historyList, setHistoryList] = useState<FertilizerHistoryItem[]>(INITIAL_HISTORY);
  const [filter, setFilter] = useState<'semua' | 'selesai' | 'jadwal'>('semua');

  // Menggabungkan Riwayat Riil + Jadwal Otomatis yang Terkalkulasi
  const combinedSchedules = useMemo(() => {
    const generated = generateUpcomingSchedules(historyList);
    const allData = [...historyList, ...generated];

    // Urutkan berdasarkan tanggal terdekat
    return allData.sort((a, b) => new Date(a.application_date).getTime() - new Date(b.application_date).getTime());
  }, [historyList]);

  // Filter tampilan berdasarkan tab status
  const filteredList = useMemo(() => {
    if (filter === 'semua') return combinedSchedules;
    return combinedSchedules.filter((item) => item.status === filter);
  }, [combinedSchedules, filter]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sprout className="text-emerald-600" /> Jadwal & Dosis Pemupukan
          </h1>
          <p className="text-slate-500 text-sm">
            Kalkulasi dosis pupuk otomatis disesuaikan dengan luas lahan (Hektar).
          </p>
        </div>
        <button 
          onClick={() => alert('Buka Modal Tambah Riwayat Pupuk')}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 font-medium text-sm transition shadow"
        >
          <Plus size={18} /> Catat Pemupukan
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl w-fit mb-6 text-sm font-medium">
        <button
          onClick={() => setFilter('semua')}
          className={`px-4 py-1.5 rounded-lg transition ${
            filter === 'semua' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua ({combinedSchedules.length})
        </button>
        <button
          onClick={() => setFilter('selesai')}
          className={`px-4 py-1.5 rounded-lg transition ${
            filter === 'selesai' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Riwayat Selesai
        </button>
        <button
          onClick={() => setFilter('jadwal')}
          className={`px-4 py-1.5 rounded-lg transition ${
            filter === 'jadwal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rekomendasi Otomatis
        </button>
      </div>

      {/* List Kartu Pemupukan */}
      <div className="space-y-4">
        {filteredList.map((item) => {
          const landArea = item.land?.area_ha || item.land?.area || 0;
          const isAutomated = item.is_generated;

          return (
            <div 
              key={item.id} 
              className={`p-5 rounded-2xl border transition bg-white shadow-sm hover:shadow-md ${
                isAutomated ? 'border-dashed border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
                {/* Info Tanaman & Pupuk */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-lg">{item.fertilizer_name}</span>
                    {isAutomated && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Info size={12} /> Otomatis
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tanaman: <span className="font-medium text-slate-700">{item.plant?.plant_type || '-'}</span>
                  </p>
                </div>

                {/* Status Badge */}
                <div>
                  {item.status === 'selesai' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                      <CheckCircle2 size={14} /> Selesai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                      <Clock size={14} /> Jadwal Mendatang
                    </span>
                  )}
                </div>
              </div>

              {/* Detail Info Lahan & Dosis Perhitungan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm text-slate-600">
                {/* Tanggal */}
                <div className="flex items-start gap-2.5">
                  <Calendar size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Tanggal Aplikasi</p>
                    <p className="font-semibold text-slate-700">{item.application_date}</p>
                  </div>
                </div>

                {/* Luas Lahan & Lokasi */}
                <div className="flex items-start gap-2.5">
                  <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Lahan ({landArea} Ha)</p>
                    <p className="font-semibold text-slate-700">{item.land?.land_name || '-'}</p>
                  </div>
                </div>

                {/* Dosis Hasil Perhitungan */}
                <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Sprout size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Kebutuhan Pupuk</p>
                    <p className="font-bold text-emerald-700 text-base">
                      {item.amount || item.amount_kg} {item.unit || 'kg'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Catatan Perhitungan */}
              {item.notes && (
                <div className="mt-3 pt-2 text-xs text-slate-500 border-t border-slate-100 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-slate-400 shrink-0" />
                  <span>{item.notes}</span>
                </div>
              )}
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <AlertCircle size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium">Tidak ada data pemupukan ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}