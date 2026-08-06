'use client';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50">
      <div className="p-4 mb-4 text-4xl bg-amber-100 rounded-full text-amber-600">
        📶
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Koneksi Terputus</h1>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        Anda sedang dalam mode offline. Silakan periksa koneksi internet Anda untuk mengakses halaman baru ini.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
      >
        Coba Muat Ulang
      </button>
    </div>
  );
}