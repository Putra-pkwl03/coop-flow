"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/axios";
import DetailAnggota from "../../../components/dashboard/admin-koperasi/DetailAnggota";

export default function AnggotaPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk kontrol buka/tutup panel filter (Kunci Perbaikan)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // State Parameter Filter
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua Status");
  const [wilayahFilter, setWilayahFilter] = useState<string>("Semua Wilayah");
  const [kelompokFilter, setKelompokFilter] = useState<string>(
    "Semua Kelompok Tani",
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Master Data Dropdown
  const [availGroups, setAvailGroups] = useState<string[]>([]);
  const [availRegions, setAvailRegions] = useState<string[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/farmers");

      let dataPetani: any[] = [];
      if (response.data && response.data.success) {
        dataPetani = response.data.data;
      } else if (Array.isArray(response.data)) {
        dataPetani = response.data;
      }

      setFarmers(dataPetani);

      const groups = Array.from(
        new Set(dataPetani.map((f) => f.farmer_group?.name).filter(Boolean)),
      ) as string[];
      setAvailGroups(groups);

      const regions = Array.from(
        new Set(
          dataPetani.map((f) => f.district || f.user?.address).filter(Boolean),
        ),
      ) as string[];
      setAvailRegions(regions);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data dari server Laravel",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("Semua Status");
    setWilayahFilter("Semua Wilayah");
    setKelompokFilter("Semua Kelompok Tani");
    setStartDate("");
    setEndDate("");
  };

  // Logika Filter Berlapis
  const filteredFarmers = farmers.filter((f) => {
    const nameMatch = f.user?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const nikMatch = f.nik?.includes(searchTerm);
    const matchesSearch = searchTerm ? nameMatch || nikMatch : true;

    const matchesStatus =
      statusFilter === "Semua Status" ||
      f.status_validation?.toLowerCase() === statusFilter.toLowerCase() ||
      f.status?.toLowerCase() === statusFilter.toLowerCase();

    const farmerRegion = f.district || f.user?.address || "";
    const matchesWilayah =
      wilayahFilter === "Semua Wilayah" || farmerRegion === wilayahFilter;

    const matchesKelompok =
      kelompokFilter === "Semua Kelompok Tani" ||
      f.farmer_group?.name === kelompokFilter;

    let matchesDate = true;
    if (f.created_at) {
      const createdAt = new Date(f.created_at).getTime();
      if (startDate)
        matchesDate = matchesDate && createdAt >= new Date(startDate).getTime();
      if (endDate)
        matchesDate = matchesDate && createdAt <= new Date(endDate).getTime();
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesWilayah &&
      matchesKelompok &&
      matchesDate
    );
  });

  if (selectedFarmerId !== null) {
    return (
      <DetailAnggota
        farmerId={selectedFarmerId}
        onBack={() => {
          setSelectedFarmerId(null);
          fetchFarmers();
        }}
      />
    );
  }

  return (
    <div className=" bg-gray-50  text-gray-800">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F7B4A]">
          Data Anggota Petani
        </h1>
        <p className="text-xs text-gray-500">Berikut ini adalah data petani</p>
      </div>

      {/* Container Utama Pencarian & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
        {/* Row 1: Search Bar & Toggle Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari nama atau NIK petani...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>

          {/* Tombol Filter dengan fungsi onClick Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
              isFilterOpen
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-medium"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.24 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
              />
            </svg>
            Filter
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-3 h-3 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        </div>

        {/* Kondisional Render: Hanya muncul jika isFilterOpen === true */}
        {isFilterOpen && (
          <div className="pt-4 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Dropdown Status */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Status Validasi
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option>Semua Status</option>
                  <option>Aktif</option>
                  <option>Pending</option>
                  <option>Ditolak</option>
                </select>
              </div>

              {/* Dropdown Wilayah */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Wilayah
                </label>
                <select
                  value={wilayahFilter}
                  onChange={(e) => setWilayahFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option>Semua Wilayah</option>
                  {availRegions.map((reg, idx) => (
                    <option key={idx} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown Kelompok Tani */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Kelompok Tani
                </label>
                <select
                  value={kelompokFilter}
                  onChange={(e) => setKelompokFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option>Semua Kelompok Tani</option>
                  {availGroups.map((grp, idx) => (
                    <option key={idx} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Mulai */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Tanggal Selesai */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterOpen(false)} // Menutup panel setelah diterapkan
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Terapkan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabel Data Petani */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Memuat data petani dari server
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 font-medium">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6 w-16 text-center">No</th>
                  <th className="py-4 px-6">Nama Petani</th>
                  <th className="py-4 px-6">NIK</th>
                  <th className="py-4 px-6">Luas Lahan</th>
                  <th className="py-4 px-6 text-center">Jumlah Lahan</th>
                  <th className="py-4 px-6">Kelompok Petani</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredFarmers.length > 0 ? (
                  filteredFarmers.map((farmer, idx) => (
                    <tr
                      key={farmer.id}
                      onClick={() => setSelectedFarmerId(farmer.id)}
                      className="hover:bg-gray-50/75 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 text-center font-medium text-gray-400">
                        {idx + 1}.
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {farmer.user?.name || "Kk Putra Pkwl"}
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {farmer.nik || "-"}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {farmer.total_land_area || farmer.lands?.[0]?.area || 0}{" "}
                        Ha
                      </td>
                      <td className="py-4 px-6 text-center text-gray-700">
                        {farmer.lands?.length || 0}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {farmer.farmer_group?.name || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Tidak ada data anggota petani yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
