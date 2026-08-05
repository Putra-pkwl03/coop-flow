"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";
import api from "@/app/lib/axios";
import DinasProfileForm, {
  DinasUserData,
} from "@/app/components/dashboard/dinas/DinasProfileForm";

// ✅ AMAN SAAT BUILD: Menggunakan fungsi helper agar tidak diinstansiasi di server Node.js
const getToast = () => {
  return Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
};

export default function DinasProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<DinasUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Fetch Data User Dinas Pertanian yang sedang Login
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/user");
      if (response.data?.id) {
        setUser(response.data);
      }
    } catch (error: any) {
      getToast().fire({
        icon: "error",
        title: error?.response?.data?.message || "Gagal mengambil data profil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // 2. Submit Update Profil (Menggunakan tipe Partial<DinasUserData>)
  const handleUpdateProfile = async (formData: Partial<DinasUserData>) => {
    try {
      setIsSubmitting(true);
      const response = await api.put("/user/profile/complete", formData);

      if (response.data.success) {
        getToast().fire({
          icon: "success",
          title: "Profil berhasil diperbarui!",
        });

        // Refresh data profil
        setUser(response.data.data);
      }
    } catch (error: any) {
      getToast().fire({
        icon: "error",
        title: error?.response?.data?.message || "Gagal memperbarui profil.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-start space-x-3">
        {/* Tombol Kembali (di kiri judul) */}
        <button
          onClick={() => router.back()}
          className="mt-1 flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition shrink-0"
          title="Kembali"
        >
          <FaArrowLeft className="text-sm" />
        </button>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Pengaturan Profil Dinas Pertanian
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Perbarui data diri dan kontak petugas. Wilayah kerja ditetapkan oleh
            admin dan tidak dapat diubah mandiri.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">
            Memuat data profil...
          </p>
        </div>
      ) : user ? (
        <DinasProfileForm
          initialData={user}
          onSubmit={handleUpdateProfile}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          Data profil tidak ditemukan. Pastikan akun Anda memiliki akses yang
          benar.
        </div>
      )}
    </div>
  );
}