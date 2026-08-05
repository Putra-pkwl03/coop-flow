// app/dashboard/admin-lapangan/data-tanaman/page.tsx
import { Suspense } from 'react';
import DataTanamanClient from './DataTanamanClient';
import PlantDetailSkeleton from '../../../components/dashboard/data-tanaman/PlantDetailSkeleton';

export default function DataTanamanPetaniPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] p-6">
          <PlantDetailSkeleton />
        </div>
      }
    >
      <DataTanamanClient />
    </Suspense>
  );
}