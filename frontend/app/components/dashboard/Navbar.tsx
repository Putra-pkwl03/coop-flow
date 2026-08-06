"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { db } from "../../lib/db"; // Sesuaikan relative path ke db.ts
import { syncOfflineData } from "../../lib/syncEngine"; // Sesuaikan relative path ke syncEngine.ts

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
  
  // Mencegah mismatch hydration: default awal true, lalu dicek pasti di client mount
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Inisialisasi status koneksi & listener jaringan
  useEffect(() => {
    setIsMounted(true);
    const roleFromCookie = getCookie("user_role");
    setCurrentRole(roleFromCookie);

    // Dapatkan status aktual dari browser saat ini
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      handleTriggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Fungsi pembaru antrean sync di IndexedDB (Dexie)
    const updateSyncCount = async () => {
      try {
        const count = await db.syncQueue.count();
        setPendingSyncCount(count);
      } catch (err) {
        console.error("Gagal membaca syncQueue:", err);
      }
    };

    updateSyncCount();
    const intervalId = setInterval(updateSyncCount, 2500);

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
  }, []);

  // Handler Sinkronisasi Data Manual
  const handleTriggerSync = async () => {
    if (typeof window === "undefined" || !navigator.onLine || isManualSyncing) return;
    
    setIsManualSyncing(true);
    try {
      await syncOfflineData();
      const count = await db.syncQueue.count();
      setPendingSyncCount(count);
    } catch (error) {
      console.error("Sinkronisasi gagal:", error);
    } finally {
      setIsManualSyncing(false);
    }
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
        {/* Indikator Sinkronisasi Dinamis (Khusus Admin Lapangan) */}
        {currentRole === "admin-lapangan" && isMounted && (
          <button
            onClick={handleTriggerSync}
            disabled={!isOnline || isManualSyncing}
            className={`hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl border transition-all text-left ${
              !isOnline
                ? "bg-red-500/20 border-red-400/40 text-red-100 cursor-not-allowed"
                : pendingSyncCount > 0
                ? "bg-amber-500/25 border-amber-300/50 text-amber-100 hover:bg-amber-500/35 cursor-pointer shadow-sm"
                : "bg-emerald-800/40 border-emerald-600/30 text-emerald-100"
            }`}
            title={
              !isOnline
                ? "Koneksi terputus (Offline)"
                : pendingSyncCount > 0
                ? "Klik untuk sinkronisasi data ke server"
                : "Semua data tersinkron sempurna"
            }
          >
            {/* Icon Status */}
            {isManualSyncing ? (
              <FaSyncAlt className="animate-spin text-amber-300 text-base" />
            ) : !isOnline ? (
              <FaExclamationTriangle className="text-red-300 text-base animate-pulse" />
            ) : pendingSyncCount > 0 ? (
              <FaCloudUploadAlt className="text-amber-300 text-lg animate-bounce" />
            ) : (
              <FaWifi className="text-emerald-300 text-base" />
            )}

            {/* Label Status */}
            <div className="leading-tight">
              <p className="text-[11px] font-bold flex items-center gap-1.5">
                <span>{isOnline ? "Online" : "Offline"}</span>
                {pendingSyncCount > 0 && (
                  <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                    {pendingSyncCount}
                  </span>
                )}
              </p>
              <p className="text-[10px] opacity-80">
                {!isOnline
                  ? `${pendingSyncCount} data tersimpan lokal`
                  : pendingSyncCount > 0
                  ? `${pendingSyncCount} data belum tersinkron`
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