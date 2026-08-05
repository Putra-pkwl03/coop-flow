'use client';

import nextDynamic from 'next/dynamic';

const DataPetaniClient = nextDynamic(
  () => import('../../../../dashboard/admin-lapangan/data-petani/DataPetaniClient'),
  { 
    ssr: false,
    loading: () => <div className="min-h-screen bg-[#f8fafc]" />
  }
);

export default function DataPetaniWrapper() {
  return <DataPetaniClient />;
}