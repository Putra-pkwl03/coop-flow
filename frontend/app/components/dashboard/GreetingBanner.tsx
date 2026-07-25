"use client";

import React, { useState, useEffect } from "react";
import { FaTint, FaWind, FaMapMarkerAlt } from "react-icons/fa";
import { getWeatherData } from "@/app/services/weatherService";

interface GreetingBannerProps {
  adminName: string;
}

export default function GreetingBanner({ adminName }: GreetingBannerProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  // State untuk menyimpan teks ucapan dinamis (Default awal ke Pagi)
  const [greeting, setGreeting] = useState<string>("Selamat Pagi");

  useEffect(() => {
    // 1. Logika Penentu Ucapan Waktu Real-time
    const updateGreeting = () => {
      const currentHour = new Date().getHours();

      if (currentHour >= 4 && currentHour < 11) {
        setGreeting("Selamat Pagi");
      } else if (currentHour >= 11 && currentHour < 15) {
        setGreeting("Selamat Siang");
      } else if (currentHour >= 15 && currentHour < 18.5) {
        setGreeting("Selamat Sore");
      } else {
        setGreeting("Selamat Malam");
      }
    };

    // Jalankan sekali saat mount
    updateGreeting();

    // 2. Logika Integrasi Cuaca & Geolocation (Bawaan Anda)
    const fetchWeather = (lat: number, lon: number) => {
      getWeatherData(lat, lon).then((data) => {
        if (data) {
          setWeather(data);

          const weatherPayload = {
            temp: data.main.temp,
            humidity: data.main.humidity,
            rain: data.rain ? data.rain["1h"] : 0,
            windSpeed: data.wind?.speed,
            latitude: lat,
            longitude: lon,
            locationName: data.name,
            fetchedAt: new Date().toISOString(),
          };
          localStorage.setItem(
            "current_validation_weather",
            JSON.stringify(weatherPayload),
          );
        }
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLoadingLocation(false);
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error(
            "Gagal mendeteksi lokasi otomatis, menggunakan fallback:",
            error,
          );
          setLoadingLocation(false);
          fetchWeather(-7.77, 110.37);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      console.error("Geolocation tidak didukung oleh browser ini.");
      setLoadingLocation(false);
      fetchWeather(-7.77, 110.37);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch w-full h-auto lg:h-41.5">
      {/* SISI KIRI: Banner Selamat Pagi/Siang/Sore/Malam */}
      <div
        className="lg:col-span-2 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden h-41.5  bg-cover bg-center border border-zinc-100 shadow-sm"
        style={{ backgroundImage: `url('/greeting/bg-banner.png')` }}
      >
        {/* Konten Teks */}
        <div className="space-y-1 z-10 max-w-md mt-4">
          <h1 className="text-[24px] font-bold text-zinc-800">
            {greeting}, <span className="text-emerald-600">{adminName}</span>
          </h1>
          <p className="text-[15px] text-zinc-500 font-medium">
            Mari selesaikan tugas lapangan hari ini.
          </p>
        </div>

        {/* Gambar Karakter Petani */}
        <div className="absolute right-4 bottom-0 h-[85%] w-1/3 max-w-45 z-10">
          <img
            src="/greeting/farmer-character.png"
            alt="Petani"
            className="h-full w-full object-contain object-bottom"
          />
        </div>
      </div>

      {/* SISI KANAN: Widget Cuaca Hari Ini (Struktur data tetap, tinggi pas 166px) */}
      <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between h-41.5">
        <div>
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Cuaca hari ini
          </h2>

          {weather ? (
            <div className="flex items-center space-x-3">
              {/* Icon Cuaca Utama */}
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="w-12 h-12 object-contain"
              />
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-zinc-900">
                  {Math.round(weather.main.temp)}°C
                </span>
                <span className="text-[11px] text-zinc-500 capitalize font-medium">
                  {weather.weather[0].description}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic py-2">
              {loadingLocation
                ? "Mendeteksi lokasi GPS..."
                : "Memuat info cuaca..."}
            </p>
          )}
        </div>

        {/* Grid Detail: Angin & Kelembapan */}
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-200 pt-2 mt-0.5">
          <div className="flex items-center space-x-2 bg-zinc-50 p-1.5 rounded-xl">
            <FaWind className="text-zinc-400 text-xs" />
            <div>
              <p className="text-xs font-bold text-zinc-800">
                {weather
                  ? `${Math.round(weather.wind?.speed * 3.6)} km/j`
                  : "--"}
              </p>
              <p className="text-[9px] text-zinc-400 font-medium">Angin</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-zinc-50 p-1.5 rounded-xl">
            <FaTint className="text-blue-400 text-xs" />
            <div>
              <p className="text-xs font-bold text-zinc-800">
                {weather ? `${weather.main.humidity}%` : "--"}
              </p>
              <p className="text-[9px] text-zinc-400 font-medium">Kelembapan</p>
            </div>
          </div>
        </div>

        {/* Lokasi Bawah */}
        <div className="flex items-center space-x-1 text-[10px] text-zinc-400 font-medium mt-1.5 ">
          <FaMapMarkerAlt className="text-emerald-600 shrink-0" />
          <span className="truncate">
            Lokasi: {weather ? `${weather.name}` : "Mencari GPS..."}
          </span>
        </div>
      </div>
    </div>
  );
}
