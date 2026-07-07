"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/axios";
import { FaArrowLeft, FaSave, FaPlusCircle } from "react-icons/fa";
import Swal from "sweetalert2";

interface FertilizerOption {
  id: number;
  name: string;
}

interface WarehouseOption {
  id: number;
  name: string;
}

export default function MasukStokSupplierPage() {
  const router = useRouter();

  // State Form Kontrol
  const [fertilizerId, setFertilizerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [keterangan, setKeterangan] = useState("");

  // State untuk menampung pilihan dropdown dinamis dari database
  const [fertilizers, setFertilizers] = useState<FertilizerOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Konfigurasi Global untuk Swal Toast Kanan Atas
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  // Ambil daftar pupuk dan gudang dari backend saat halaman dimuat
  useEffect(() => {
    api
      .get("/cooperative/inventory/overview")
      .then((response) => {
        if (response.data.status === "success") {
          const uniqueFertilizers = response.data.stocks.map((s: any) => ({
            id: s.id,
            name: s.name,
          }));
          setFertilizers(uniqueFertilizers);
          setWarehouses(response.data.warehouses);
        }
      })
      .catch((error) => {
        console.error("Gagal memuat opsi dropdown form:", error);
        Toast.fire({
          icon: "error",
          title: "Gagal memuat data pendukung dari server",
        });
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post("/cooperative/inventory/mutation", {
        fertilizer_id: parseInt(fertilizerId),
        warehouse_id: parseInt(warehouseId),
        type: "masuk",
        quantity_kg: parseFloat(jumlah),
        description: keterangan,
      });

      if (response.data.status === "success") {
        Toast.fire({
          icon: "success",
          title: "Stok pasokan baru dari supplier berhasil dicatat!",
        });

        router.push("/dashboard/admin-koprasi/stok-inventaris");
      }
    } catch (error: any) {
      console.error("Gagal menyimpan mutasi masuk:", error);

      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors)
          .flat()
          .join("<br>• ");

        Toast.fire({
          icon: "error",
          title: "Gagal Validasi Backend:",
          html: `• ${validationErrors}`,
          timer: 6000,
        });
      } else {
        // 🔥 Toast Error Umum / Server Crash
        Toast.fire({
          icon: "error",
          title:
            error.response?.data?.message ||
            "Terjadi kesalahan sistem saat menyimpan data.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* HEADER UTAMA & TOMBOL KEMBALI */}
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        <button
          onClick={() =>
            router.push("/dashboard/admin-koprasi/stok-inventaris")
          }
          className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all text-zinc-500 hover:text-zinc-800"
          title="Kembali ke Stok"
        >
          <FaArrowLeft className="text-sm" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            Penerimaan Stok (Supplier)
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Pencatatan pasokan pupuk baru yang masuk ke dalam gudang koperasi
          </p>
        </div>
      </div>

      {/* FORMULIR INPUT */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. TAMPILAN STATUS LOCK INDIKATOR */}
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-3 text-sm font-bold">
            <FaPlusCircle className="text-emerald-600 text-lg" />
            <span>Mode Pencatatan: Pasokan Masuk Terkunci (Penyuplai)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. PILIHAN JENIS PUPUK (DINAMIS DATABASE) */}
            <div>
              <label
                htmlFor="jenisPupuk"
                className="block text-sm font-bold text-zinc-700 mb-2"
              >
                Jenis Pupuk
              </label>
              <select
                id="jenisPupuk"
                required
                value={fertilizerId}
                onChange={(e) => setFertilizerId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-700 font-medium"
              >
                <option value="" disabled>
                  -- Pilih Jenis Pupuk --
                </option>
                {fertilizers.map((pupuk) => (
                  <option key={pupuk.id} value={pupuk.id}>
                    {pupuk.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. PILIHAN GUDANG TUJUAN (DINAMIS DATABASE) */}
            <div>
              <label
                htmlFor="gudangTarget"
                className="block text-sm font-bold text-zinc-700 mb-2"
              >
                Gudang Penerima
              </label>
              <select
                id="gudangTarget"
                required
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-700 font-medium"
              >
                <option value="" disabled>
                  -- Pilih Gudang Target --
                </option>
                {warehouses.map((gudang) => (
                  <option key={gudang.id} value={gudang.id}>
                    {gudang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. JUMLAH / KUANTITAS */}
          <div>
            <label
              htmlFor="jumlah"
              className="block text-sm font-bold text-zinc-700 mb-2"
            >
              Jumlah Kuantitas Pasokan (Kilogram)
            </label>
            <div className="relative">
              <input
                id="jumlah"
                type="number"
                required
                min="1"
                placeholder="Contoh: 5000"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="w-full pl-4 pr-14 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-zinc-800"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-400">
                KG
              </span>
            </div>
          </div>

          {/* 5. KETERANGAN / REFERENSI SURAT */}
          <div>
            <label
              htmlFor="keterangan"
              className="block text-sm font-bold text-zinc-700 mb-2"
            >
              Keterangan / Nomor Dokumen Pendukung (Nomor Surat Jalan)
            </label>
            <textarea
              id="keterangan"
              required
              rows={4}
              placeholder="Contoh: Penerimaan pasokan dari PT Pupuk Indonesia nomor surat jalan #SJ-90012."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-700"
            ></textarea>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                router.push("/dashboard/admin-koprasi/stok-inventaris")
              }
              className="px-5 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <FaSave className="text-xs" />
              <span>{submitting ? "Menyimpan..." : "Simpan Pasokan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
