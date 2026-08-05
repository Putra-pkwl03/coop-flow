// services/weatherService.ts
import axios from 'axios';

/**
 * 1. FUNGSI UNTUK WIDGET BANNER (REAL-TIME CUACA HARIAN)
 * Menggunakan OpenWeatherMap API dengan Fallback Offline Storage
 */
export const getWeatherData = async (lat: number, lon: number) => {
  // Jika device sedang offline, langsung lemparkan ke penanganan cache
  if (typeof window !== 'undefined' && !navigator.onLine) {
    console.warn("[WeatherService] Device offline, membaca dari cache lokal...");
    return getCachedWeatherData();
  }

  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  try {
    if (!API_KEY) {
      console.error("API Key cuaca tidak ditemukan di environment variables");
      return getCachedWeatherData();
    }

    // Set timeout singkat (5 detik) agar aplikasi tidak menggantung terlalu lama jika sinyal jelek
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
      { timeout: 5000 }
    );

    if (response.data) {
      // Simpan backup data terbaru ke localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_successful_openweather', JSON.stringify(response.data));
      }
      return response.data;
    }

    return getCachedWeatherData();
  } catch (error) {
    console.warn("Gagal mengambil data cuaca harian online, mengambil cache lokal:", error);
    return getCachedWeatherData();
  }
};

// Helper untuk membaca cache OpenWeatherMap
const getCachedWeatherData = () => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem('last_successful_openweather');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * 2. FUNGSI UNTUK INPUT MODEL MACHINE LEARNING (HISTORI CUACA MAKRO)
 * Menggunakan Open-Meteo Archive API + Cache LocalStorage
 */
export const getHistoricalWeatherML = async (lat: number, lon: number, yearsBack: number = 3) => {
  // Key unik cache berdasarkan koordinat (dibulatkan agar mencakup area sekitar)
  const cacheKey = `ml_weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;

  // Cek koneksi internet
  if (typeof window !== 'undefined' && !navigator.onLine) {
    console.warn("[WeatherService] Device offline, memuat data ML cuaca dari cache...");
    return getCachedMLData(cacheKey);
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - yearsBack);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum&timezone=auto`;

  try {
    const response = await axios.get(url, { timeout: 8000 });
    const dailyData = response?.data?.daily;

    if (!dailyData || !Array.isArray(dailyData.time) || dailyData.time.length === 0) {
      throw new Error("Struktur data daily tidak ditemukan dari Open-Meteo");
    }

    const totalDays = dailyData.time.length;

    // --- PROSES AGREGASI & HITUNG RATA-RATA ---
    const totalTemp = (dailyData.temperature_2m_mean || []).reduce((acc: number, val: number) => acc + (val ?? 0), 0);
    const avgTemp = totalTemp / totalDays;

    const totalHumidity = (dailyData.relative_humidity_2m_mean || []).reduce((acc: number, val: number) => acc + (val ?? 0), 0);
    const avgHumidity = totalHumidity / totalDays;

    const totalPrecipitation = (dailyData.precipitation_sum || []).reduce((acc: number, val: number) => acc + (val ?? 0), 0);
    const totalMonths = yearsBack * 12;
    const avgMonthlyPrecipitation = totalPrecipitation / totalMonths;

    const result = {
      avg_temperature: Math.round(avgTemp * 10) / 10,
      avg_humidity: Math.round(avgHumidity),
      avg_monthly_precipitation: Math.round(avgMonthlyPrecipitation * 10) / 10,
      total_days_analyzed: totalDays
    };

    // Simpan ke Cache
    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify(result));
      // Simpan juga sebagai cache default/fallback umum jika lokasi berubah saat offline
      localStorage.setItem('ml_weather_fallback', JSON.stringify(result));
    }

    return result;

  } catch (error) {
    console.warn("Gagal mengambil data histori cuaca Open-Meteo online:", error);
    return getCachedMLData(cacheKey);
  }
};

// Helper untuk membaca cache ML
const getCachedMLData = (cacheKey: string) => {
  if (typeof window === 'undefined') return getFallbackDefaultMLData();

  const specificCache = localStorage.getItem(cacheKey);
  if (specificCache) {
    try { return JSON.parse(specificCache); } catch (e) {}
  }

  const fallbackCache = localStorage.getItem('ml_weather_fallback');
  if (fallbackCache) {
    try { return JSON.parse(fallbackCache); } catch (e) {}
  }

  // Jika tidak ada cache sama sekali, berikan nilai default rata-rata iklim tropis Indonesia
  return getFallbackDefaultMLData();
};

// Nilai default makro rata-rata Indonesia jika benar-benar belum pernah online sama sekali
const getFallbackDefaultMLData = () => {
  return {
    avg_temperature: 27.5,
    avg_humidity: 80,
    avg_monthly_precipitation: 180.0,
    total_days_analyzed: 0,
    is_fallback: true
  };
};