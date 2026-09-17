'use client';

import React, { useEffect, useState, useMemo } from 'react';
import api from '@/app/lib/axios';
import { 
  FaCalendarAlt, 
  FaSeedling, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaMagic
} from 'react-icons/fa';

interface FertilizerHistoryItem {
  id: number | string;
  fertilizer_name: string;
  amount_kg?: number;
  amount?: number;
  unit?: string;
  application_date: string;
  status: 'submitted' | 'selesai' | 'jadwal' | 'terlewatin' | string;
  notes?: string;
  is_generated?: boolean;
  land?: {
    id: number;
    land_name?: string;
    name?: string;
    location?: string;
    area_ha?: number; // Tambahan properti luas lahan
    area?: number;    // Tambahan fallback luas lahan
  };
  plant?: {
    id: number;
    plant_type?: string;
    name?: string;
  };
}

// Konfigurasi Interval & Dosis Standar Per Hektar (kg/ha)
const FERTILIZER_INTERVALS: Record<string, { stage: string; daysToAdd: number; fertilizer: string; dosePerHa: number }[]> = {
  padi: [
    { stage: 'Susulan 1 (Anakan)', daysToAdd: 14, fertilizer: 'Urea & NPK', dosePerHa: 150 },
    { stage: 'Susulan 2 (Bunting)', daysToAdd: 30, fertilizer: 'Urea & KCl', dosePerHa: 100 }
  ],
  jagung: [
    { stage: 'Susulan 1 (Vegetatif)', daysToAdd: 15, fertilizer: 'Urea & NPK Phonska', dosePerHa: 150 },
    { stage: 'Susulan 2 (Generatif)', daysToAdd: 30, fertilizer: 'Urea', dosePerHa: 100 }
  ],
  temulawak: [
    { stage: 'Susulan 1 (Pertumbuhan)', daysToAdd: 30, fertilizer: 'NPR & Organik', dosePerHa: 200 },
    { stage: 'Susulan 2 (Rimpang)', daysToAdd: 60, fertilizer: 'KCl / SP-36', dosePerHa: 150 }
  ]
};

