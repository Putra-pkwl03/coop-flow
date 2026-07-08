// src/services/weatherService.ts
import axios from 'axios';

// Mengambil API Key dari file .env.local (Untuk OpenWeatherMap)
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

/**
 * 1. FUNGSI UNTUK WIDGET BANNER (REAL-TIME CUACA HARIAN)
 * Menggunakan OpenWeatherMap API (Membutuhkan API KEY)
 */
export const getWeatherData = async (lat: number, lon: number) => {
  try {
    // Kita tambahkan pengecekan agar tidak error jika API_KEY lupa diisi
    if (!API_KEY) {
      console.error("API Key cuaca tidak ditemukan di environment variables");
      return null;
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data cuaca harian:", error);
    return null;
  }
};

/**
 * 2. FUNGSI UNTUK INPUT MODEL MACHINE LEARNING (HISTORI CUACA MAKRO)
 * Menggunakan Open-Meteo Archive API (Gratis, Tanpa API Key, Mendukung Data Tahunan)
 * @param lat - Latitude lokasi lahan
 * @param lon - Longitude lokasi lahan
 * @param yearsBack - Jumlah tahun ke belakang untuk dihitung rata-ratanya (Default 3 tahun)
 */
export const getHistoricalWeatherML = async (lat: number, lon: number, yearsBack: number = 3) => {
  const endDate = new Date();
  const startDate = new Date();
  
  // Kurangi tahun saat ini dengan parameter yearsBack untuk mendapatkan tanggal mulai
  startDate.setFullYear(endDate.getFullYear() - yearsBack);

  // Helper function untuk mengubah format tanggal Date menjadi string YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  // Endpoint resmi Arsip Cuaca Open-Meteo
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum&timezone=auto`;

  try {
    // Menggunakan axios sesuai dengan standar yang Anda gunakan di file ini
    const response = await axios.get(url);
    const dailyData = response.data.daily;

    if (!dailyData || !dailyData.time) {
      throw new Error("Struktur data daily tidak ditemukan dari Open-Meteo");
    }

    const totalDays = dailyData.time.length;

    // --- PROSES AGREGASI & HITUNG RATA-RATA ---
    
    // 1. Hitung Rata-rata Suhu Harian selama rentang tahun
    const totalTemp = dailyData.temperature_2m_mean.reduce((acc: number, val: number) => acc + (val || 0), 0);
    const avgTemp = totalTemp / totalDays;

    // 2. Hitung Rata-rata Kelembapan Harian selama rentang tahun
    const totalHumidity = dailyData.relative_humidity_2m_mean.reduce((acc: number, val: number) => acc + (val || 0), 0);
    const avgHumidity = totalHumidity / totalDays;

    // 3. Hitung Estimasi Rata-rata Curah Hujan Bulanan
    // Rumus: Total akumulasi hujan dibagi dengan total bulan (yearsBack * 12)
    const totalPrecipitation = dailyData.precipitation_sum.reduce((acc: number, val: number) => acc + (val || 0), 0);
    const totalMonths = yearsBack * 12;
    const avgMonthlyPrecipitation = totalPrecipitation / totalMonths;

    // Kembalikan objek data ringkas yang siap dikirim surveyor ke dataset ML
    return {
      avg_temperature: Math.round(avgTemp * 10) / 10, // Dibulatkan 1 angka di belakang koma (cth: 26.8)
      avg_humidity: Math.round(avgHumidity),          // Dibulatkan integer (cth: 82)
      avg_monthly_precipitation: Math.round(avgMonthlyPrecipitation * 10) / 10, // (cth: 150.5 mm)
      total_days_analyzed: totalDays
    };

  } catch (error) {
    console.error("Gagal mengambil data histori cuaca Open-Meteo untuk ML:", error);
    return null;
  }
};