import Link from "next/link";
export default function CardLahan({ luas }: { luas: number }) {
  return (
    <Link
      href="/dashboard/admin-koprasi/peta-lahan"
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition cursor-pointer group"
    >
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600">
          Luas Lahan
        </p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2">
          {luas} <span className="text-sm font-normal text-slate-500">Ha</span>
        </h3>
      </div>
      <p className="text-xs text-emerald-600 font-medium mt-4">
        🌾 Pemetaan Poligon GIS &rarr;
      </p>
    </Link>
  );
}
