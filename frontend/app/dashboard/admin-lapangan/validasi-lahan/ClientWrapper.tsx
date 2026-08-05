'use client';

import dynamicImport from 'next/dynamic';

// 🌟 Di dalam Client Component, opsi ssr: false diizinkan penuh
const ValidasiLahanClient = dynamicImport(
  () => import('./ValidasiLahanPage'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-semibold text-zinc-600">Memuat Modul Geospasial & Offline...</p>
        </div>
      </div>
    )
  }
);

export default function ClientWrapper() {
  return <ValidasiLahanClient />;
}