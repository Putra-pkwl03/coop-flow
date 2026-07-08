// components/dashboard/data-tanaman/PlantDetailSkeleton.tsx
export default function PlantDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full animate-pulse">
      
      {/* ================= SISI KIRI: PANEL DAFTAR PETANI (lg:col-span-4) ================= */}
      <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-3xl p-5 space-y-4 shadow-xs">
        {/* Skeleton Search Bar & Filter */}
        <div className="flex gap-2">
          <div className="h-10 bg-zinc-200 rounded-xl flex-1"></div>
          <div className="h-10 bg-zinc-200 rounded-xl w-24"></div>
        </div>
        
        {/* Skeleton Filter Row Lainnya */}
        <div className="grid grid-cols-3 gap-2">
          <div className="h-8 bg-zinc-100 rounded-lg"></div>
          <div className="h-8 bg-zinc-100 rounded-lg"></div>
          <div className="h-8 bg-zinc-100 rounded-lg"></div>
        </div>

        {/* Skeleton Card List Petani Aktif */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-3 p-4 border border-zinc-200 rounded-2xl bg-white">
              <div className="w-12 h-12 bg-zinc-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-200 rounded w-2/3"></div>
                <div className="h-2.5 bg-zinc-100 rounded w-1/2"></div>
                <div className="h-2.5 bg-zinc-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= SISI KANAN: DETAIL DATA TANAMAN (lg:col-span-8) ================= */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* 1. Header Profil Atas */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-zinc-200 rounded-full shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-zinc-200 rounded w-40"></div>
              <div className="h-3 bg-zinc-100 rounded w-32"></div>
              <div className="h-3 bg-zinc-100 rounded w-48"></div>
            </div>
          </div>
          <div className="sm:text-right space-y-1.5 shrink-0">
            <div className="h-2.5 bg-zinc-200 rounded w-28 sm:ml-auto"></div>
            <div className="h-4 bg-zinc-200 rounded w-36 sm:ml-auto"></div>
          </div>
        </div>

        {/* 2. Empat Kotak Ringkasan Statistik */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-200 rounded-xl shrink-0"></div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2 bg-zinc-200 rounded w-14"></div>
                <div className="h-3.5 bg-zinc-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Tambah Tanaman */}
        <div className="flex justify-end">
          <div className="h-9 bg-zinc-200 rounded-xl w-36"></div>
        </div>

        {/* 3. Container Utama List Tanaman */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
          {[1, 2, 3].map((n) => (
            <div 
              key={n} 
              className="border border-zinc-200 rounded-xl p-4 flex items-center justify-between gap-4 bg-white"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 bg-zinc-200 rounded-xl shrink-0"></div>
                <div className="min-w-0 space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-zinc-200 rounded w-24"></div>
                    <div className="h-3 bg-zinc-100 rounded w-10"></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="h-4 bg-zinc-100 rounded w-12"></div>
                    <div className="h-3 bg-zinc-200 rounded w-16"></div>
                    <div className="h-3 bg-zinc-100 rounded w-24"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="space-y-1 text-right hidden sm:block">
                  <div className="h-2 bg-zinc-100 rounded w-16 ml-auto"></div>
                  <div className="h-3 bg-zinc-200 rounded w-20 ml-auto"></div>
                </div>
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-100">
                  <div className="w-4 h-4 bg-zinc-200 rounded"></div>
                  <div className="w-4 h-4 bg-zinc-100 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}