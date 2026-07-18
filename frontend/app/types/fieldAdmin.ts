// src/types/fieldAdmin.ts
export interface FieldAdmin {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "PENDING" | "REJECTED";
  cooperative_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFieldAdminPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
}

export interface UpdateFieldAdminPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string;
  status?: "ACTIVE" | "PENDING" | "REJECTED";
}
