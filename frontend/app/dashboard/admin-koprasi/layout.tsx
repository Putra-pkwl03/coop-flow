"use client";

import React from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import { useAuthAction } from "@/app/hooks/useAuthAction";

export default function AdminKoperasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuthAction();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-zinc-800 antialiased font-sans">
      {/* Sidebar Dikunci di Sini */}
      <Sidebar handleLogout={logout} />

      <div className="flex-1 flex flex-col pb-12">
        {/* Navbar Dikunci di Sini */}
        <Navbar
          adminName="Pengurus Koperasi"
          roleName="Admin Koperasi"
          handleLogout={logout}
        />

        {/* Konten Tengah yang berganti secara dinamis tanpa hard-reload */}
        <div className="w-full px-6 md:px-10 mt-8">
          <div className="w-full max-w-[1600px] mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
