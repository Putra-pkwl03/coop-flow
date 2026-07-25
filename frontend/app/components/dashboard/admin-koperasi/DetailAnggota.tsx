"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import api from "../../../lib/axios";

// Memuat MapComponent secara dinamis tanpa SSR
const MapComponent = dynamic(() => import("../MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs animate-pulse">
      Memuat Peta Citra Satelit Lahan...
    </div>
  ),
});

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
  ownership_document?: string;
  notes?: string;
  location_address?: string;
  weather_avg_temp?: string | number;
  weather_avg_humidity?: string | number;
  weather_rainfall?: string | number;
  average_temperature?: string | number;
  average_humidity?: string | number;
  average_monthly_precipitation?: string | number;
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

// Helper untuk Render Ikon Komoditas Tanaman
const renderPlantIcon = (name?: string) => {
  const lower = name?.toLowerCase() || "";

  if (lower.includes("padi")) {
    return (
      <svg
        className="w-5 h-5 text-emerald-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M12 18l-4-3m4 3l4-3M12 14l-5-3.5m5 3.5l5-3.5M12 10l-4-3m4 3l4-3M12 6l-3-2m3 2l3-2" />
      </svg>
    );
  }
  if (lower.includes("jagung")) {
    return (
      <svg
        className="w-5 h-5 text-amber-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2c-4 4-5 9-5 13a5 5 0 0 0 10 0c0-4-1-9-5-13z" />
        <path d="M12 22v-3" />
        <path d="M9 10h6M8 14h8" />
      </svg>
    );
  }
  if (lower.includes("cabai") || lower.includes("cabe")) {
    return (
      <svg
        className="w-5 h-5 text-rose-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2c1 2 0 4-1 5C8 9 6 12 6 16a6 6 0 0 0 12 0c0-5-3-9-6-14z" />
        <path d="M12 2v3" />
      </svg>
    );
  }
  return (
    <svg
      className="w-5 h-5 text-emerald-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22v-8M12 14C8 14 5 10 5 6c4 0 7 3 7 8M12 14c4 0 7-3 7-8-4 0-7 3-7 8" />
    </svg>
  );
};

