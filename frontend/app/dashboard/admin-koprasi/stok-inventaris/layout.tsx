"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function StokInventarisLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Deteksi halaman aktif untuk styling tab
  const isRiwayatActive = pathname.endsWith("/riwayat");
  const isMutasiActive = pathname.endsWith("/mutasi");

  // Jika sedang membuka halaman formulir mutasi, kita tidak perlu menampilkan tab atas
  if (isMutasiActive) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER UTAMA & TOMBOL MUTASI (Selalu Menetap) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Stok & Inventaris</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">Koperasi Merah Putih</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin-koprasi/stok-inventaris/mutasi")}
          className="bg-[#059669] hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          + Kelola Mutasi Stok
        </button>
      </div>

      {/* TAB NAVIGASI UTAMA (Selalu Menetap) */}
      <div className="flex border-b border-zinc-200 gap-6 text-sm font-medium">
        <button
          onClick={() => router.push("/dashboard/admin-koprasi/stok-inventaris")}
          className={`pb-4 px-2 border-b-2 transition-all font-semibold ${
            !isRiwayatActive
              ? "border-[#059669] text-[#059669] font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Stok Saat Ini
        </button>
        <button
          onClick={() => router.push("/dashboard/admin-koprasi/stok-inventaris/riwayat")}
          className={`pb-4 px-2 border-b-2 transition-all font-semibold ${
            isRiwayatActive
              ? "border-[#059669] text-[#059669] font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Riwayat Stok
        </button>
      </div>

      {/* Konten dinamis (bisa berisi isi page.tsx stok atau page.tsx riwayat) */}
      <div>{children}</div>
    </div>
  );
}