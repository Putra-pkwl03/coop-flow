"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function InventoryTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const isRiwayatActive = pathname.endsWith("/riwayat");

  return (
    <div className="flex border-b border-zinc-200 gap-6 text-sm font-medium">
      <button
        onClick={() => router.push("/dashboard/admin-koprasi/stok-inventaris")}
        className={`pb-3 px-1 border-b-2 transition-all font-semibold cursor-pointer ${
          !isRiwayatActive
            ? "border-emerald-600 text-emerald-600 font-bold"
            : "border-transparent text-zinc-400 hover:text-zinc-600"
        }`}
      >
        Stok Saat Ini
      </button>
      <button
        onClick={() =>
          router.push("/dashboard/admin-koprasi/stok-inventaris/riwayat")
        }
        className={`pb-3 px-1 border-b-2 transition-all font-semibold cursor-pointer ${
          isRiwayatActive
            ? "border-emerald-600 text-emerald-600 font-bold"
            : "border-transparent text-zinc-400 hover:text-zinc-600"
        }`}
      >
        Riwayat Stok
      </button>
    </div>
  );
}
