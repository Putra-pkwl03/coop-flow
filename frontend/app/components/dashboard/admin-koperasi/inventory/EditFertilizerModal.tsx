"use client";

import React, { useState, useEffect } from "react";
import { FaTimes, FaCalculator } from "react-icons/fa";
import api from "../../../../lib/axios";
import Swal from "sweetalert2";

interface FertilizerItem {
  id: number;
  fertilizer_code: string;
  name: string;
  image: string | null;
  current_stock_kg: number;
  packaging_size_kg: number;
  price_per_kg: number;
}

interface EditFertilizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fertilizer: FertilizerItem | null;
}

export default function EditFertilizerModal({ isOpen, onClose, onSuccess, fertilizer }: EditFertilizerModalProps) {
  const [name, setName] = useState("");
  const [jumlahKarung, setJumlahKarung] = useState<number | "">("");
  const [beratPerKarung, setBeratPerKarung] = useState<number | "">(50);
  const [pricePerKarung, setPricePerKarung] = useState<number | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Isi data lama ke form saat modal dibuka
  useEffect(() => {
    if (isOpen && fertilizer) {
      const pSize = fertilizer.packaging_size_kg || 50;
      setName(fertilizer.name);
      setBeratPerKarung(pSize);
      setJumlahKarung(Math.ceil(fertilizer.current_stock_kg / pSize));
      setPricePerKarung(fertilizer.price_per_kg * pSize);
      
      if (fertilizer.image) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        setImagePreview(`${baseUrl}${fertilizer.image}`);
      } else {
        setImagePreview(null);
      }
    }
  }, [isOpen, fertilizer]);

  // Bersihkan memori object URL saat ditutup
  useEffect(() => {
    if (!isOpen) {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImage(null);
    }
  }, [isOpen]);

  const currentStockKg = Number(jumlahKarung || 0) * Number(beratPerKarung || 0);
  const pricePerKg = Number(beratPerKarung) > 0 ? Math.round(Number(pricePerKarung || 0) / Number(beratPerKarung)) : 0;

  if (!isOpen || !fertilizer) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      
      const ukuranKarung = Number(beratPerKarung || 50);
      const autoMinimumStockKg = 5 * ukuranKarung;

      formData.append("name", name);
      formData.append("packaging_size_kg", String(ukuranKarung));
      formData.append("current_stock_kg", String(currentStockKg));
      formData.append("minimum_stock_kg", String(autoMinimumStockKg));
      formData.append("price_per_kg", String(pricePerKg));
      
      // Laravel membutuhkan spoofing method PUT jika mengirim FormData berkas biner via POST
      formData.append("_method", "PUT");
      
      if (image) {
        formData.append("image", image);
      }

      await api.post(`/cooperative/fertilizers/${fertilizer.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Toast.fire({ icon: "success", title: "Data pupuk berhasil diperbarui!" });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      onClose();
      Toast.fire({
        icon: "error",
        title: err.response?.data?.message || "Gagal memperbarui data pupuk.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-zinc-100 flex justify-between items-center relative">
          <div className="w-full text-center">
            <h2 className="text-lg font-bold text-[#00b56c]">Edit Data Pupuk</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Ubah data informasi stok gudang pupuk</p>
          </div>
          <button onClick={onClose} className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-600 cursor-pointer">
            <FaTimes className="text-base" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm text-zinc-700">
          <div>
            <label className="block font-semibold mb-1">Nama Pupuk <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-[#00b56c] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-zinc-400">Kode Pupuk</label>
            <input
              type="text"
              disabled
              value={fertilizer.fertilizer_code}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-400 cursor-not-allowed uppercase font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Jumlah Karung <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={jumlahKarung}
                  onChange={(e) => setJumlahKarung(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full pl-3 pr-16 py-2 border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-[#00b56c] focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-zinc-400 text-xs">karung</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Berat Per Karung <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={beratPerKarung}
                  onChange={(e) => setBeratPerKarung(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full pl-3 pr-10 py-2 border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-[#00b56c] focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-zinc-400 text-xs">Kg</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 bg-[#00b56c] text-white rounded-md"><FaCalculator /></div>
            <div>
              <div className="text-xs text-emerald-700 font-medium">Total Berat Berubah Menjadi</div>
              <div className="text-sm font-bold text-emerald-800">{currentStockKg.toLocaleString("id-ID")} Kg</div>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Harga Per KG <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-zinc-400 font-medium">Rp</span>
              <input
                type="number"
                required
                min="0"
                value={pricePerKarung}
                onChange={(e) => setPricePerKarung(e.target.value !== "" ? Number(e.target.value) : "")}
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-[#00b56c] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Konversi kalkulasi baru: Rp {pricePerKg.toLocaleString("id-ID")} / Kg</p>
          </div>

          <div>
            <label className="block font-semibold mb-1">Gambar Pupuk (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-md border" />
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-100 text-zinc-700 font-bold py-2.5 rounded-lg text-center cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#00b56c] text-white font-bold py-2.5 rounded-lg text-center disabled:opacity-50 cursor-pointer">{loading ? "Menyimpan..." : "Simpan Perubahan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}