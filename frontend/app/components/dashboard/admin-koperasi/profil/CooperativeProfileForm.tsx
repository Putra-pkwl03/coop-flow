"use client";

import React, { useState, useEffect, useRef } from "react";

export interface CooperativeData {
  id: number;
  name: string;
  cooperative_code: string;
  nib_cooperative: string | null;
  legal_approval_document: string | null;
  legal_approval_number: string | null;
  established_date: string | null;
  npwp: string | null;
  address: string | null;
  email_cooperative: string | null;
  phone_cooperative: string | null;
  postal_code: string | null;
  province: string | null;
  city_koor: string | null;
  district: string | null;
  village: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  warehouse_surface_area: number | null;
  warehouse_capacity_ton: number | null;
  warehouse_facilities: string | null;
  is_activated: boolean;
  is_profile_completed: boolean;
  users_count?: number;
}

interface FormProps {
  initialData: CooperativeData;
  onSubmit: (formData: CooperativeData) => Promise<void>;
  isSubmitting: boolean;
}

export default function CooperativeProfileForm({
  initialData,
  onSubmit,
  isSubmitting,
}: FormProps) {
  // Form State
  const [formData, setFormData] = useState<CooperativeData>(initialData);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Ref Leaflet Map
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Synchronize state jika initialData berubah setelah fetch API selesai
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? null
            : Number(value)
          : value === ""
          ? null
          : value,
    }));
  };

  // Auto Geocoding via Nominatim API
  const handleAutoGeocode = async () => {
    const searchQuery = [
      formData.village,
      formData.district,
      formData.city_koor,
      formData.province,
      "Indonesia",
    ]
      .filter(Boolean)
      .join(", ");

    if (!searchQuery) return;

    try {
      setIsGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const newLat = Number(Number(data[0].lat).toFixed(6));
        const newLng = Number(Number(data[0].lon).toFixed(6));

        setFormData((prev) => ({
          ...prev,
          latitude: newLat,
          longitude: newLng,
        }));

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 14);
          markerRef.current.setLatLng([newLat, newLng]);
        }
      }
    } catch (error) {
      console.error("Gagal mendeteksi lokasi otomatis:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Inisialisasi & Update Peta Leaflet
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current) return;

      const L = (await import("leaflet")).default;
      import("leaflet/dist/leaflet.css");

      if (!isMounted) return;

      // Fallback ke Yogyakarta (Sleman/Godean) jika null
      const lat = formData.latitude ? Number(formData.latitude) : -7.7713;
      const lng = formData.longitude ? Number(formData.longitude) : 110.3002;

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([lat, lng], 13);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        const customIcon = L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });

        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);
        markerRef.current = marker;

        marker.on("dragend", (e: any) => {
          const pos = e.target.getLatLng();
          setFormData((prev) => ({
            ...prev,
            latitude: Number(pos.lat.toFixed(6)),
            longitude: Number(pos.lng.toFixed(6)),
          }));
        });

        map.on("click", (e: any) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          marker.setLatLng([clickLat, clickLng]);
          setFormData((prev) => ({
            ...prev,
            latitude: Number(clickLat.toFixed(6)),
            longitude: Number(clickLng.toFixed(6)),
          }));
        });
      } else {
        // Update marker jika posisi berubah dari luar
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [formData.latitude, formData.longitude]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200"
    >
      {/* 1. Header Ringkasan & Jumlah Anggota */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Koperasi Terdaftar
          </span>
          <h2 className="text-xl font-bold text-slate-800">{formData.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kode:{" "}
            <span className="font-mono text-emerald-700 font-bold">
              {formData.cooperative_code}
            </span>
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200/60 text-right">
          <span className="text-xs font-medium block">Total Anggota/Petani</span>
          <span className="text-lg font-bold">
            {formData.users_count || 0} Orang
          </span>
        </div>
      </div>

      {/* 2. Informasi Legalitas & Identitas */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-2">
          1. Legalitas & Identitas Koperasi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIB Koperasi
            </label>
            <input
              type="text"
              name="nib_cooperative"
              value={formData.nib_cooperative ?? ""}
              onChange={handleChange}
              placeholder="Masukkan NIB"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NPWP Koperasi
            </label>
            <input
              type="text"
              name="npwp"
              value={formData.npwp ?? ""}
              onChange={handleChange}
              placeholder="Masukkan NPWP"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor SK / Pengesahan Hukum
            </label>
            <input
              type="text"
              name="legal_approval_number"
              value={formData.legal_approval_number ?? ""}
              onChange={handleChange}
              placeholder="Nomor SK Kemenkumham"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Berdiri
            </label>
            <input
              type="date"
              name="established_date"
              value={
                formData.established_date
                  ? formData.established_date.split("T")[0]
                  : ""
              }
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Kontak & Wilayah Administrasi */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-2">
          2. Kontak & Alamat Wilayah
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Resmi
            </label>
            <input
              type="email"
              name="email_cooperative"
              value={formData.email_cooperative ?? ""}
              onChange={handleChange}
              placeholder="email@koperasi.id"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Telepon / WhatsApp
            </label>
            <input
              type="text"
              name="phone_cooperative"
              value={formData.phone_cooperative ?? ""}
              onChange={handleChange}
              placeholder="08123456789"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Provinsi
            </label>
            <input
              type="text"
              name="province"
              value={formData.province ?? ""}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kabupaten / Kota
            </label>
            <input
              type="text"
              name="city_koor"
              value={formData.city_koor ?? ""}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kecamatan
            </label>
            <input
              type="text"
              name="district"
              value={formData.district ?? ""}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Desa / Kelurahan
            </label>
            <input
              type="text"
              name="village"
              value={formData.village ?? ""}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kode Pos
            </label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code ?? ""}
              onChange={handleChange}
              placeholder="Contoh: 55564"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Jalan / RT / RW
            </label>
            <textarea
              rows={2}
              name="address"
              value={formData.address ?? ""}
              onChange={handleChange}
              placeholder="Jl. Raya No. 123..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Kapasitas Logistik & Gudang */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-2">
          3. Logistik & Fasilitas Gudang
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kapasitas Gudang (Ton) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="warehouse_capacity_ton"
              value={formData.warehouse_capacity_ton ?? ""}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Luas Permukaan Gudang (m²)
            </label>
            <input
              type="number"
              name="warehouse_surface_area"
              value={formData.warehouse_surface_area ?? ""}
              onChange={handleChange}
              placeholder="Contoh: 500"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fasilitas Gudang
            </label>
            <textarea
              rows={2}
              name="warehouse_facilities"
              value={formData.warehouse_facilities ?? ""}
              onChange={handleChange}
              placeholder="Contoh: Cold storage, Dryer, Timbangan Digital..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 5. Geocoding & Peta Lokasi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-base font-bold text-slate-800">
            4. Lokasi Geospatial / Titik Koordinat
          </h3>
          <button
            type="button"
            onClick={handleAutoGeocode}
            disabled={isGeocoding}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            {isGeocoding ? (
              <span>Mencari Lokasi...</span>
            ) : (
              <span>📍 Deteksi Otomatis dari Desa/Kecamatan</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-mono"
            />
          </div>
        </div>

        <div
          ref={mapRef}
          className="w-full h-72 rounded-xl border border-slate-200 overflow-hidden z-0"
        ></div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>Simpan Seluruh Perubahan</span>
          )}
        </button>
      </div>
    </form>
  );
}