export default function FertilizerScheduleView() {
  const [histories, setHistories] = useState<FertilizerHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farmer/fertilizer-histories');
      if (response.data.success) {
        const rawData: FertilizerHistoryItem[] = response.data.data || [];
        
        // Buat jadwal otomatis dari data riwayat yang ada
        const generatedSchedules = generateUpcomingSchedules(rawData);
        
        setHistories([...rawData, ...generatedSchedules]);
      }
    } catch (error) {
      console.error('Gagal mengambil data riwayat pemupukan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logika Generator Jadwal Otomatis Disesuaikan Luas Lahan
  const generateUpcomingSchedules = (existingData: FertilizerHistoryItem[]): FertilizerHistoryItem[] => {
    const generated: FertilizerHistoryItem[] = [];

    existingData.forEach((item) => {
      const plantType = (item.plant?.plant_type || item.plant?.name || '').toLowerCase();
      
      // Ambil luas lahan (default ke 1 jika data dari backend tidak tersedia/0)
      const landArea = item.land?.area_ha || item.land?.area || 1;

      // Ambil aturan jeda berdasarkan kata kunci nama tanaman
      let intervals = null;
      if (plantType.includes('padi')) intervals = FERTILIZER_INTERVALS.padi;
      else if (plantType.includes('jagung')) intervals = FERTILIZER_INTERVALS.jagung;
      else if (plantType.includes('temulawak')) intervals = FERTILIZER_INTERVALS.temulawak;

      if (intervals && item.application_date) {
        const baseDate = new Date(item.application_date);

        intervals.forEach((rule, idx) => {
          const nextDate = new Date(baseDate);
          nextDate.setDate(nextDate.getDate() + rule.daysToAdd);

          // Kalkulasi Dosis Dinamis = Dosis per Ha * Luas Lahan
          const calculatedAmount = Math.round(rule.dosePerHa * landArea * 100) / 100;

          generated.push({
            id: `gen-${item.id}-${idx}`,
            fertilizer_name: `${rule.fertilizer} (${rule.stage})`,
            amount: calculatedAmount,
            unit: 'kg',
            application_date: nextDate.toISOString().split('T')[0],
            status: 'jadwal',
            notes: `Rekomendasi pemupukan ${calculatedAmount} kg untuk lahan ${landArea} ha (Dosis: ${rule.dosePerHa} kg/ha).`,
            is_generated: true,
            land: item.land,
            plant: item.plant
          });
        });
      }
    });

    return generated;
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  const activeDatesSet = useMemo(() => {
    const set = new Set<string>();
    histories.forEach((item) => {
      if (item.application_date) {
        const dateStr = new Date(item.application_date).toISOString().split('T')[0];
        set.add(dateStr);
      }
    });
    return set;
  }, [histories]);

  const filteredHistories = histories.filter((item) => {
    if (filterStatus === 'all') return true;
    
    const s = item.status?.toLowerCase();
    if (filterStatus === 'selesai') {
      return s === 'selesai' || s === 'completed' || s === 'submitted';
    }
    if (filterStatus === 'jadwal') {
      return s === 'jadwal' || s === 'scheduled' || s === 'pending';
    }
    return s === filterStatus;
  });

  const getStatusBadge = (status: string, isGenerated?: boolean) => {
    const s = status?.toLowerCase();
    if (s === 'selesai' || s === 'completed' || s === 'submitted') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-3 py-1.5 rounded-full shadow-xs">
          <FaCheckCircle className="text-emerald-700 text-sm" /> Sudah Dipupuk
        </span>
      );
    }
    if (s === 'jadwal' || s === 'scheduled' || s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-3 py-1.5 rounded-full shadow-xs">
          {isGenerated ? <FaMagic className="text-amber-700 text-sm" /> : <FaClock className="text-amber-700 text-sm" />} 
          {isGenerated ? 'Rekomendasi Jadwal' : 'Menunggu Jadwal'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-900 border border-rose-300 text-xs font-black px-3 py-1.5 rounded-full shadow-xs">
        <FaExclamationTriangle className="text-rose-700 text-sm" /> {status}
      </span>
    );
  };

  return (
    <div className="space-y-5 font-sans max-w-2xl mx-auto pb-12 px-2 sm:px-0">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <FaCalendarAlt className="text-emerald-200" /> Jadwal & Riwayat Pemupukan
          </h1>
          <p className="text-sm text-emerald-100 mt-1.5 font-medium leading-relaxed">
            Sistem otomatis menghitung interval dan dosis pemupukan proporsional luas lahan untuk Padi, Jagung, dan Temulawak.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-15 text-white pointer-events-none">
          <FaSeedling size={160} />
        </div>
      </div>

      {/* 2. Strip Kalender Mingguan */}
      <div className="bg-white border-2 border-emerald-100 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center px-2">
          <button 
            onClick={handlePrevDay} 
            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition font-bold"
            title="Hari Sebelumnya"
          >
            <FaChevronLeft size={14} />
          </button>
          
          <div className="text-center">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Kalender Pemupukan</p>
            <p className="text-base sm:text-lg font-black text-slate-900">
              {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <button 
            onClick={handleNextDay} 
            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition font-bold"
            title="Hari Berikutnya"
          >
            <FaChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pt-1">
          {calendarDays.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const hasTask = activeDatesSet.has(dateStr);
            const dayName = day.toLocaleDateString('id-ID', { weekday: 'short' });
            const dayNum = day.getDate();

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-center transition relative ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400 scale-105'
                    : 'bg-slate-50 text-slate-700 hover:bg-emerald-50'
                }`}
              >
                <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {dayName}
                </span>
                <span className="text-base sm:text-lg font-black mt-0.5">
                  {dayNum}
                </span>
                
                {hasTask && (
                  <span 
                    className={`h-2 w-2 rounded-full mt-1 ${
                      isSelected ? 'bg-amber-300 ring-2 ring-emerald-800' : 'bg-emerald-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filter Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 pl-1">
          <FaFilter className="text-emerald-600" /> Filter:
        </span>
        {[
          { id: 'all', label: 'Semua Status' },
          { id: 'selesai', label: 'Sudah Dipupuk' },
          { id: 'jadwal', label: 'Rekomendasi Jadwal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition whitespace-nowrap active:scale-95 ${
              filterStatus === tab.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Daftar Kartu */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-100">
          <FaSpinner className="animate-spin text-3xl text-emerald-600" />
          <p className="text-sm font-bold text-slate-600">Mengambil data pemupukan...</p>
        </div>
      ) : filteredHistories.length === 0 ? (
        <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-3xl p-8 text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
            <FaSeedling size={28} />
          </div>
          <p className="text-base font-black text-slate-800">Belum Ada Catatan Pemupukan</p>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto font-medium">
            Riwayat dan jadwal pemupukan lahan pertanian kamu akan otomatis ditampilkan di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistories.map((item) => (
            <div
              key={item.id}
              className={`bg-white border-2 rounded-3xl p-5 shadow-xs transition space-y-4 ${
                item.is_generated ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                    {item.fertilizer_name}
                  </h3>
                  <div className="inline-block bg-emerald-50 text-emerald-900 px-3 py-1 rounded-xl text-xs font-bold mt-1 border border-emerald-200">
                    Dosis: <strong className="text-emerald-800 text-sm">{item.amount ?? item.amount_kg ?? 0} {item.unit || 'kg'}</strong>
                  </div>
                </div>
                {getStatusBadge(item.status, item.is_generated)}
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 font-semibold">
                <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <FaMapMarkerAlt size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">
                      Lahan {item.land?.area_ha || item.land?.area ? `(${item.land?.area_ha || item.land?.area} Ha)` : ''}
                    </p>
                    <p className="text-slate-900 font-black truncate">
                      {item.land?.land_name || item.land?.name || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                    <FaSeedling size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Tanaman</p>
                    <p className="text-slate-900 font-black truncate">
                      {item.plant?.plant_type || item.plant?.name || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 sm:col-span-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <FaCalendarAlt size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Tanggal Pemupukan</p>
                    <p className="text-slate-900 font-black">
                      {item.application_date
                        ? new Date(item.application_date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {item.notes && (
                <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900">
                  <span className="font-black">Catatan:</span> {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}