"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import Swal from "sweetalert2";
import { FiBarChart2, FiUsers, FiTrendingUp } from "react-icons/fi";

// Konfigurasi Standar Toast SweetAlert2 asli milik Anda
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Fungsi Logika Utama asli milik Anda (Tidak Disentuh)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      Toast.fire({
        icon: "warning",
        title: "Email dan password wajib diisi.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/login", { email, password });
      const { access_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_profile", JSON.stringify(user));

      document.cookie = `access_token=${access_token}; path=/; max-age=86400; SameSite=Lax;`;

      Toast.fire({
        icon: "success",
        title: "Login Berhasil! Selamat datang.",
      });

      const userRoles = user.roles?.map((r: any) => r.name) || [];
      if (userRoles.includes("admin-lapangan")) {
        router.push("/dashboard/admin-lapangan");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      let msg = "Tidak dapat terhubung ke server backend.";
      if (err.response && err.response.data) {
        msg = err.response.data.message || "Terjadi kesalahan saat login.";
      }

      Toast.fire({
        icon: "error",
        title: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* ========================================== */}
      {/* SISI KIRI: Brand Panel Gambar Premium      */}
      {/* ========================================== */}
      <div
        className="w-full md:w-3/5 relative flex flex-col p-8 md:p-16 text-white min-h-[60vh] md:min-h-screen bg-cover bg-center select-none"
        style={{ backgroundImage: "url('/bg-login.jpeg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-black/30 z-0" />

        {/* 1. Logo & Identitas Aplikasi */}
        <div className="z-10 flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center">
            <img
              src="/logonobg.png"
              alt="COOP-FLOW Logo"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-bold tracking-wider text-white leading-none">
              COOP-FLOW
            </h3>
            <p className="text-xs text-gray-300 font-medium tracking-wide mt-1.5 leading-none">
              Ekosistem Digital Pertanian
            </p>
          </div>
        </div>

        {/* 2. KONTEN TENGAH: Slogan & Deskripsi Utama */}
        {/* mb-auto DIHAPUS agar tidak mengunci konten di bawahnya ke dasar viewport */}
        <div className="z-10 max-w-2xl mt-16 md:mt-36">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-[1.2] tracking-tight mb-4"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
          >
            Ekosistem Digital Berbasis{" "}
            <span className="text-green-400">GIS</span> dan{" "}
            <span className="text-green-400">Machine Learning</span> untuk
            Petani dan Koperasi.
          </h1>
          <p
            className="text-sm md:text-base text-gray-100 leading-relaxed font-medium max-w-xl"
            style={{ textShadow: "0 1px 5px rgba(0,0,0,0.4)" }}
          >
            COOP-FLOW membantu petani, koperasi, dan pemangku kepentingan dalam
            mengelola data, memantau distribusi pupuk bersubsidi, dan
            meningkatkan produktivitas pertanian secara berkelanjutan.
          </p>
        </div>

        {/* 3. KONTEN BAWAH: Tiga Kotak Informasi Statis (Stats Badges) */}
        {/* Menggunakan mt-12 agar posisinya otomatis naik pas di bawah teks deskripsi */}
        <div className="z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 mt-56">
          {/* Badge 1: Akurasi GIS */}
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <FiBarChart2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold leading-none text-white">98%</h4>
              <p className="text-xs text-gray-300 mt-1 font-medium">
                Akurasi GIS
              </p>
            </div>
          </div>

          {/* Badge 2: Petani Aktif */}
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <FiUsers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold leading-none text-white">
                15K+
              </h4>
              <p className="text-xs text-gray-300 mt-1 font-medium">
                Petani Aktif
              </p>
            </div>
          </div>

          {/* Badge 3: Monitoring */}
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <FiTrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold leading-none text-white">
                24/7
              </h4>
              <p className="text-xs text-gray-300 mt-1 font-medium">
                Monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SISI KANAN: Form Komponen Masuk            */}
      {/* ========================================== */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-6 md:p-10 bg-gray-50">
        <div className="w-full max-w-2xl bg-white p-12 md:p-16 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.07)] border border-gray-100">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
              <img
                src="/logonobg.png"
                alt="Logo"
                className="w-14 h-14 object-contain text-[#005c27]"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight">
              Selamat datang kembali!
            </h2>
            <p className="text-sm text-gray-500">
              Silakan masuk untuk mengelola COOP-FLOW
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="masukkan alamat email anda"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#005c27] focus:bg-white text-gray-900 transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  className="text-base text-[#005c27] hover:underline font-semibold"
                >
                  Lupa password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="masukkan password anda"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#005c27] focus:bg-white text-gray-900 transition-all text-sm"
              />
            </div>

            <div className="flex items-center text-sm pb-2">
              <label className="flex items-center text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 accent-[#005c27] w-4 h-4"
                />
                Ingat perangkat ini
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#005c27] text-white font-bold rounded-full hover:bg-[#00421c] active:scale-[0.99] transition duration-200 uppercase tracking-wider text-xs shadow-md shadow-green-900/10"
            >
              {loading ? "Memproses Masuk..." : "Sign In"}
            </button>

            <div className="relative flex py-4 items-center text-xs text-gray-400 uppercase font-semibold">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4">Atau</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 active:scale-[0.99] transition duration-200 uppercase tracking-wider text-xs"
            >
              Daftar Akun Baru
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
