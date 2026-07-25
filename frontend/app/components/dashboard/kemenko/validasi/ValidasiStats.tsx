"use client";

import React from "react";
import { HiArrowTrendingUp } from "react-icons/hi2";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
} from "react-icons/hi";

interface StatsData {
  total: number;
  disetujui: number;
  menunggu: number;
  ditolak: number;
}

export default function ValidasiStats({
  stats,
  loading,
}: {
  stats: StatsData;
  loading?: boolean;
}) {
  const cards = [
    {
      title: "Total Pengajuan",
      value: stats.total,
      unit: "Pengajuan",
      icon: HiOutlineDocumentText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Disetujui Kemenko",
      value: stats.disetujui,
      unit: "Pengajuan",
      icon: HiOutlineCheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Menunggu Kuota",
      value: stats.menunggu,
      unit: "Pengajuan",
      icon: HiOutlineClock,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      title: "Ditolak Kemenko",
      value: stats.ditolak,
      unit: "Pengajuan",
      icon: HiOutlineXCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                {card.title}
              </p>
              {loading ? (
                <div className="h-8 w-20 bg-zinc-200 rounded animate-pulse mt-2" />
              ) : (
                <p className="text-3xl font-black text-zinc-900 mt-2">
                  {card.value}{" "}
                  <span className="text-xs font-normal text-zinc-500">
                    {card.unit}
                  </span>
                </p>
              )}
            </div>
            <div
              className={`p-3 rounded-2xl ${card.bg} ${card.color} ${loading ? "animate-pulse" : ""}`}
            >
              {loading ? (
                <div className="w-6 h-6 bg-current opacity-30 rounded" />
              ) : (
                <card.icon className="text-2xl" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}