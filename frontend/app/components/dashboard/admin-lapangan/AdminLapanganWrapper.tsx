'use client';

import nextDynamic from 'next/dynamic';

// Karena file ini bertindak sebagai Client Component ('use client'), 
// Next.js MEMPERBOLEHKAN penggunaan ssr: false di sini!
const AdminLapanganClientPage = nextDynamic(
  () => import('../../../dashboard/admin-lapangan/AdminLapanganClientPage'),
  { 
    ssr: false,
    loading: () => <div className="w-full min-h-screen bg-slate-50" />
  }
);

export default function AdminLapanganWrapper() {
  return <AdminLapanganClientPage />;
}