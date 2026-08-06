"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FaBell,
  FaChevronDown,
  FaCloudUploadAlt,
  FaSignOutAlt,
  FaBars,
  FaUser,
  FaWifi,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { db } from "../../lib/db";
import { syncOfflineData } from "../../lib/syncEngine";

interface NavbarProps {
  adminName: string;
  roleName: string;
  handleLogout: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const getCookie = (name: string) => {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
};

const PROFILE_PATH_BY_ROLE: Record<string, string> = {
  "petugas-koperasi": "/dashboard/admin-koprasi/profil",
};

const getProfilePath = (role: string) => {
  if (!role) return "/dashboard/profil";
  return PROFILE_PATH_BY_ROLE[role] ?? `/dashboard/${role}/profil`;
};

export default function Navbar({
  adminName,
  roleName,
  handleLogout,
  isSidebarOpen,
  toggleSidebar,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>("");

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fungsi eksekusi sinkronisasi + reload halaman
  const executeSyncAndReload = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.onLine) return;

    try {
      setIsSyncing(true);
      await syncOfflineData();
      const count = await db.syncQueue.count();
      setPendingSyncCount(count);
      window.location.reload();
    } catch (error) {
      console.error("Gagal melakukan sinkronisasi data:", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Listener koneksi & antrean data
  useEffect(() => {
    setIsMounted(true);
    const roleFromCookie = getCookie("user_role");
    setCurrentRole(roleFromCookie);

    // 🌟 PERBAIKAN PENTING: Pengecekan Koneksi Aktual yang Akurat
    const checkActualConnection = async () => {
      // 1. Cek dulu flag browser dasar
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setIsOnline(false);
        return;
      }

      // 2. Gunakan AbortController dengan Timeout 2.5 Detik
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        // Ping endpoint publik yang tidak akan di-cache oleh Service Worker
        const response = await fetch(`/api/health?t=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const onlineStatus = response.ok;

        setIsOnline((prevOnline) => {
          if (!prevOnline && onlineStatus) {
            db.syncQueue
              .count()
              .then((queueCount) => {
                if (queueCount > 0) {
                  executeSyncAndReload();
                }
              })
              .catch((err) => console.error("Gagal membaca syncQueue:", err));
          }
          return onlineStatus;
        });
      } catch (err) {
        clearTimeout(timeoutId);
        // 🌟 JIKA FETCH GAGAL / TIMEOUT -> DIPASTIKAN OFFLINE
        setIsOnline(false);
      }
    };

    // Jalankan pengecekan koneksi awal
    checkActualConnection();

    // Event Handler Browser
    const handleOnline = async () => {
      await checkActualConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Update jumlah antrean sync
    const updateSyncCount = async () => {
      try {
        const count = await db.syncQueue.count();
        setPendingSyncCount(count);
      } catch (err) {
        console.error("Gagal membaca syncQueue:", err);
      }
    };

    updateSyncCount();

    // Timer Interval 4 Detik
    const intervalId = setInterval(() => {
      updateSyncCount();
      checkActualConnection();
    }, 4000);

    // Click Outside Dropdown
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("mousedown", handleClickOutside);
      clearInterval(intervalId);
    };
  }, [executeSyncAndReload]);

  const handleManualSyncClick = async () => {
    if (!isOnline || pendingSyncCount === 0 || isSyncing) return;
    await executeSyncAndReload();
  };

  const isMandatoryFullLayout =
    currentRole === "admin-lapangan" ||
    currentRole === "dinas-pertanian" ||
    currentRole === "kemenko-pangan" ||
    currentRole === "petani";

  const profilePath = getProfilePath(currentRole);

  const headerBgClass = isMandatoryFullLayout
    ? "bg-[#107349] border-b border-green-700 text-white"
    : "bg-white border-2 border-b border-slate-200 shadow-md shadow-green-800/80 text-slate-800";

  const isSyncAllowed = isOnline && pendingSyncCount > 0 && !isSyncing;

  return (
    <header
      className={`h-18 ${headerBgClass} flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50 shadow-sm shadow-zinc-100/50 font-sans transition-colors duration-200`}
    >
      {isMandatoryFullLayout ? (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-emerald-600 p-1.5 shadow-md shadow-emerald-100">
            <img
              src="/logonobg.png"
              alt="Coopflow"
              className="h-full w-full object-contain brightness-0 invert"
            />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
            COOP-FLOW
          </span>
        </div>
      ) : (
        <div className="-ml-2 lg:-ml-6 flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl transition focus:outline-none flex items-center justify-center text-slate-700 hover:bg-slate-100"
            title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
          >
            <FaBars className="text-xl" />
          </button>
        </div>
      )}

      {/* Kanan Navbar */}
      <div className="flex items-center space-x-5">
        {/* Indikator Sinkronisasi Dinamis */}
        {currentRole === "admin-lapangan" && isMounted && (
          <button
            onClick={handleManualSyncClick}
            disabled={!isSyncAllowed}
            className={`hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl border transition-all text-left ${
              !isOnline
                ? "bg-red-500/20 border-red-400/40 text-red-200 cursor-not-allowed opacity-80"
                : pendingSyncCount > 0
                ? "bg-amber-500/30 border-amber-300/60 text-amber-100 hover:bg-amber-500/40 cursor-pointer shadow-md"
                : "bg-white/30 border-white/30 text-emerald-100 cursor-default"
            }`}
            title={
              !isOnline
                ? "Mode Offline - Tidak dapat melakukan sinkronisasi"
                : pendingSyncCount > 0
                ? "Klik untuk sinkronkan data ke server & perbarui halaman"
                : "Semua data tersinkron sempurna"
            }
          >
            {/* Icon Status Dinamis */}
            {isSyncing ? (
              <FaSyncAlt className="animate-spin text-amber-300 text-base" />
            ) : !isOnline ? (
              <FaExclamationTriangle className="text-red-300 text-base" />
            ) : pendingSyncCount > 0 ? (
              <FaCloudUploadAlt className="text-amber-300 text-lg animate-bounce" />
            ) : (
              <FaWifi className="text-emerald-300 text-base" />
            )}

            {/* Label Status Dinamis */}
            <div className="leading-tight">
              <p className="text-[11px] font-bold flex items-center gap-1.5">
                <span>{isOnline ? "Mode Online" : "Mode Offline"}</span>
                {pendingSyncCount > 0 && (
                  <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                    {pendingSyncCount}
                  </span>
                )}
              </p>
              <p className="text-[10px] opacity-80">
                {isSyncing
                  ? "Menyinkronkan..."
                  : !isOnline
                  ? `${pendingSyncCount} data tersimpan lokal`
                  : pendingSyncCount > 0
                  ? "Klik untuk Sync Data"
                  : "Semua data tersinkron"}
              </p>
            </div>
          </button>
        )}

        {/* Tombol Notifikasi */}
        <button
          className={`relative p-2 rounded-full transition focus:outline-none ${
            isMandatoryFullLayout ? "hover:bg-green-800/40" : "hover:bg-slate-100"
          }`}
        >
          <FaBell
            className={`text-xl ${
              isMandatoryFullLayout ? "text-white" : "text-slate-600"
            }`}
          />
          <span
            className={`absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] font-extrabold text-white rounded-full flex items-center justify-center ring-2 ${
              isMandatoryFullLayout ? "ring-[#107349]" : "ring-white"
            }`}
          >
            2
          </span>
        </button>

        {/* Dropdown Profil */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Avatar"
              className={`h-9 w-9 rounded-full object-cover border shadow-sm ${
                isMandatoryFullLayout ? "border-emerald-500" : "border-slate-200"
              }`}
            />
            <div className="text-left hidden sm:block">
              <p
                className={`text-sm font-bold leading-tight ${
                  isMandatoryFullLayout ? "text-white" : "text-slate-800"
                }`}
              >
                {adminName}
              </p>
              <p
                className={`text-[11px] font-medium mt-0.5 uppercase tracking-wide ${
                  isMandatoryFullLayout ? "text-emerald-200" : "text-slate-400"
                }`}
              >
                {roleName}
              </p>
            </div>
            <FaChevronDown
              className={`text-xs transition ${
                isMandatoryFullLayout
                  ? "text-emerald-200 group-hover:text-white"
                  : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-zinc-100/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <Link
                href={profilePath}
                onClick={() => setDropdownOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 font-medium transition"
              >
                <FaUser className="text-slate-400" />
                <span>Profil Saya</span>
              </Link>

              <div className="my-1 border-t border-slate-100"></div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2.5 font-semibold transition"
              >
                <FaSignOutAlt />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}