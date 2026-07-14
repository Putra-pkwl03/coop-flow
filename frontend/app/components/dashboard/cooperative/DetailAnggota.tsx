"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import api from "../../../lib/axios";

// Memuat MapComponent secara dinamis tanpa SSR agar tidak bentrok dengan objek window (Leaflet/GIS)
const MapComponent = dynamic(
  () => import("../LatestMap").then(() => import("../MapComponent")),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs animate-pulse">
        Memuat Peta Citra Satelit Lahan...
      </div>
    ),
  },
);

interface RegionData {
  id: string | number;
  code: string;
  name: string;
}

interface Plant {
  id: number;
  name?: string;
  crop_type?: string;
  area?: string;
  planted_area?: string;
  planting_date?: string;
  notes?: string;
}

interface Land {
  id: number;
  land_name?: string;
  province?: RegionData;
  city?: RegionData;
  district?: RegionData;
  village?: RegionData;
  status?: string;
  area?: string;
  unit?: string;
  ares?: string;
  polygon_coordinates?: any[];
  center_latitude?: string;
  center_longitude?: string;
  document_name?: string;
  notes?: string;
  weather_avg_temp?: string;
  weather_avg_humidity?: string;
  weather_rainfall?: string;
  plants?: Plant[];
}

interface FarmerData {
  id: number;
  nik?: string;
  user?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  farmer_group?: {
    name?: string;
  };
  province?: RegionData;
  city?: RegionData;
  district?: RegionData;
  village?: RegionData;
  lands?: Land[];
}

interface DetailAnggotaProps {
  farmerId: number;
  onBack: () => void;
}

