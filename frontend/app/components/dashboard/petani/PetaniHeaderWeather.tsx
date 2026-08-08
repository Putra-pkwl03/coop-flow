'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getWeatherData } from '@/app/services/weatherService';

interface FarmerHeaderProps {
  name: string;
  role: string;
  avatar: string | null;
}

const WEATHER_CACHE_KEY = 'coopflow_weather_cache';

export default function FarmerHeader({ name, role, avatar }: FarmerHeaderProps) {
  const [weather, setWeather] = useState<any>(null);
  const [greeting, setGreeting] = useState<string>('Selamat Pagi');

  // Helper untuk menyimpan data cuaca ke cache lokal
  const saveWeatherCache = (data: any) => {
    try {
      localStorage.setItem(
        WEATHER_CACHE_KEY,
        JSON.stringify({
          data,
          updatedAt: Date.now(),
        })
      );
    } catch (err) {
      console.warn('Gagal menyimpan cache cuaca:', err);
    }
  };

  // Helper untuk memuat data cuaca dari cache lokal jika offline
  const loadWeatherCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setWeather(parsed.data);
      }
    } catch (err) {
      console.warn('Gagal membaca cache cuaca:', err);
    }
  }, []);

  // Fetch Cuaca dengan Fallback Offline
  const fetchWeather = useCallback(
    async (lat: number, lon: number) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        loadWeatherCache();
        return;
      }

      try {
        const data = await getWeatherData(lat, lon);
        if (data) {
          setWeather(data);
          saveWeatherCache(data);
        } else {
          loadWeatherCache();
        }
      } catch (err) {
        console.warn('Gagal mengambil data cuaca terbaru, memuat cache offline:', err);
        loadWeatherCache();
      }
    },
    [loadWeatherCache]
  );

  useEffect(() => {
    // 1. Set Ucapan Waktu
    const currentHour = new Date().getHours();
    if (currentHour >= 4 && currentHour < 11) setGreeting('Selamat Pagi');
    else if (currentHour >= 11 && currentHour < 15) setGreeting('Selamat Siang');
    else if (currentHour >= 15 && currentHour < 18.5) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    // 2. Muat cache awal agar UI tidak menunggu fetch jika offline
    loadWeatherCache();

    // 3. Coba ambil lokasi & update data cuaca terbaru
    const defaultLat = -7.77;
    const defaultLon = 110.37;

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchWeather(defaultLat, defaultLon);
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather(defaultLat, defaultLon);
    }
  }, [fetchWeather, loadWeatherCache]);

  // ✅ Langsung return elemen JSX
  return (
    <div className="bg-gradient-to-r from-emerald-100/90 via-emerald-50 to-green-100/80 border-2 border-emerald-300/80 rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3">
      {/* Kiri: Avatar & Info Profil */}
      <div className="flex items-center space-x-3.5 min-w-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white p-0.5 border-2 border-emerald-600/40 shadow-xs flex-shrink-0">
          <img
            src={avatar || '/default-avatar.png'}
            alt={name || 'Petani'}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute(
                'src',
                'https://ui-avatars.com/api/?name=' +
                  encodeURIComponent(name || 'Petani') +
                  '&background=059669&color=fff'
              );
            }}
          />
        </div>

        {/* Informasi Teks */}
        <div className="min-w-0">
          <p className="text-xs font-bold text-emerald-800 tracking-wide">
            {greeting},
          </p>
          <h1 className="text-lg font-black text-slate-900 leading-snug truncate">
            {name || 'Petani'}
          </h1>
          <span className="inline-block mt-1 bg-emerald-700 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-lg shadow-2xs">
            {role || 'Anggota'}
          </span>
        </div>
      </div>

      {/* Kanan: Widget Cuaca Mini (Offline Resilient) */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-200 rounded-2xl px-3.5 py-2 shadow-xs flex items-center space-x-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider leading-tight">
            Cuaca
          </p>
          <p className="text-sm font-black text-emerald-950">
            {weather?.main?.temp !== undefined
              ? `${Math.round(weather.main.temp)}°C`
              : '--°C'}
          </p>
        </div>
        {weather?.weather?.[0]?.icon ? (
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
            alt="weather"
            className="w-9 h-9 object-contain"
          />
        ) : (
          <div className="w-8 h-8 bg-emerald-100 rounded-full animate-pulse flex items-center justify-center text-[10px] text-emerald-600 font-bold">
            ☁️
          </div>
        )}
      </div>
    </div>
  );
}