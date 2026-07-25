"use client";

import React, { useState } from "react";
import { FaSave, FaLandmark, FaLock } from "react-icons/fa";

export interface KemenkoUserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Payload yang dikirim ke backend. password & password_confirmation
// bersifat opsional — hanya disertakan kalau user memang mengisi form
// ubah password.
export type KemenkoProfileUpdatePayload = Partial<KemenkoUserData> & {
  password?: string;
  password_confirmation?: string;
};

interface KemenkoProfileFormProps {
  initialData: KemenkoUserData;
  onSubmit: (data: KemenkoProfileUpdatePayload) => void;
  isSubmitting: boolean;
}

export default function KemenkoProfileForm({
  initialData,
  onSubmit,
  isSubmitting,
}: KemenkoProfileFormProps) {
  const [form, setForm] = useState({
    name: initialData.name ?? "",
    phone: initialData.phone ?? "",
    address: initialData.address ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [passwordError, setPasswordError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const wantsPasswordChange =
      passwordForm.password.length > 0 ||
      passwordForm.password_confirmation.length > 0;

    if (wantsPasswordChange) {
      if (passwordForm.password.length < 8) {
        setPasswordError("Password baru minimal 8 karakter.");
        return;
      }
      if (passwordForm.password !== passwordForm.password_confirmation) {
        setPasswordError("Konfirmasi password tidak cocok.");
        return;
      }
    }

    const payload: KemenkoProfileUpdatePayload = { ...form };
    if (wantsPasswordChange) {
      payload.password = passwordForm.password;
      payload.password_confirmation = passwordForm.password_confirmation;
    }

    onSubmit(payload);

    if (wantsPasswordChange) {
      setPasswordForm({ password: "", password_confirmation: "" });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Bagian: Data Diri (Editable) */}
      <div className="p-6 space-y-5">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
          <FaLandmark className="text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Data Petugas Kemenko Pangan
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              placeholder="Nama lengkap"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">
              Email
            </label>
            <input
              type="email"
              value={initialData.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">
              Nomor Telepon
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">
              Alamat Kantor
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-none"
              placeholder="Alamat kantor Kemenko"
              required
            />
          </div>
        </div>
      </div>

      {/* Bagian: Ubah Password (Opsional) */}
      <div className="px-6 pb-6 space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
          <FaLock className="text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Ubah Password
          </h2>
        </div>

        <p className="text-[11px] text-slate-400 -mt-2">
          Kosongkan bagian ini jika tidak ingin mengubah password.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">
              Password Baru
            </label>
            <input
              type="password"
              name="password"
              value={passwordForm.password}
              onChange={handlePasswordChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={passwordForm.password_confirmation}
              onChange={handlePasswordChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              placeholder="Ulangi password baru"
              autoComplete="new-password"
            />
          </div>
        </div>

        {passwordError && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {passwordError}
          </p>
        )}
      </div>

      {/* Footer: Tombol Submit */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition shadow-sm shadow-emerald-600/20"
        >
          <FaSave />
          <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>
    </form>
  );
}
