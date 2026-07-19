"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HiBuildingOffice2, HiTruck, HiChartBarSquare } from "react-icons/hi2";

// Data dummy — nanti disambungkan ke API pada tahap berikutnya
const registrasiData = [
  { bulan: "Jan", jumlah: 12 },
  { bulan: "Feb", jumlah: 15 },
  { bulan: "Mar", jumlah: 18 },
  { bulan: "Apr", jumlah: 20 },
  { bulan: "Mei", jumlah: 22 },
  { bulan: "Jun", jumlah: 16 },
  { bulan: "Jul", jumlah: 24 },
  { bulan: "Agu", jumlah: 25 },
  { bulan: "Sep", jumlah: 21 },
  { bulan: "Okt", jumlah: 26 },
  { bulan: "Nov", jumlah: 23 },
  { bulan: "Des", jumlah: 28 },
];

const pengadaanData = [
  { bulan: "Jan", disetujui: 12, validasi: 5, ditolak: 3 },
  { bulan: "Feb", disetujui: 15, validasi: 7, ditolak: 4 },
  { bulan: "Mar", disetujui: 18, validasi: 8, ditolak: 4 },
  { bulan: "Apr", disetujui: 22, validasi: 6, ditolak: 4 },
  { bulan: "Mei", disetujui: 28, validasi: 7, ditolak: 5 },
  { bulan: "Jun", disetujui: 20, validasi: 8, ditolak: 4 },
  { bulan: "Jul", disetujui: 26, validasi: 9, ditolak: 4 },
  { bulan: "Agu", disetujui: 24, validasi: 7, ditolak: 3 },
  { bulan: "Sep", disetujui: 22, validasi: 6, ditolak: 5 },
  { bulan: "Okt", disetujui: 30, validasi: 8, ditolak: 4 },
  { bulan: "Nov", disetujui: 27, validasi: 6, ditolak: 3 },
  { bulan: "Des", disetujui: 32, validasi: 7, ditolak: 4 },
];

export default function KemenkoPanganDashboard() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full font-sans text-slate-800">
      {/* HERO BANNER */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-64">
        <img
          src="/kemenko-hero.jpg"
          alt="Petani"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-emerald-900/80 via-emerald-800/40 to-transparent" />
        <div className="relative z-10 p-8 h-full flex flex-col justify-center max-w-lg">
          <h1 className="text-2xl font-bold text-white mb-2">
            Dashboard Kemenko
          </h1>
          <p className="text-sm text-emerald-50/90 mb-4">
            Pantau registrasi koperasi dan validasi pengadaan pupuk secara
            real-time.
          </p>
          <span className="text-xs text-emerald-100/80">{today}</span>
        </div>
      </div>

      {/* 3 CARD NAVIGASI (pengganti menu sidebar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <NavCard
          icon={<HiBuildingOffice2 />}
          title="Manajemen Koperasi"
          ctaText="Kelola Manajemen"
          href="/dashboard/kemenko-pangan/cooperative-master"
        />
        <NavCard
          icon={<HiTruck />}
          title="Validasi Pengada Pupuk"
          ctaText="Kelola Pupuk"
          href="/dashboard/kemenko-pangan/validasi-pupuk"
        />
        <NavCard
          icon={<HiChartBarSquare />}
          title="Laporan"
          ctaText="Kelola Laporan"
          href="/dashboard/kemenko-pangan/laporan"
        />
      </div>

      {/* 4 KARTU STATISTIK (dummy, akan disambungkan ke API nanti) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Koperasi Aktif"
          sub="Koperasi"
          value={112}
          delta="8 dari bulan lalu"
          icon={<HiBuildingOffice2 />}
        />
        <StatCard
          label="Menunggu Registrasi"
          sub="Registrasi"
          value={12}
          delta="4 dari kemarin"
          icon={<HiBuildingOffice2 />}
        />
        <StatCard
          label="Menunggu Validasi"
          sub="Validasi"
          value={30}
          delta="5 dari kemarin"
          icon={<HiTruck />}
        />
        <StatCard
          label="Pengadaan Disetujui"
          sub="Pengajuan"
          value={180}
          delta="12 dari bulan lalu"
          icon={<HiChartBarSquare />}
          highlighted
        />
      </div>

      {/* 2 GRAFIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Registrasi Koperasi
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Jumlah koperasi yang mendaftar setiap bulan
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={registrasiData}>
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#0F7B4A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Pengadaan Pupuk
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Status pengajuan pengadaan per bulan
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pengadaanData}>
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="disetujui"
                stackId="a"
                fill="#0F7B4A"
                name="Disetujui"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="validasi"
                stackId="a"
                fill="#F5B942"
                name="Menunggu Validasi"
              />
              <Bar
                dataKey="ditolak"
                stackId="a"
                fill="#E0554F"
                name="Ditolak"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// --- Sub-komponen: Card navigasi menu utama ---
function NavCard({
  icon,
  title,
  ctaText,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  ctaText: string;
  href: string;
}) {
  return (
    <div className="bg-emerald-50/60 rounded-2xl p-5 flex items-center gap-4">
      <div className="h-18 w-18 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-5xl shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
        <Link
          href={href}
          className="text-sm font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
        >
          {ctaText} <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

// --- Sub-komponen: Kartu statistik ---
function StatCard({
  label,
  sub,
  value,
  delta,
  icon,
  highlighted = false,
}: {
  label: string;
  sub: string;
  value: number;
  delta: string;
  icon: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 border shadow-sm flex items-start gap-3 ${
        highlighted
          ? "border-emerald-300 ring-1 ring-emerald-200"
          : "border-slate-200/60"
      }`}
    >
      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400">{label}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <h3 className="text-xl font-black text-slate-900">{value}</h3>
          <span className="text-[11px] text-slate-400">{sub}</span>
        </div>
        <p className="text-[10px] text-emerald-600 font-medium mt-1">
          &uarr; {delta}
        </p>
      </div>
    </div>
  );
}
