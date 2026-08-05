'use client';

import dynamicImport from 'next/dynamic';

const RiwayatStokClient = dynamicImport(
  () => import('./RiwayatStokPage'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-semibold text-zinc-600">Memuat Riwayat Stok...</p>
        </div>
      </div>
    )
  }
);

export default function ClientWrapper() {
  return <RiwayatStokClient />;
}