export default function DetailAnggota({
  farmerId,
  onBack,
}: DetailAnggotaProps) {
  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openLahanIndex, setOpenLahanIndex] = useState<number>(0);
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
      <div className="bg-gray-50 min-h-screen text-gray-800">
        {/* Header & Tombol Kembali tetap tampil */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-xs"
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

        {/* SKELETON KARTU PROFIL ATAS */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-stretch gap-6 w-full animate-pulse">
          <div className="flex items-center gap-5 flex-[1.2] min-w-70">
            <div className="w-20 h-20 bg-zinc-200 rounded-full shrink-0" />
            <div className="space-y-2.5 flex-1">
              <div className="h-4 w-36 bg-zinc-200 rounded" />
              <div className="h-3 w-28 bg-zinc-200 rounded" />
              <div className="h-5 w-40 bg-zinc-200 rounded-md" />
            </div>
          </div>

          <div className="hidden md:block w-px bg-zinc-200 self-stretch my-2" />
          <div className="flex flex-col justify-center space-y-4 flex-1 pl-0 md:pl-2">
            <div className="space-y-1.5">
              <div className="h-2.5 w-16 bg-zinc-200 rounded" />
              <div className="h-3.5 w-24 bg-zinc-200 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-12 bg-zinc-200 rounded" />
              <div className="h-3.5 w-32 bg-zinc-200 rounded" />
            </div>
          </div>

          <div className="hidden md:block w-px bg-zinc-200 self-stretch my-2" />
          <div className="flex flex-col justify-center space-y-4 flex-1 pl-0 md:pl-2">
            <div className="space-y-1.5">
              <div className="h-2.5 w-14 bg-zinc-200 rounded" />
              <div className="h-3.5 w-20 bg-zinc-200 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-16 bg-zinc-200 rounded" />
              <div className="h-3.5 w-24 bg-zinc-200 rounded" />
            </div>
          </div>

          <div className="hidden md:block w-px bg-zinc-200 self-stretch my-2" />
          <div className="flex flex-col justify-center space-y-4 flex-1 pl-0 md:pl-2">
            <div className="space-y-1.5">
              <div className="h-2.5 w-16 bg-zinc-200 rounded" />
              <div className="h-3.5 w-20 bg-zinc-200 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 bg-zinc-200 rounded" />
              <div className="h-3.5 w-24 bg-zinc-200 rounded" />
            </div>
          </div>
        </div>

        {/* SKELETON KARTU LAHAN (collapsed) */}
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={`land-skeleton-${idx}`}
            className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden mb-4 animate-pulse"
          >
            <div className="w-full p-4 md:p-5 bg-white flex items-center justify-between border-b border-zinc-100">
              <span className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-200 shrink-0" />
                <div className="h-3.5 w-32 bg-zinc-200 rounded" />
              </span>
              <div className="w-4 h-4 bg-zinc-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  if (error || !farmer)
    return (
      <div className="p-6 text-center text-red-500">
        {error || "Data tidak ditemukan."}
      </div>
    );

  return (
    <div className=" bg-gray-50 min-h-screen text-gray-800">
      {/* Header & Tombol Kembali */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-xs"
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

      {/* ==================== 1. KARTU PROFIL ATAS ==================== */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-stretch gap-6 w-full">
        {/* Foto & Nama Utama */}
        <div className="flex items-center gap-5 flex-[1.2] min-w-70">
          <div className="w-20 h-20 bg-zinc-200 text-zinc-400 rounded-full flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-14 h-14 text-zinc-400"
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
            <div className="pt-1">
              <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold text-[10px] rounded-md border border-emerald-200/50">
                Kelompok Petani :{" "}
                {farmer.farmer_group?.name || "Tidak Ada Kelompok"}
              </span>
            </div>
          </div>
        </div>

        {/* Kontak */}
        <div className="hidden md:block w-px bg-zinc-200 self-stretch my-2" />
        <div className="flex flex-col justify-center space-y-3 flex-1 pl-0 md:pl-2">
          <div>
            <span className="text-zinc-400 block text-[10px] font-medium">
              No HP / WA
            </span>
            <span className="font-bold text-zinc-800 text-sm flex items-center gap-1.5 mt-0.5">
              <svg
                className="w-4 h-4 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {farmer.user?.phone || "—"}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px] font-medium">
              Email
            </span>
            <span className="font-bold text-zinc-800 text-xs flex items-center gap-1.5 mt-0.5">
              <svg
                className="w-4 h-4 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {farmer.user?.email || "—"}
            </span>
          </div>
        </div>

        {/* Alamat Provinsi & Kabupaten */}
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

        {/* Alamat Kecamatan & Desa */}
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

      {/* ==================== 2. AKORDION LIST LAHAN PETANI ==================== */}
      {farmer.lands &&
        farmer.lands.map((land: Land, index: number) => {
          const isLahanOpen = openLahanIndex === index;

          const singleFarmerPayload = [
            {
              ...farmer,
              lands: [land],
            },
          ];

          const docValue = land.ownership_document || land.document_name;
          const notesValue = land.notes || land.location_address;

          const tempValue = land.average_temperature ?? land.weather_avg_temp;
          const humidityValue =
            land.average_humidity ?? land.weather_avg_humidity;
          const rainfallValue =
            land.average_monthly_precipitation ?? land.weather_rainfall;

          return (
            <div
              key={land.id || index}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden mb-4"
            >
              {/* Trigger Akordion Lahan */}
              <button
                onClick={() => setOpenLahanIndex(isLahanOpen ? -1 : index)}
                className="w-full p-4 md:p-5 bg-white flex items-center justify-between hover:bg-zinc-50/50 border-b border-zinc-100 font-bold text-[#0f3424] text-sm tracking-wide transition-colors"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  Informasi Lahan {index + 1}
                </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                    isLahanOpen ? "rotate-180" : ""
                  }`}
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
                    <div className="lg:col-span-5 flex flex-col">
                      <div className="space-y-3.5 text-sm text-zinc-800">
                        {[
                          {
                            label: "Lahan",
                            value: land.land_name || `Lahan Ke-${index + 1}`,
                          },
                          {
                            label: "Provinsi",
                            value:
                              land.province?.name ||
                              farmer.province?.name ||
                              "—",
                          },
                          {
                            label: "Kabupaten / Kota",
                            value: land.city?.name || farmer.city?.name || "—",
                          },
                          {
                            label: "Kecamatan",
                            value:
                              land.district?.name ||
                              farmer.district?.name ||
                              "—",
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
                            label: "Catatan",
                            value: notesValue || "—",
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-12 items-start gap-1"
                          >
                            <div className="col-span-4 text-zinc-700 font-medium tracking-tight">
                              {item.label}
                            </div>
                            <div className="col-span-1 text-center text-zinc-900 font-semibold">
                              :
                            </div>
                            <div
                              className={`col-span-7 pl-1 text-zinc-900 ${
                                item.isMono
                                  ? "font-mono text-[11px]"
                                  : "font-semibold"
                              }`}
                            >
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ---------------- BAGIAN DOKUMEN ---------------- */}
                      <div className="mt-6 pt-5 border-t border-zinc-100">
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider mb-3">
                          Dokumen Kepemilikan Lahan
                        </span>

                        {docValue ? (
                          <div
                            onClick={() => {
                              const url = docValue.startsWith("http")
                                ? docValue
                                : `${process.env.NEXT_PUBLIC_API_URL || ""}/storage/${docValue}`;
                              window.open(url, "_blank");
                            }}
                            className="flex items-center gap-3 p-3 bg-white border border-zinc-200/80 rounded-xl hover:bg-zinc-50 cursor-pointer shadow-sm transition-all group"
                          >
                            {/* Ikon Dokumen - Style PDF Kemenko */}
                            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center shrink-0 border border-rose-100/50 group-hover:bg-rose-100 transition-colors">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-6 h-6"
                              >
                                <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" />
                                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                              </svg>
                            </div>

                            {/* Info Text */}
                            <div className="flex flex-col flex-1 overflow-hidden">
                              <p className="text-sm font-bold text-zinc-900 truncate">
                                {docValue.split("/").pop() ||
                                  "Dokumen-Lahan-Petani.pdf"}
                              </p>
                              <p className="text-[11px] text-zinc-500 font-medium mt-0.5 group-hover:text-emerald-600 transition-colors">
                                Ketuk untuk melihat dokumen
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center">
                            <p className="text-sm text-zinc-400 italic">
                              Tidak ada dokumen tertaut
                            </p>
                          </div>
                        )}
                      </div>
                      {/* ---------------- END BAGIAN DOKUMEN ---------------- */}
                    </div>

                    {/* SISI KANAN: MAPS REAL INTERAKTIF & PANEL AGROIKLIM */}
                    <div className="lg:col-span-7 space-y-4">
                      <span className="text-xs font-bold text-zinc-400 block uppercase tracking-wider">
                        LOKASI DAN KOORDINAT LAHAN
                      </span>

                      {/* Map Container */}
                      <div
                        key={`map-wrapper-${land.id || index}`}
                        className="w-full h-70 rounded-2xl relative overflow-hidden bg-zinc-50 border border-zinc-200/80 shadow-inner z-0"
                      >
                        <MapComponent
                          key={`map-instance-${land.id || index}`}
                          farmers={singleFarmerPayload}
                        />
                      </div>

                      {/* INDIKATOR AGRO-IKLIM DENGAN IKON VECTOR RELEVAN */}
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider mt-3">
                        INDIKATOR AGRO-IKLIM WILAYAH OTOMATIS
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        {/* 1. IKON SUHU (Thermometer) */}
                        <div className="bg-white p-3 rounded-xl border border-zinc-200/60 shadow-2xs text-center flex flex-col items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                            </svg>
                          </div>
                          <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-tight">
                            RATA-RATA SUHU
                          </p>
                          <p className="text-xs font-bold text-zinc-800 mt-0.5">
                            {tempValue !== undefined &&
                            tempValue !== null &&
                            tempValue !== ""
                              ? `${tempValue} °C`
                              : "—"}
                          </p>
                        </div>

                        {/* 2. IKON KELEMBAPAN (Water Droplet) */}
                        <div className="bg-white p-3 rounded-xl border border-zinc-200/60 shadow-2xs text-center flex flex-col items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />
                            </svg>
                          </div>
                          <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-tight">
                            RATA-RATA KL.
                          </p>
                          <p className="text-xs font-bold text-zinc-800 mt-0.5">
                            {humidityValue !== undefined &&
                            humidityValue !== null &&
                            humidityValue !== ""
                              ? `${humidityValue} %`
                              : "—"}
                          </p>
                        </div>

                        {/* 3. IKON CURAH HUJAN (Cloud Rain) */}
                        <div className="bg-white p-3 rounded-xl border border-zinc-200/60 shadow-2xs text-center flex flex-col items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                              <path d="M16 14v6" />
                              <path d="M8 14v6" />
                              <path d="M12 16v6" />
                            </svg>
                          </div>
                          <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-tight">
                            HUJAN / BULAN
                          </p>
                          <p className="text-xs font-bold text-zinc-800 mt-0.5">
                            {rainfallValue !== undefined &&
                            rainfallValue !== null &&
                            rainfallValue !== ""
                              ? `${rainfallValue} mm`
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. SUB-AKORDION KOMODITAS TANAMAN */}
                  <div className="pt-5 border-t border-gray-100 space-y-3 mt-5">
                    {land.plants &&
                      land.plants.map((plant: Plant, pIdx: number) => {
                        const isPlantOpen = openPlantIndex === pIdx;

                        return (
                          <div
                            key={plant.id || pIdx}
                            className="border border-gray-200/80 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
                          >
                            <div
                              onClick={() =>
                                setOpenPlantIndex(isPlantOpen ? -1 : pIdx)
                              }
                              className="p-3.5 bg-white hover:bg-gray-50/80 flex items-center justify-between cursor-pointer transition-colors text-sm"
                            >
                              <div className="flex items-center gap-3">
                                {/* Ikon Komoditas Vector */}
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100/80">
                                  {renderPlantIcon(plant.name)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 capitalize">
                                    {plant.name || "Komoditas Tanaman"}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                    <span className="bg-gray-100 font-medium px-2 py-0.5 rounded text-gray-600">
                                      {plant.planted_area || land.area || "—"}{" "}
                                      {land.unit || "Ha"}
                                    </span>
                                    <span>•</span>
                                    <span>Lahan {index + 1}</span>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1 text-gray-500">
                                      <svg
                                        className="w-3 h-3 text-emerald-600 inline"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                        <circle cx="12" cy="10" r="3" />
                                      </svg>{" "}
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
                                strokeWidth={2}
                                stroke="currentColor"
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                  isPlantOpen ? "rotate-180" : ""
                                }`}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                />
                              </svg>
                            </div>

                            {isPlantOpen && (
                              <div className="p-4 bg-gray-50/50 border-t border-gray-100 space-y-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                    INFORMASI TANAMAN
                                  </span>
                                  <div className="h-px bg-emerald-100 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-3.5 rounded-lg border border-gray-100 shadow-2xs">
                                  <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-1">
                                      Nama Tanaman
                                    </span>
                                    <span className="font-semibold text-gray-900 capitalize block">
                                      {plant.name || "—"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-1">
                                      Luas Ditanam
                                    </span>
                                    <span className="font-semibold text-gray-900 block">
                                      {plant.planted_area || land.area || "—"}{" "}
                                      {land.unit || "Ha"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-1">
                                      Tanggal Tanam
                                    </span>
                                    <span className="font-semibold text-gray-900 block">
                                      {plant.planting_date || "—"}
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-white p-3.5 rounded-lg border border-gray-100 shadow-2xs">
                                  <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-1">
                                    Catatan
                                  </span>
                                  <p className="text-gray-600 text-xs italic">
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
