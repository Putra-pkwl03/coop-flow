import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Sprout, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Info
} from 'lucide-react';

// ==============================================================================
// 1. INTERFACES & TYPES
// ==============================================================================

export interface LandInfo {
  id: number;
  land_name?: string;
  name?: string;
  location?: string;
  area_ha?: number;
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
  application_date: string; // Format YYYY-MM-DD
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
  dosePerHa: number;
}

// ==============================================================================
// 2. ATURAN JEDA PEMUPUKAN
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
    { stage: 'Pemupukan Awal (Vegetatif)', daysToAdd: 30, fertilizer: 'NPK Organik & Kompos', dosePerHa: 300 },
    { stage: 'Pemupukan Pembesaran Rimpang', daysToAdd: 90, fertilizer: 'KCL & NPK', dosePerHa: 200 },
  ],
};

const generateUpcomingSchedules = (existingData: FertilizerHistoryItem[]): FertilizerHistoryItem[] => {
  const generated: FertilizerHistoryItem[] = [];

  existingData.forEach((item) => {
    const plantType = (item.plant?.plant_type || item.plant?.name || '').toLowerCase();
    const landArea = item.land?.area_ha || item.land?.area || 1;

    let intervals: IntervalRule[] | null = null;
    if (plantType.includes('padi')) intervals = FERTILIZER_INTERVALS.padi;
    else if (plantType.includes('jagung')) intervals = FERTILIZER_INTERVALS.jagung;
    else if (plantType.includes('temulawak')) intervals = FERTILIZER_INTERVALS.temulawak;

    if (intervals && item.application_date) {
      const baseDate = new Date(item.application_date);

      intervals.forEach((rule, idx) => {
        const nextDate = new Date(baseDate);
        nextDate.setDate(nextDate.getDate() + rule.daysToAdd);

        const calculatedAmount = Math.round(rule.dosePerHa * landArea * 100) / 100;

        generated.push({
          id: `gen-${item.id}-${idx}`,
          fertilizer_name: `${rule.fertilizer} (${rule.stage})`,
          amount: calculatedAmount,
          unit: 'kg',
          application_date: nextDate.toISOString().split('T')[0],
          status: 'jadwal',
          notes: `Estimasi Dosis: ${calculatedAmount} kg (Standar: ${rule.dosePerHa} kg/ha × ${landArea} ha)`,
          is_generated: true,
          land: item.land,
          plant: item.plant
        });
      });
    }
  });

  return generated;
};

// Mock Data
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

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// ==============================================================================
// 3. KOMPONEN UTAMA
// ==============================================================================

