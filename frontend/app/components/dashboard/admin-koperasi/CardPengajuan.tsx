import Link from "next/link";
export default function CardPengajuan({ jumlah }: { jumlah: number }) {
  return (
    <Link
      href="/dashboard/admin-koprasi/verifikasi-pengajuan"
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-amber-500 hover:shadow-md transition cursor-pointer group"
    >
      <div>
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
          Total Pengajuan
        </p>
        <h3 className="text-3xl font-bold text-amber-700 mt-2">{jumlah}</h3>
      </div>
      <p className="text-xs text-amber-600 font-medium mt-4">
        ⏳ Butuh Verifikasi &rarr;
      </p>
    </Link>
  );
}
