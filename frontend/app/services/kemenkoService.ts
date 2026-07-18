// src/services/kemenkoService.ts
import api from "../lib/axios"; // Hubungkan ke Axios instance Anda
import { KemenkoCooperativeUser } from "../types/cooperativeMaster";

export const KemenkoService = {
  // 1. Ambil antrean koperasi yang berstatus PENDING
  getPendingRegistrations: async () => {
    const response = await api.get<{
      success: boolean;
      data: KemenkoCooperativeUser[];
    }>("/kemenko/registrations/pending");
    return response.data;
  },

  // 2. Aktifkan Koperasi langsung dari baris tabel (One-click Activate)
  approveCooperative: async (userId: number) => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/kemenko/registrations/${userId}/approve`,
    );
    return response.data;
  },

  // 3. Tolak Pendaftaran Koperasi (Jika diperlukan tombol Tolak/Reject)
  rejectCooperative: async (userId: number, reason: string) => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/kemenko/registrations/${userId}/reject`,
      { rejection_reason: reason },
    );
    return response.data;
  },
};
