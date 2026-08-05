'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-extrabold text-emerald-600 mb-2">404</h1>
      <h2 className="text-xl font-bold text-zinc-800 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-zinc-500 max-w-md mb-6">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link 
        href="/dashboard"
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}