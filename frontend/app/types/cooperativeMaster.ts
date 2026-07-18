// src/types/cooperativeMaster.ts

export interface CooperativeData {
  id: number;
  name: string;
  cooperative_code: string;
  nik_cooperative: string;
  legal_entity_type: string;
  legal_entity_number: string;
  established_date: string;
  npwp: string;
  address: string;
  email_cooperative: string;
  phone_cooperative: string;
  postal_code: string;
  province: string;
  city_koor: string;
  district: string;
  village: string;
  warehouse_capacity_ton: number;
  warehouse_surface_area: number;
  is_activated: boolean;
  is_profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface KemenkoCooperativeUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  rejection_reason: string | null;
  cooperative_id: number;
  created_at: string;
  updated_at: string;
  cooperative: CooperativeData; // Relasi dari with('cooperative')
}

// Untuk keperluan statistik di card atas dashboard
export interface CooperativeStats {
  total_cooperative: number;
  active_cooperative: number;
  pending_cooperative: number;
  registered_this_month: number;
}
