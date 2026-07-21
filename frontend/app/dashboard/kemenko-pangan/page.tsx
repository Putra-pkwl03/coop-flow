"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HiBuildingOffice2, HiTruck, HiChartBarSquare } from "react-icons/hi2";

import api from "@/app/lib/axios";
import DashboardCharts from "@/app/components/dashboard/kemenko/DashboardCharts";

// Nama bulan singkat, dipakai untuk label sumbu X di kedua chart
const NAMA_BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// Bangun array 6 bulan terakhir (termasuk bulan berjalan), urut dari yang paling lama
function buildLastNMonths(n: number) {
  const now = new Date();
  const months: { key: string; label: string; year: number; month: number }[] =
    [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: NAMA_BULAN[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

export default function KemenkoPanganDashboard() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [stats, setStats] = useState({
    koperasiAktif: 0,
    menungguRegistrasi: 0,
    menungguValidasi: 0,
    pengadaanDisetujui: 0,
  });

  const [donutPengadaan, setDonutPengadaan] = useState({
    disetujui: 0,
    menunggu_validasi: 0,
    ditolak: 0,
    total: 0,
  });
  const [barRegistrasi, setBarRegistrasi] = useState<
    Array<{ bulan: string; jumlah: number }>
  >([]);
  const [lineTrenPengadaan, setLineTrenPengadaan] = useState<
    Array<{
      bulan: string;
      disetujui: number;
      menunggu_validasi: number;
      ditolak: number;
    }>
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        const [resActive, resPending, resProcurement] = await Promise.all([
          api.get("/kemenko/registrations/active"),
          api.get("/kemenko/registrations/pending"),
          api.get("/cooperative/procurement"),
        ]);

        const activeData = resActive.data;
        const pendingData = resPending.data;
        const procurementData = resProcurement.data;

        const activeList = Array.isArray(activeData)
          ? activeData
          : activeData?.data || [];
        const pendingList = Array.isArray(pendingData)
          ? pendingData
          : pendingData?.data || [];
        const procurementList: any[] = Array.isArray(procurementData)
          ? procurementData
          : procurementData?.data || [];

        // ----- Kartu statistik (sama seperti sebelumnya) -----
        const countWaitingValidation = procurementList.filter(
          (item) =>
            item.status_verifikasi === "PENDING_DINAS" ||
            item.status_verifikasi === "PENDING_KEMENKO",
        ).length;

        const countApproved = procurementList.filter(
          (item) => item.status_verifikasi === "APPROVED",
        ).length;

        setStats({
          koperasiAktif: activeList.length,
          menungguRegistrasi: pendingList.length,
          menungguValidasi: countWaitingValidation,
          pengadaanDisetujui: countApproved,
        });

        // ----- Donut: persentase status pengadaan nasional -----
        const countRejected = procurementList.filter(
          (item) =>
            item.status_verifikasi === "REJECTED_DINAS" ||
            item.status_verifikasi === "REJECTED_KEMENKO",
        ).length;

        setDonutPengadaan({
          disetujui: countApproved,
          menunggu_validasi: countWaitingValidation,
          ditolak: countRejected,
          total: countApproved + countWaitingValidation + countRejected,
        });

        // ----- Bar: registrasi koperasi per bulan (6 bulan terakhir) -----
        // Asumsi: setiap koperasi di activeList punya field created_at (tanggal aktif/registrasi)
        const months6 = buildLastNMonths(6);
        const barData = months6.map(({ key, label, year, month }) => {
          const jumlah = activeList.filter((item: any) => {
            if (!item.created_at) return false;
            const d = new Date(item.created_at);
            return d.getFullYear() === year && d.getMonth() === month;
          }).length;
          return { bulan: label, jumlah };
        });
        setBarRegistrasi(barData);

        // ----- Line: tren status pengadaan per bulan (6 bulan terakhir) -----
        // Asumsi: setiap item procurementList punya field created_at (tanggal pengajuan)
        const lineData = months6.map(({ label, year, month }) => {
          const itemsBulanIni = procurementList.filter((item) => {
            if (!item.created_at) return false;
            const d = new Date(item.created_at);
            return d.getFullYear() === year && d.getMonth() === month;
          });
          return {
            bulan: label,
            disetujui: itemsBulanIni.filter(
              (i) => i.status_verifikasi === "APPROVED",
            ).length,
            menunggu_validasi: itemsBulanIni.filter(
              (i) =>
                i.status_verifikasi === "PENDING_DINAS" ||
                i.status_verifikasi === "PENDING_KEMENKO",
            ).length,
            ditolak: itemsBulanIni.filter(
              (i) =>
                i.status_verifikasi === "REJECTED_DINAS" ||
                i.status_verifikasi === "REJECTED_KEMENKO",
            ).length,
          };
        });
        setLineTrenPengadaan(lineData);
      } catch (error) {
        console.error("Gagal mengambil data statistik dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="w-full font-sans text-slate-800">
      {/* HERO BANNER */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-64">
        <img
          src="/kemenko-hero.png"
          alt="Petani"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-green-900 from-10% via-green-900/60 via-30% to-transparent to-60%"></div>
        <div className="relative z-10 p-8 h-full flex flex-col justify-center max-w-lg">
          <h1 className="text-4xl font-bold text-white mb-2">
            Dashboard Kemenko
          </h1>
          <p className="text-base text-white">
            Pantau registrasi koperasi dan validasi pengadaan pupuk secara
            real-time.
          </p>
          <span className="text-sm text-emerald-100/80">{today}</span>
        </div>
      </div>

      {/* 3 CARD NAVIGASI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <NavCard
          icon={<HiBuildingOffice2 />}
          title="Manajemen Koperasi"
          ctaText="Kelola Manajemen"
          href="/dashboard/kemenko-pangan/manajemen-koperasi"
        />
        <NavCard
          icon={<HiTruck />}
          title="Validasi Pengadaan Pupuk"
          ctaText="Kelola Pupuk"
          href="/dashboard/kemenko-pangan/validasi-pengadaan"
        />
        <NavCard
          icon={<HiChartBarSquare />}
          title="Laporan"
          ctaText="Kelola Laporan"
          href="/dashboard/kemenko-pangan/laporan"
        />
      </div>

      {/* 4 KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 ">
        <StatCard
          label="Koperasi Aktif"
          sub="Koperasi"
          value={stats.koperasiAktif}
          delta="Real-time data"
          icon={<HiBuildingOffice2 />}
          loading={loading}
        />
        <StatCard
          label="Menunggu Registrasi"
          sub="Registrasi"
          value={stats.menungguRegistrasi}
          delta="Real-time data"
          icon={<HiBuildingOffice2 />}
          loading={loading}
        />
        <StatCard
          label="Menunggu Validasi"
          sub="Validasi PO"
          value={stats.menungguValidasi}
          delta="Real-time data"
          icon={<HiTruck />}
          loading={loading}
        />
        <StatCard
          label="Pengadaan Disetujui"
          sub="Pengajuan PO"
          value={stats.pengadaanDisetujui}
          delta="Real-time data"
          icon={<HiChartBarSquare />}
          highlighted
          loading={loading}
        />
      </div>

      {/* GRAFIK */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-100 animate-pulse rounded-2xl lg:col-span-1" />
          <div className="h-72 bg-slate-100 animate-pulse rounded-2xl lg:col-span-2" />
        </div>
      ) : (
        <DashboardCharts
          donutPengadaan={donutPengadaan}
          barRegistrasi={barRegistrasi}
          lineTrenPengadaan={lineTrenPengadaan}
        />
      )}
    </div>
  );
}

// Sub-komponen NavCard
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

// Sub-komponen StatCard
function StatCard({
  label,
  sub,
  value,
  delta,
  icon,
  highlighted = false,
  loading = false,
}: {
  label: string;
  sub: string;
  value: number;
  delta: string;
  icon: React.ReactNode;
  highlighted?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 border shadow-sm flex items-start gap-4 ${
        highlighted
          ? "border-emerald-300 ring-1 ring-emerald-200"
          : "border-slate-200/60"
      }`}
    >
      <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-base font-semibold text-slate-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          {loading ? (
            <div className="h-8 w-16 bg-slate-200 animate-pulse rounded my-1"></div>
          ) : (
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
          )}
          <span className="text-sm font-medium text-slate-400">{sub}</span>
        </div>
        <p className="text-xs text-emerald-600 font-medium mt-1.5">
          &uarr; {delta}
        </p>
      </div>
    </div>
  );
}
