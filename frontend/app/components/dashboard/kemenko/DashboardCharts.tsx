"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface ChartsProps {
  donutPengadaan: {
    disetujui: number;
    menunggu_validasi: number;
    ditolak: number;
    total: number;
  };
  barRegistrasi: Array<{ bulan: string; jumlah: number }>;
  lineTrenPengadaan: Array<{
    bulan: string;
    disetujui: number;
    menunggu_validasi: number;
    ditolak: number;
  }>;
}

export default function DashboardCharts({
  donutPengadaan,
  barRegistrasi,
  lineTrenPengadaan,
}: ChartsProps) {
  // Format data untuk Donut Chart (Pie)
  const donutData = [
    { name: "Disetujui", value: donutPengadaan.disetujui, color: "#10B981" },
    {
      name: "Menunggu Validasi",
      value: donutPengadaan.menunggu_validasi,
      color: "#F59E0B",
    },
    { name: "Ditolak", value: donutPengadaan.ditolak, color: "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart (Presentase Status Pengadaan Nasional) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-bold text-zinc-700 mb-4">
            Presentase Status Pengadaan
          </h3>
          <div className="h-56 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #f4f4f5",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "600" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Teks di tengah Donut */}
            <div className="absolute text-center pointer-events-none">
              <p className="text-2xl font-black text-zinc-800">
                {donutPengadaan.total}
              </p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Pengajuan
              </p>
            </div>
          </div>
        </div>

        {/* Bar Chart (Registrasi Koperasi per Bulan) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-zinc-700 mb-4">
            Registrasi Koperasi per Bulan
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barRegistrasi}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f4f4f5"
                />
                <XAxis
                  dataKey="bulan"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #f4f4f5",
                  }}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar
                  dataKey="jumlah"
                  name="Koperasi Terdaftar"
                  fill="#0F7B4A"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Line Chart (Tren Pengadaan Pupuk Nasional) */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-700 mb-4">
          Tren Pengadaan Pupuk (6 Bulan Terakhir)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineTrenPengadaan}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #f4f4f5",
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", fontWeight: "600" }}
              />
              <Line
                type="monotone"
                dataKey="disetujui"
                name="Disetujui"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="menunggu_validasi"
                name="Menunggu Validasi"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="ditolak"
                name="Ditolak"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