export default function FertilizerScheduleManager() {
  const [historyList] = useState<FertilizerHistoryItem[]>(INITIAL_HISTORY);
  
  // State untuk Navigasi Kalender
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Maret 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Menggabungkan data asli + rekomendasi otomatis
  const combinedSchedules = useMemo(() => {
    const generated = generateUpcomingSchedules(historyList);
    const allData = [...historyList, ...generated];
    return allData.sort((a, b) => new Date(a.application_date).getTime() - new Date(b.application_date).getTime());
  }, [historyList]);

  // Map jadwal ke tanggal untuk penanda visual di kalender
  const scheduleMap = useMemo(() => {
    const map: Record<string, FertilizerHistoryItem[]> = {};
    combinedSchedules.forEach((item) => {
      if (!map[item.application_date]) {
        map[item.application_date] = [];
      }
      map[item.application_date].push(item);
    });
    return map;
  }, [combinedSchedules]);

  // Logika Hari dalam Bulan untuk Grid Kalender
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Cell kosong untuk penyesuaian hari pertama
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Hari-hari dalam bulan aktif
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayStr}`;

      days.push({
        dayNumber: day,
        dateString,
        items: scheduleMap[dateString] || []
      });
    }
    return days;
  }, [currentDate, scheduleMap]);

  // Filter jadwal berdasarkan tanggal yang diklik di kalender
  const displayedSchedules = useMemo(() => {
    if (selectedDateStr) {
      return combinedSchedules.filter((item) => item.application_date === selectedDateStr);
    }
    return combinedSchedules;
  }, [combinedSchedules, selectedDateStr]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-slate-100 pb-12 font-sans">
      
      {/* 🟢 1. BANNER HIJAU BESAR & RAMAH TUA (TANPA BUTTON PLUS) */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-6 md:p-8 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Sprout className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
            Jadwal Pemupukan Lahan
          </h1>
        </div>
        <p className="text-emerald-100 text-base md:text-lg font-medium leading-relaxed mt-2 max-w-2xl">
          Panduan waktu dan jumlah pemupukan agar tanaman subur dan panen melimpah.
        </p>
      </div>

      <div className="px-4 md:px-6 space-y-6">

        {/* 🗓️ 2. KALENDER INTERAKTIF RAMAH PETANI */}
        <div className="bg-white rounded-3xl p-5 md:p-7 shadow-md border-2 border-emerald-100">
          
          {/* Header Kalender & Tombol Navigasi Besar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Kalender Kerja</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                aria-label="Bulan Sebelumnya"
                className="p-3 md:p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition flex items-center gap-1 font-bold text-base border-2 border-emerald-200 active:scale-95"
              >
                <ChevronLeft size={24} />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>
              <button 
                onClick={handleNextMonth}
                aria-label="Bulan Berikutnya"
                className="p-3 md:p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition flex items-center gap-1 font-bold text-base border-2 border-emerald-200 active:scale-95"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Nama-nama Hari (Teks Besar & Jelas) */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, idx) => (
              <div 
                key={day} 
                className={`py-2 font-bold text-base md:text-lg ${idx === 0 ? 'text-red-600' : 'text-slate-700'}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Tanggal Kalender */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-16 md:h-20 bg-slate-50/50 rounded-2xl" />;
              }

              const hasFinished = cell.items.some(i => i.status === 'selesai');
              const hasUpcoming = cell.items.some(i => i.status === 'jadwal');
              const isSelected = selectedDateStr === cell.dateString;

              return (
                <button
                  key={cell.dateString}
                  onClick={() => {
                    // Toggle filter jika tanggal yang sama diklik lagi
                    if (isSelected) setSelectedDateStr(null);
                    else setSelectedDateStr(cell.dateString);
                  }}
                  className={`h-16 md:h-20 p-1 md:p-2 rounded-2xl flex flex-col justify-between items-center transition relative border-2 ${
                    isSelected 
                      ? 'border-emerald-600 bg-emerald-100/80 shadow-md ring-2 ring-emerald-500' 
                      : 'border-slate-100 bg-slate-50/80 hover:bg-emerald-50/60'
                  }`}
                >
                  <span className={`text-lg md:text-xl font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {cell.dayNumber}
                  </span>

                  {/* Indicator Dot / Status Pupuk */}
                  <div className="flex items-center justify-center gap-1 w-full mt-auto mb-1">
                    {hasFinished && (
                      <span className="w-3 h-3 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" title="Ada jadwal selesai" />
                    )}
                    {hasUpcoming && (
                      <span className="w-3 h-3 md:w-3.5 md:h-3.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" title="Ada jadwal pupuk" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Keterangan Warna (Legenda) */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-around gap-4 text-sm md:text-base font-semibold text-slate-700 bg-slate-50 p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-emerald-500 rounded-full" />
              <span>Sudah Dipupuk (Selesai)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-amber-500 rounded-full" />
              <span>Jadwal Memupuk</span>
            </div>
          </div>
        </div>

        {/* 📋 3. DAFTAR JADWAL / KARTU DETAIL */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="text-emerald-700" />
              {selectedDateStr ? `Jadwal Tanggal: ${selectedDateStr}` : 'Semua Jadwal Pemupukan'}
            </h3>
            {selectedDateStr && (
              <button 
                onClick={() => setSelectedDateStr(null)}
                className="text-sm md:text-base bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-1.5 rounded-full transition"
              >
                Lihat Semua
              </button>
            )}
          </div>

          {displayedSchedules.map((item) => {
            const landArea = item.land?.area_ha || item.land?.area || 0;
            const isAutomated = item.is_generated;
            const isDone = item.status === 'selesai';

            return (
              <div 
                key={item.id} 
                className={`p-5 md:p-6 rounded-3xl border-2 transition bg-white shadow-sm hover:shadow-md ${
                  isDone 
                    ? 'border-emerald-200 bg-emerald-50/10' 
                    : 'border-amber-200 bg-amber-50/10'
                }`}
              >
                {/* Header Kartu */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800 text-xl md:text-2xl">
                        {item.fertilizer_name}
                      </span>
                      {isAutomated && (
                        <span className="text-xs md:text-sm bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                          <Sparkles size={14} /> Rekomendasi
                        </span>
                      )}
                    </div>
                    <p className="text-base text-slate-600 font-medium mt-1">
                      Tanaman: <span className="font-bold text-slate-900">{item.plant?.plant_type || '-'}</span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isDone ? (
                      <span className="inline-flex items-center gap-2 text-base font-bold bg-emerald-100 text-emerald-900 px-4 py-2 rounded-2xl border border-emerald-300">
                        <CheckCircle2 className="text-emerald-600" size={20} /> Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-base font-bold bg-amber-100 text-amber-900 px-4 py-2 rounded-2xl border border-amber-300">
                        <Clock className="text-amber-600" size={20} /> Perlu Dipupuk
                      </span>
                    )}
                  </div>
                </div>

                {/* Detail Info Utama (Kartu Dosis Terang & Jelas) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {/* Tanggal */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <CalendarIcon size={24} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Waktu Pupuk</p>
                      <p className="text-lg font-extrabold text-slate-800">{item.application_date}</p>
                    </div>
                  </div>

                  {/* Lahan */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <MapPin size={24} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Lokasi Lahan ({landArea} Ha)</p>
                      <p className="text-lg font-extrabold text-slate-800">{item.land?.land_name || '-'}</p>
                    </div>
                  </div>

                  {/* Dosis Pupuk (Dibuat Paling Menonjol) */}
                  <div className="bg-emerald-600 text-white p-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
                    <Sprout size={28} className="text-amber-300 shrink-0" />
                    <div>
                      <p className="text-xs text-emerald-100 font-semibold uppercase">Dosis Disarankan</p>
                      <p className="text-xl md:text-2xl font-black">
                        {item.amount || item.amount_kg} {item.unit || 'kg'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Catatan Sederhana */}
                {item.notes && (
                  <div className="mt-4 pt-3 text-sm md:text-base text-slate-600 border-t border-slate-100 flex items-start gap-2">
                    <Info size={18} className="text-slate-400 shrink-0 mt-1" />
                    <span>{item.notes}</span>
                  </div>
                )}
              </div>
            );
          })}

          {displayedSchedules.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-200 p-6">
              <Info size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-bold text-lg">Tidak ada jadwal pemupukan untuk tanggal ini.</p>
              <button 
                onClick={() => setSelectedDateStr(null)}
                className="mt-3 text-emerald-700 font-extrabold underline text-base"
              >
                Tampilkan Seluruh Jadwal
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}