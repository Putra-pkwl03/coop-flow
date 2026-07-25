import React from "react";
import Link from "next/link";
import {
  HiBuildingOffice2,
  HiTruck,
  HiDocumentChartBar,
} from "react-icons/hi2";

interface NavCardProps {
  icon: React.ReactNode;
  title: string;
  ctaText: string;
  href: string;
  bgColor?: string;
  iconColor?: string;
  iconHoverBg?: string;
  titleHoverColor?: string;
  ctaColor?: string;
}

function NavCard({
  icon,
  title,
  ctaText,
  href,
  bgColor = "bg-emerald-100/70",
  iconColor = "text-emerald-700",
  iconHoverBg = "group-hover:bg-emerald-600",
  titleHoverColor = "group-hover:text-emerald-700",
  ctaColor = "text-emerald-600",
}: NavCardProps) {
  return (
    <Link
      href={href}
      className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div
        className={`h-16 w-16 rounded-2xl ${bgColor} ${iconColor} flex items-center justify-center text-3xl shrink-0 group-hover:text-white transition-colors duration-200 ${iconHoverBg}`}
      >
        {icon}
      </div>
      <div>
        <h3
          className={`text-lg font-bold text-slate-800 mb-1 transition-colors ${titleHoverColor}`}
        >
          {title}
        </h3>
        <span className={`text-sm font-bold ${ctaColor} group-hover:underline`}>
          {ctaText}
        </span>
      </div>
    </Link>
  );
}

export default function NavCardsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <NavCard
        icon={<HiBuildingOffice2 />}
        title="Manajemen Koperasi"
        ctaText="Kelola Manajemen"
        href="/dashboard/kemenko-pangan/manajemen-koperasi"
        bgColor="bg-emerald-100/70"
        iconColor="text-emerald-700"
        iconHoverBg="group-hover:bg-emerald-600"
        titleHoverColor="group-hover:text-emerald-700"
        ctaColor="text-emerald-600"
      />
      <NavCard
        icon={<HiTruck />}
        title="Validasi Pengadaan Pupuk"
        ctaText="Kelola Pupuk"
        href="/dashboard/kemenko-pangan/validasi-pengadaan"
        bgColor="bg-blue-100/70"
        iconColor="text-blue-700"
        iconHoverBg="group-hover:bg-blue-600"
        titleHoverColor="group-hover:text-blue-700"
        ctaColor="text-blue-600"
      />
      <NavCard
        icon={<HiDocumentChartBar />}
        title="Laporan"
        ctaText="Kelola Laporan"
        href="/dashboard/kemenko-pangan/laporan"
        bgColor="bg-purple-100/70"
        iconColor="text-purple-700"
        iconHoverBg="group-hover:bg-purple-600"
        titleHoverColor="group-hover:text-purple-700"
        ctaColor="text-purple-600"
      />
    </div>
  );
}
