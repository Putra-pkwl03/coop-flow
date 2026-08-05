// app/dashboard/admin-lapangan/data-tanaman/layout.tsx
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function DataTanamanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}