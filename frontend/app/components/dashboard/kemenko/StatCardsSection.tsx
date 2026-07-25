import React from "react";
import {
  HiBuildingOffice,
  HiUserPlus,
  HiClipboardDocumentCheck,
  HiCheckBadge,
} from "react-icons/hi2";

interface StatCardProps {
  label: string;
  sub: string;
  value: number;
  delta: string;
  icon: React.ReactNode;
  bgColor?: string;
  iconColor?: string;
  loading?: boolean;
}

function StatCard({
  label,
  sub,
  value,
  delta,
  icon,
  bgColor = "bg-emerald-50",
  iconColor = "text-emerald-600",
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex items-start gap-4 transition-all duration-150 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200">
      <div
        className={`h-12 w-12 rounded-xl ${bgColor} ${iconColor} flex items-center justify-center text-2xl shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          {loading ? (
            <div className="h-8 w-16 bg-slate-200 animate-pulse rounded my-1"></div>
          ) : (
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
          )}
          <span className="text-xs font-medium text-slate-400">{sub}</span>
        </div>
        <p className="text-xs text-emerald-600 font-medium mt-1.5">
          &uarr; {delta}
        </p>
      </div>
    </div>
  );
}
interface StatCardsSectionProps {
  stats: {
    koperasiAktif: number;
    menungguRegistrasi: number;
    menungguValidasi: number;
    pengadaanDisetujui: number;
  };
  loading: boolean;
}

export default function StatCardsSection({
  stats,
  loading,
}: StatCardsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Koperasi Aktif"
        sub="Koperasi"
        value={stats.koperasiAktif}
        delta="Real-time data"
        icon={<HiBuildingOffice />}
        bgColor="bg-sky-50"
        iconColor="text-sky-600"
        loading={loading}
      />
      <StatCard
        label="Menunggu Registrasi"
        sub="Registrasi"
        value={stats.menungguRegistrasi}
        delta="Real-time data"
        icon={<HiUserPlus />}
        bgColor="bg-amber-50"
        iconColor="text-amber-600"
        loading={loading}
      />
      <StatCard
        label="Menunggu Validasi"
        sub="Validasi PO"
        value={stats.menungguValidasi}
        delta="Real-time data"
        icon={<HiClipboardDocumentCheck />}
        bgColor="bg-orange-50"
        iconColor="text-orange-600"
        loading={loading}
      />
      <StatCard
        label="Pengadaan Disetujui"
        sub="Pengajuan PO"
        value={stats.pengadaanDisetujui}
        delta="Real-time data"
        icon={<HiCheckBadge />}
        bgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        loading={loading}
      />
    </div>
  );
}
