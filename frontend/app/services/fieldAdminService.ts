// src/services/fieldAdminService.ts
import api from "../lib/axios"; // Sesuaikan dengan path axios instance Anda
import {
  FieldAdmin,
  CreateFieldAdminPayload,
  UpdateFieldAdminPayload,
} from "../types/fieldAdmin";

export const FieldAdminService = {
  // 1. Ambil semua admin lapangan
  getAll: async () => {
    const response = await api.get<{ data: FieldAdmin[] }>(
      "/cooperative/field-admins",
    );
    return response.data;
  },

  // 2. Tambah admin baru
  create: async (payload: CreateFieldAdminPayload) => {
    const response = await api.post("/cooperative/field-admins", payload);
    return response.data;
  },

  // 3. Update data admin
  update: async (id: number, payload: UpdateFieldAdminPayload) => {
    const response = await api.put(`/cooperative/field-admins/${id}`, payload);
    return response.data;
  },

  // 4. Toggle Status (Aktif/Pending)
  toggleStatus: async (id: number) => {
    const response = await api.put(
      `/cooperative/field-admins/${id}/toggle-status`,
    );
    return response.data;
  },

  // 5. Hapus Admin
  delete: async (id: number) => {
    const response = await api.delete(`/cooperative/field-admins/${id}`);
    return response.data;
  },
};
