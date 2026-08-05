"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "@/app/lib/axios"; 
import CooperativeProfileForm, { CooperativeData } from "@/app/components/dashboard/admin-koperasi/profil/CooperativeProfileForm";

// ✅ AMAN SAAT BUILD: Menggunakan fungsi helper agar tidak dieksekusi saat prerender di Node.js
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

export default function ProfilePage() {
  const [cooperative, setCooperative] = useState<CooperativeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Fetch Data Koperasi yang sedang Login
  const fetchCooperativeData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/cooperative/cooperative1/me");
      if (response.data.success) {
        setCooperative(response.data.data);
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
    fetchCooperativeData();
  }, []);

  // 2. Submit Update Profil Koperasi (Menggunakan tipe Partial<CooperativeData>)
  const handleUpdateProfile = async (formData: Partial<CooperativeData>) => {
    try {
      setIsSubmitting(true);
      const response = await api.put("/cooperative/profile/complete", formData);

      if (response.data.success) {
        getToast().fire({
          icon: "success",
          title: "Profil berhasil diperbarui!",
        });

        // Refresh data profil
        setCooperative(response.data.data);
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
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pengaturan Profil Koperasi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Lengkapi dan perbarui lokasi geospasial, legalitas, serta informasi logistik gudang koperasi Anda.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Memuat data koperasi...</p>
        </div>
      ) : cooperative ? (
        <CooperativeProfileForm
          initialData={cooperative}
          onSubmit={handleUpdateProfile}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          Data profil koperasi tidak ditemukan. Pastikan akun Anda terhubung ke Koperasi.
        </div>
      )}
    </div>
  );
}