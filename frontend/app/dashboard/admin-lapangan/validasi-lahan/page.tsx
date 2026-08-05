import ClientWrapper from './ClientWrapper';

// 🌟 Memaksa Next.js menganggap halaman ini Dynamic (tidak di-prerender saat npm run build)
export const dynamic = 'force-dynamic';

// Re-export type jika ada komponen lain yang meng-import dari '.../page'
export type { Farmer, Land } from './ValidasiLahanPage';

export default function Page() {
  return <ClientWrapper />;
}