import React, { useState } from "react";
import {
  FieldAdmin,
  CreateFieldAdminPayload,
  UpdateFieldAdminPayload,
} from "@/app/types/fieldAdmin";

interface FieldAdminFormProps {
  admin: FieldAdmin | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: CreateFieldAdminPayload | UpdateFieldAdminPayload) => void;
}

export default function FieldAdminForm({
  admin,
  saving,
  onClose,
  onSave,
}: FieldAdminFormProps) {
  const isEdit = !!admin;

  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [phone, setPhone] = useState(admin?.phone ?? "");
  const [address, setAddress] = useState(admin?.address ?? "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<FieldAdmin["status"]>(
    admin?.status ?? "PENDING",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("Nama dan email wajib diisi");
      return;
    }
    if (!isEdit && !password.trim()) {
      alert("Password wajib diisi untuk admin baru");
      return;
    }

    if (isEdit) {
      const payload: UpdateFieldAdminPayload = {
        name,
        email,
        phone: phone || undefined,
        address: address || undefined,
        status,
        ...(password ? { password } : {}),
      };
      onSave(payload);
    } else {
      const payload: CreateFieldAdminPayload = {
        name,
        email,
        password,
        phone: phone || undefined,
        address: address || undefined,
      };
      onSave(payload);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <Field label="Nama" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Nama lengkap"
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="nama@coop.co.id"
          />
        </Field>

        <Field label="No. Telepon">
          <input
            value={phone ?? ""}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder="08xx-xxxx-xxxx"
          />
        </Field>

        <Field label="Alamat">
          <textarea
            value={address ?? ""}
            onChange={(e) => setAddress(e.target.value)}
            className="input resize-none"
            rows={2}
            placeholder="Alamat domisili"
          />
        </Field>

        <Field
          label={isEdit ? "Password Baru (opsional)" : "Password"}
          required={!isEdit}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder={
              isEdit ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"
            }
          />
        </Field>

        {isEdit && (
          <Field label="Status">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as FieldAdmin["status"])
              }
              className="input"
            >
              <option value="ACTIVE">Aktif</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </Field>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0F7B4A] hover:bg-[#0c6a40] disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.6rem 0.9rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          box-shadow: 0 0 0 2px rgba(15, 123, 74, 0.25);
          border-color: #0f7b4a;
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
