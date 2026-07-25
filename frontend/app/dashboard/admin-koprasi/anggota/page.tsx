"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/axios";
import DetailAnggota from "../../../components/dashboard/admin-koperasi/DetailAnggota";
import FilterAnggota from "../../../components/dashboard/admin-koperasi/FilterAnggota";
import FormTambahPetani from "../../../components/dashboard/admin-koperasi/FormTambahPetani"; 

export default function AnggotaPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);

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
    <div className="bg-gray-50 text-gray-800">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F7B4A]">
          Data Anggota Petani
        </h1>
        <p className="text-xs text-gray-500">Berikut ini adalah data petani</p>
      </div>

      {/* Komponen Filter & Search */}
      <FilterAnggota
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        wilayahFilter={wilayahFilter}
        setWilayahFilter={setWilayahFilter}
        kelompokFilter={kelompokFilter}
        setKelompokFilter={setKelompokFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        availRegions={availRegions}
        availGroups={availGroups}
        onResetFilters={handleResetFilters}
        onAddFarmer={() => setIsAddFormOpen(!isAddFormOpen)}
      />

      {/* RENDER KONDISIONAL FORM TAMBAH PETANI (Di atas Table, Di bawah Search/Filter) */}
      {isAddFormOpen && (
        <FormTambahPetani
          availGroups={availGroups}
          onSuccess={() => {
            setIsAddFormOpen(false);
            fetchFarmers();
          }}
          onCancel={() => setIsAddFormOpen(false)}
        />
      )}

      {/* Tabel Data Petani */}
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
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="py-4 px-6 text-center">
                      <div className="h-3 w-4 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-3 w-6 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-3 w-28 bg-gray-200 rounded" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-red-500 font-medium"
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredFarmers.length > 0 ? (
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
    </div>
  );
}