export default function DetailAnggota({
  farmerId,
  onBack,
}: DetailAnggotaProps) {
  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State akordion: Secara default membuka lahan pertama (index 0)
  const [openLahanIndex, setOpenLahanIndex] = useState<number>(0);
  // State sub-akordion tanaman di dalam lahan
  const [openPlantIndex, setOpenPlantIndex] = useState<number>(0);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/farmers/${farmerId}`);
        if (response.data && response.data.success) {
          setFarmer(response.data.data);
        } else {
          setFarmer(response.data);
        }
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat profil rinci petani dari server.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [farmerId]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">
        Memuat profil lengkap...
      </div>
    );
  if (error || !farmer)
    return (
      <div className="p-6 text-center text-red-500">
        {error || "Data tidak ditemukan."}
      </div>
    );

  return (
    <div className="p-2 space-y-5 bg-gray-50 min-h-screen text-gray-800">
      {/* Tombol Kembali */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 text-gray-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-950">Detail Petani</h1>
      </div>

      {/* ==================== 1. KARTU PROFIL ATAS (PRESISI REFERENSI) ==================== */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col md:flex-row items-stretch gap-6 w-full">
        {/* Bagian Foto & Nama Utama (Kiri) */}
        <div className="flex items-center gap-5 flex-[1.2] min-w-70">
          {/* Avatar Bulat Abu-abu User Profile */}
          <div className="w-20 h-20 bg-[#b0bec5]/40 text-white rounded-full flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-14 h-14 text-white"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12c0 2.622 1.036 4.999 2.715 6.741A5.99 5.99 0 0 1 10 16.5h4a5.99 5.99 0 0 1 4.685 2.597zM12 14.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">
              {farmer.user?.name || "Nama Petani"}
            </h2>
            <p className="text-zinc-400 text-xs font-medium">
              NIK : {farmer.nik || "────────────────"}
            </p>
            {/* Badge Hijau Kelompok Tani */}
            <div className="pt-1">
              <span className="inline-block px-2.5 py-1 bg-[#e8f5e9] text-[#2e7d32] font-semibold text-[10px] rounded-md border border-[#c8e6c9]/50">
                Kelompok Petani :{" "}
                {farmer.farmer_group?.name || "Tidak Ada Kelompok"}
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kontak No HP & Email (Tengah Kiri) */}
        <div className="hidden md:block w-px bg-zinc-200 self-stretch my-2" />
        <div className="flex flex-col justify-center space-y-3 flex-1 pl-0 md:pl-2">
          <div>
            <span className="text-zinc-400 block text-[10px] font-medium">
              No HP / WA
            </span>
            <span className="font-bold text-zinc-800 text-sm flex items-center gap-1.5 mt-0.5">
              <span className="text-base">📞</span> {farmer.user?.phone || "—"}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px] font-medium">
              Email
            </span>
            <span className="font-bold text-zinc-800 text-xs flex items-center gap-1.5 mt-0.5">
              <span className="text-base">✉️</span> {farmer.user?.email || "—"}
            </span>
          </div>
        </div>

        {/* Kolom Alamat Domisili Petani: Provinsi & Kabupaten (Tengah Kanan) */}
        <div className="hidden md:block w-px bg-zinc-200 self-stretch my-2" />
        <div className="flex flex-col justify-center space-y-3 flex-1 pl-0 md:pl-2">
          <div>
            <span className="text-zinc-400 block text-[10px] font-medium">
              Provinsi
            </span>
            <span className="font-bold text-zinc-800 text-sm mt-0.5 block">
              {farmer.province?.name || "—"}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px] font-medium">
              Kabupaten
            </span>
            <span className="font-bold text-zinc-800 text-sm mt-0.5 block">
              {farmer.city?.name || "—"}
            </span>
          </div>
        </div>

        {/* Kolom Alamat Domisili Petani: Kecamatan & Desa (Kanan) */}
        <div className="hidden md:block w-px bg-zinc-200 self-stretch my-2" />
        <div className="flex flex-col justify-center space-y-3 flex-1 pl-0 md:pl-2">
          <div>
            <span className="text-zinc-400 block text-[10px] font-medium">
              Kecamatan
            </span>
            <span className="font-bold text-zinc-800 text-sm mt-0.5 block">
              {farmer.district?.name || "—"}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px] font-medium">
              Desa / Kelurahan
            </span>
            <span className="font-bold text-zinc-800 text-sm mt-0.5 block">
              {farmer.village?.name || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ==================== 2. AKORDION LIST LAHAN PETANI (PRESISI LAHAN) ==================== */}
      {farmer.lands &&
        farmer.lands.map((land: Land, index: number) => {
          const isLahanOpen = openLahanIndex === index;

          // Payload khusus untuk merender peta lahan tunggal aktif
          const singleFarmerPayload = [
            {
              ...farmer,
              lands: [land],
            },
          ];

          return (
            <div
              key={land.id}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden mb-4"
            >
              {/* Tombol Trigger Akordion Lahan */}
              <button
                onClick={() => setOpenLahanIndex(isLahanOpen ? -1 : index)}
                className="w-full p-5 bg-white flex items-center justify-between hover:bg-zinc-50/40 border-b border-zinc-100 font-bold text-[#0f3424] text-sm tracking-wide transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-xl">📍</span>{" "}
                  Informasi Lahan {index + 1}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isLahanOpen ? "rotate-180" : ""}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {isLahanOpen && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* PARAMETER INFO DETAIL KIRI */}
                    <div className="lg:col-span-5 space-y-3.5 text-sm text-zinc-800 self-start">
                      {[
                        {
                          label: "Lahan",
                          value: land.land_name || `Lahan Ke-${index + 1}`,
                        },
                        {
                          label: "Provinsi",
                          value:
                            land.province?.name || farmer.province?.name || "—",
                        },
                        {
                          label: "Kabupaten / Kota",
                          value: land.city?.name || farmer.city?.name || "—",
                        },
                        {
                          label: "Kecamatan",
                          value:
                            land.district?.name || farmer.district?.name || "—",
                        },
                        {
                          label: "Desa / Kelurahan",
                          value:
                            land.village?.name || farmer.village?.name || "—",
                        },
                        {
                          label: "Status Lahan",
                          value: land.status || "—",
                        },
                        {
                          label: "Luas Lahan",
                          value: land.area
                            ? `${land.area} ${land.unit || "Ha"}`
                            : "—",
                        },
                        {
                          label: "Luas Area",
                          value: land.area ? `${land.area} Area` : "—",
                        },
                        {
                          label: "Koordinat Titik",
                          value: land.polygon_coordinates
                            ? `${land.polygon_coordinates.length} Titik`
                            : "0 Titik",
                        },
                        {
                          label: "Koordinat Tengah",
                          value:
                            land.center_latitude && land.center_longitude
                              ? `${land.center_latitude}, ${land.center_longitude}`
                              : "—",
                          isMono: true,
                        },
                        {
                          label: "Dokumen Kepemilikan",
                          value: land.document_name || "—",
                          isLink: !!land.document_name,
                        },
                        {
                          label: "Catatan",
                          value: land.notes || "—",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-12 items-start gap-1"
                        >
                          {/* Kolom 1: Label Kiri */}
                          <div className="col-span-4 text-zinc-700 font-medium tracking-tight">
                            {item.label}
                          </div>
                          {/* Kolom 2: Simbol Titik Dua */}
                          <div className="col-span-1 text-center text-zinc-900 font-semibold">
                            :
                          </div>
                          {/* Kolom 3: Nilai Kanan */}
                          <div
                            className={`col-span-7 pl-1 text-zinc-900 ${item.isMono ? "font-mono text-[11px]" : "font-semibold"} ${item.isLink ? "text-emerald-700 underline cursor-pointer hover:text-emerald-800" : ""}`}
                          >
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SISI KANAN: MAPS REAL INTERAKTIF & PANEL AGROIKLIM */}
                    <div className="lg:col-span-7 space-y-4">
                      <span className="text-base font-bold text-zinc-400 block uppercase tracking-wider">
                        LOKASI DAN KOORDINAT LAHAN
                      </span>

                      {/* Wadah Map Interaktif */}
                      <div className="w-full h-70 rounded-2xl relative overflow-hidden bg-zinc-50 border border-zinc-200/80 shadow-inner z-0">
                        <MapComponent farmers={singleFarmerPayload} />
                      </div>

                      {/* Indikator Agro-Iklim */}
                      <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mt-2">
                        INDIKATOR AGRO-IKLIM WILAYAH OTOMATIS
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-zinc-100 shadow-sm text-center flex flex-col items-center justify-center">
                          <span className="text-emerald-600 text-base mb-0.5">
                            🌡️
                          </span>
                          <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-tight">
                            Rata-rata Suhu
                          </p>
                          <p className="text-xs font-bold text-zinc-800 mt-0.5">
                            {land.weather_avg_temp || "—"} °C
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-zinc-100 shadow-sm text-center flex flex-col items-center justify-center">
                          <span className="text-amber-500 text-base mb-0.5">
                            🌤️
                          </span>
                          <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-tight">
                            Rata-rata Kl.
                          </p>
                          <p className="text-xs font-bold text-zinc-800 mt-0.5">
                            {land.weather_avg_humidity || "—"} %
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-zinc-100 shadow-sm text-center flex flex-col items-center justify-center">
                          <span className="text-blue-500 text-base mb-0.5">
                            🌧️
                          </span>
                          <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-tight">
                            Hujan/Bulan
                          </p>
                          <p className="text-xs font-bold text-zinc-800 mt-0.5">
                            {land.weather_rainfall || "—"} mm
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. SUB-AKORDION KOMODITAS TANAMAN DI DALAM LAHAN */}
                  <div className="pt-5 border-t border-gray-100 space-y-3 mt-5">
                    {land.plants &&
                      land.plants.map((plant: Plant, pIdx: number) => {
                        const isPlantOpen = openPlantIndex === pIdx;
                        return (
                          <div
                            key={plant.id}
                            className="border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                          >
                            {/* Header Tanaman Baris */}
                            <div
                              onClick={() =>
                                setOpenPlantIndex(isPlantOpen ? -1 : pIdx)
                              }
                              className="p-3 bg-white hover:bg-gray-50/50 flex items-center justify-between cursor-pointer border-b border-gray-50 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500/10 text-xl rounded-xl flex items-center justify-center">
                                  {plant.name?.toLowerCase().includes("jagung")
                                    ? "🌽"
                                    : "🌶️"}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">
                                    {plant.name || "Komoditas Tanaman"}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                                      {plant.planted_area || "—"}
                                    </span>
                                    <span>Lahan {index + 1}</span>
                                    <span>•</span>
                                    <span className="text-gray-500">
                                      📍{" "}
                                      {land.district?.name ||
                                        farmer.district?.name ||
                                        "—"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isPlantOpen ? "rotate-180" : ""}`}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                />
                              </svg>
                            </div>

                            {/* Detail Konten Tanaman */}
                            {isPlantOpen && (
                              <div className="p-4 bg-white space-y-4 text-sm">
                                <span className="text-base font-bold text-emerald-800 block uppercase tracking-wider border-b border-emerald-50 pb-1">
                                  Informasi Tanaman
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <span className="text-gray-400 block text-sm">
                                      Nama Tanaman
                                    </span>
                                    <span className="font-bold text-gray-900">
                                      {plant.name || "—"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-sm">
                                      Varietas / Jenis
                                    </span>
                                    <span className="font-bold text-gray-900">
                                      {plant.crop_type || "—"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-sm">
                                      Luas Ditanam
                                    </span>
                                    <span className="font-bold text-gray-900">
                                      {land.area || "—"} {land.unit || "Ha"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-sm">
                                      Tanggal Tanam
                                    </span>
                                    <span className="font-bold text-gray-900">
                                      {plant.planting_date || "—"}
                                    </span>
                                  </div>
                                </div>
                                <div className="pt-2">
                                  <span className="text-gray-400 block text-sm font-medium">
                                    Catatan
                                  </span>
                                  <p className="text-gray-700 mt-0.5 italic">
                                    {plant.notes ||
                                      "Tidak ada catatan untuk tanaman ini."}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
