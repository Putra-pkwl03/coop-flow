import Link from "next/link";
export default function CardDistribusi({ jumlah }: { jumlah: number }) {
  return (
    <Link
      href="/dashboard/admin-koprasi/riwayat-distribusi"
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition cursor-pointer group"
    >
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600">
          Distribusi Selesai
        </p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2">{jumlah}</h3>
      </div>
      <p className="text-xs text-emerald-600 font-medium mt-4">
        ✅ Log Transaksi Sukses &rarr;
      </p>
    </Link>
  );
}
