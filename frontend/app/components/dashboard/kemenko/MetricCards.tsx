// src/app/components/dashboard/kemenko/MetricCards.tsx
"use client";

import React from "react";
import {
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaCalendarPlus,
} from "react-icons/fa";

interface MetricCardsProps {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  loading?: boolean;
}

export default function MetricCards({
  total,
  active,
  inactive,
  newThisMonth,
  loading,
}: MetricCardsProps) {
  const cards = [
    {
      icon: <FaUsers size={22} />,
      iconBg: "bg-zinc-100 text-zinc-600",
      label: "Total Koperasi",
      value: total,
      trend: "↑ 8.5%",
      trendColor: "text-emerald-600",
    },
    {
      icon: <FaCheckCircle size={22} />,
      iconBg: "bg-emerald-50 text-emerald-600",
      label: "Koperasi Aktif",
      value: active,
      trend: "↑ 6.2%",
      trendColor: "text-emerald-600",
    },
    {
      icon: <FaClock size={22} />,
      iconBg: "bg-amber-50 text-amber-600",
      label: "Koperasi Pending",
      value: inactive,
      trend: "↓ 2.1%",
      trendColor: "text-amber-600",
    },
    {
      icon: <FaCalendarPlus size={22} />,
      iconBg: "bg-blue-50 text-blue-600",
      label: "Terdaftar Bulan Ini",
      value: newThisMonth,
      trend: "↑ 14.3%",
      trendColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200"
        >
          <div
            className={`p-3.5 rounded-xl ${card.iconBg} ${loading ? "animate-pulse" : ""}`}
          >
            {loading ? (
              <div className="w-5.5 h-5.5 bg-current opacity-20 rounded" />
            ) : (
              card.icon
            )}
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
              {card.label}
            </p>
            {loading ? (
              <div className="h-6 w-16 bg-zinc-200 rounded animate-pulse my-1" />
            ) : (
              <h3 className="text-2xl font-black text-zinc-800">
                {card.value.toLocaleString("id-ID")}
              </h3>
            )}
            {loading ? (
              <div className="h-3 w-24 bg-zinc-200 rounded animate-pulse mt-1" />
            ) : (
              <p
                className={`text-[11px] ${card.trendColor} font-semibold mt-0.5`}
              >
                {card.trend}{" "}
                <span className="text-zinc-400 font-normal">
                  dari bulan lalu
                </span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

