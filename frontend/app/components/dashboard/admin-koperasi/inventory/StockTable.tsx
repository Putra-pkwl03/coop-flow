"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "../../../../lib/axios";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import AddFertilizerModal from "./AddFertilizerModal"; 
import EditFertilizerModal from "./EditFertilizerModal";
import DeleteFertilizerModal from "./DeleteFertilizerModal";

interface FertilizerItem {
  id: number;
  fertilizer_code: string;
  name: string;
  image: string | null;
  current_stock_kg: number;
  packaging_size_kg: number;
  price_per_kg: number;
  status?: "tersedia" | "menipis" | "habis";
}

interface StockTableProps {
  stocks: FertilizerItem[];
  refreshData: () => void;
}

export default function StockTable({ stocks, refreshData }: StockTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // State manajemen modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // State penyimpanan item aktif terpilih
  const [selectedFertilizer, setSelectedFertilizer] = useState<FertilizerItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isRiwayatActive = pathname.endsWith("/riwayat");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Memicu pembukaan modal hapus kustom UI
  const triggerDeleteModal = (item: FertilizerItem) => {
    const packagingSize = item.packaging_size_kg || 50;
    const totalBags = Math.ceil(item.current_stock_kg / packagingSize);
    
    setSelectedFertilizer(item);
    setIsDeleteModalOpen(true);
  };

  // Eksekusi hapus data dari modal kustom
  const confirmDelete = async () => {
    if (!selectedFertilizer) return;
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem("access_token");
      await api.delete(`/cooperative/fertilizers/${selectedFertilizer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setIsDeleteModalOpen(false);
      Toast.fire({ icon: "success", title: "Data pupuk berhasil dihapus." });
      refreshData();
    } catch (error: any) {
      console.error("Gagal menghapus pupuk", error);
      setIsDeleteModalOpen(false);
      Toast.fire({
        icon: "error",
        title: error.response?.data?.message || "Gagal menghapus data pupuk.",
      });
    } finally {
      setDeleteLoading(false);
      setSelectedFertilizer(null);
    }
  };

  const triggerEditModal = (item: FertilizerItem) => {
    setSelectedFertilizer(item);
    setIsEditModalOpen(true);
  };

  const renderStatusBadge = (item: FertilizerItem) => {
    const stock = item.current_stock_kg || 0;
    let computedStatus = item.status;
    if (!computedStatus) {
      if (stock === 0) computedStatus = "habis";
      else if (stock <= 250) computedStatus = "menipis";
      else computedStatus = "tersedia";
    }

    switch (computedStatus) {
      case "habis":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-100">Habis</span>;
      case "menipis":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-500 border border-amber-100">Menipis</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-500 border border-emerald-100">Tersedia</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* BARIS UTAMA: TOMBOL TAMBAH PUPUK */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-[#00b56c] hover:bg-emerald-600 text-white cursor-pointer px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-all"
        >
          <FaPlus className="text-xs" />
          <span>Tambah Pupuk</span>
        </button>
      </div>

      {/* TAB NAVIGASI */}
      <div className="flex border-b border-zinc-200 gap-6 text-sm font-medium">
        <button
          onClick={() => router.push("/dashboard/admin-koprasi/stok-inventaris")}
          className={`pb-3 px-1 border-b-2 transition-all font-semibold ${
            !isRiwayatActive ? "border-emerald-600 text-emerald-600 font-bold" : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Stok Saat Ini
        </button>
        <button
          onClick={() => router.push("/dashboard/admin-koprasi/stok-inventaris/riwayat")}
          className={`pb-3 px-1 border-b-2 transition-all font-semibold ${
            isRiwayatActive ? "border-emerald-600 text-emerald-600 font-bold" : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Riwayat Stok
        </button>
      </div>

      {/* TABEL UTAMA */}
      <div className="w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-t-2 border-zinc-200 text-zinc-700 text-sm font-semibold">
                <th className="py-4 px-4 text-center w-14">No</th>
                <th className="py-4 px-6">Pupuk</th>
                <th className="py-4 px-4">Kode</th>
                <th className="py-4 px-4">Stok Tersedia</th>
                <th className="py-4 px-4">Stok (Karung)</th>
                <th className="py-4 px-4">Harga Perkarung</th>
                <th className="py-4 px-4">Nilai Stok</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-zinc-800">
              {stocks.map((item, index) => {
                const packagingSize = item.packaging_size_kg || 50;
                const totalBags = Math.ceil(item.current_stock_kg / packagingSize);
                const pricePerBag = item.price_per_kg * packagingSize;
                const totalStockValue = item.current_stock_kg * item.price_per_kg;
                const isOutOfStock = item.current_stock_kg === 0;

                // Memastikan prefix URL gambar lengkap menuju direktori storage laravel
                const imageUrl = item.image ? `${baseUrl}${item.image}` : "https://placehold.co/40x40?text=Pupuk";

                return (
                  <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50/60 transition-colors">
                    <td className="py-4 px-4 text-center text-zinc-500 font-normal">{index + 1}</td>
                    <td className="py-4 px-6 font-bold text-zinc-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-md border border-zinc-100 bg-zinc-50 flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=Pupuk"; }}
                        />
                        <span className="whitespace-nowrap">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-900 font-bold uppercase">{item.fertilizer_code || "-"}</td>
                    <td className="py-4 px-4 font-bold text-zinc-900">{isOutOfStock ? "0 Kg" : `${item.current_stock_kg.toLocaleString("id-ID")} Kg`}</td>
                    <td className="py-4 px-4 text-zinc-800">{isOutOfStock ? "0 Karung" : `${totalBags} Karung`}</td>
                    <td className="py-4 px-4 text-zinc-800">{isOutOfStock ? "Rp -" : `Rp ${pricePerBag.toLocaleString("id-ID")}`}</td>
                    <td className="py-4 px-4 font-bold text-zinc-900">{isOutOfStock ? "Rp -" : `Rp ${totalStockValue.toLocaleString("id-ID")}`}</td>
                    <td className="py-4 px-6 text-center">{renderStatusBadge(item)}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center items-center gap-4">
                        <button 
                          onClick={() => triggerDeleteModal(item)} 
                          className="text-red-500 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                        <button 
                          onClick={() => triggerEditModal(item)} 
                          className="text-blue-500 cursor-pointer hover:text-blue-600 p-1 border border-zinc-200 rounded-md shadow-sm transition-colors bg-white hover:bg-zinc-50"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER MODAL TAMBAH PUPUK */}
      <AddFertilizerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refreshData}
      />

      {/* RENDER MODAL EDIT PUPUK (FILE BARU) */}
      <EditFertilizerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedFertilizer(null);
        }}
        onSuccess={refreshData}
        fertilizer={selectedFertilizer}
      />

      {/* RENDER MODAL KONFIRMASI HAPUS KUSTOM (FILE BARU) */}
      <DeleteFertilizerModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedFertilizer(null);
        }}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        fertilizerData={selectedFertilizer ? {
          name: selectedFertilizer.name,
          code: selectedFertilizer.fertilizer_code,
          stockInfo: `${Math.ceil(selectedFertilizer.current_stock_kg / (selectedFertilizer.packaging_size_kg || 50))} Karung (${selectedFertilizer.current_stock_kg.toLocaleString("id-ID")} kg)`
        } : null}
      />
    </div>
  );
}