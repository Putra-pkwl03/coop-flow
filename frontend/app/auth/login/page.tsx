"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import Swal from "sweetalert2";
import { FiBarChart2, FiUsers, FiTrendingUp, FiWifiOff } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  
  // State Input & Process
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State Status Internet
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Monitoring koneksi internet pengguna
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi 1: Cek Koneksi Online
    if (!isOnline) {
      Swal.fire({
        icon: "error",
        title: "Koneksi Terputus",
        text: "Proses autentikasi memerlukan koneksi internet. Harap periksa jaringan Anda lalu coba lagi.",
        confirmButtonColor: "#005c27",
      });
      return;
    }

    // Validasi 2: Input Kosong
    if (!identifier || !password) {
      Toast.fire({
        icon: "warning",
        title: "Email / NIK dan password wajib diisi.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/login", {
        login_identifier: identifier,
        email: identifier,
        password: password,
      });

      const { access_token, user } = response.data;

      // 1. Simpan data ke LocalStorage untuk Client-Side State
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_profile", JSON.stringify(user));

      // 2. Ambil semua role dari user
      const userRoles = user.roles?.map((r: any) => r.name) || [];
      const primaryRole = userRoles[0] || ""; 

      // 3. Simpan access_token DAN user_role ke Cookies agar terbaca oleh Middleware
      document.cookie = `access_token=${access_token}; path=/; max-age=86400; SameSite=Lax;`;
      document.cookie = `user_role=${primaryRole}; path=/; max-age=86400; SameSite=Lax;`;

      Toast.fire({
        icon: "success",
        title: "Login Berhasil! Selamat datang.",
      });

      // 4. Redirect berdasarkan Role
      if (userRoles.includes("admin-lapangan")) {
        router.push("/dashboard/admin-lapangan");
      } else if (userRoles.includes("petugas-koperasi")) {
        router.push("/dashboard/admin-koprasi");
      } else if (userRoles.includes("dinas-pertanian")) {
        router.push("/dashboard/dinas-pertanian");
      } else if (userRoles.includes("kemenko-pangan")) {
        router.push("/dashboard/kemenko-pangan");
      } else if (userRoles.includes("petani")) {
        router.push("/dashboard/petani");
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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans">
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

        {/* 3. KONTEN BAWAH: Badges Statistics */}
        <div className="z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 mt-20 md:mt-auto">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <FiBarChart2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold leading-none text-white">98%</h4>
              <p className="text-xs text-gray-300 mt-1 font-medium">Akurasi GIS</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <FiUsers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold leading-none text-white">15K+</h4>
              <p className="text-xs text-gray-300 mt-1 font-medium">Petani Aktif</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <FiTrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold leading-none text-white">24/7</h4>
              <p className="text-xs text-gray-300 mt-1 font-medium">Monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SISI KANAN: Form Komponen Masuk            */}
      {/* ========================================== */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-6 md:p-10 bg-gray-50">
        <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.07)] border border-gray-100">
          
          {/* Banner Peringatan Offline */}
          {!isOnline && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-semibold animate-pulse">
              <FiWifiOff className="text-lg shrink-0" />
              <span>
                Anda sedang <strong>offline</strong>. Koneksi internet dibutuhkan untuk masuk ke akun Anda.
              </span>
            </div>
          )}

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
              Silakan masuk ke akun COOP-FLOW Anda
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email / NIK (16 Digit)
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan Email atau NIK KTP Anda"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#005c27] focus:bg-white text-gray-900 transition-all text-sm font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-[#005c27] hover:underline font-bold"
                >
                  Lupa password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#005c27] focus:bg-white text-gray-900 transition-all text-sm font-medium"
              />
            </div>

            <div className="flex items-center text-sm pb-2">
              <label className="flex items-center text-gray-600 cursor-pointer select-none text-xs font-semibold">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 accent-[#005c27] w-4 h-4"
                />
                Ingat perangkat ini
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !isOnline}
              className={`w-full py-4 text-white font-bold rounded-full transition duration-200 uppercase tracking-wider text-xs shadow-md ${
                !isOnline
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-[#005c27] hover:bg-[#00421c] active:scale-[0.99] shadow-green-900/10"
              }`}
            >
              {loading
                ? "Memproses Masuk..."
                : !isOnline
                ? "Mode Offline (Butuh Internet)"
                : "Sign In"}
            </button>

            <div className="relative flex py-3 items-center text-xs text-gray-400 uppercase font-semibold">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4">Atau</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="w-full py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 active:scale-[0.99] transition duration-200 uppercase tracking-wider text-xs"
            >
              Daftar Akun Baru
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}