import ClientWrapper from './ClientWrapper';

// 🌟 Memaksa Next.js agar TIDAK melakukan prerender saat npm run build
export const dynamic = 'force-dynamic';

export default function Page() {
  return <ClientWrapper />;
}