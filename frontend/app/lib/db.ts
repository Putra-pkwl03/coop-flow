// lib/db.ts
import Dexie, { Table } from 'dexie';

export interface FarmerDashboardCache {
  id?: string; // ID statis e.g. 'petani_summary'
  profile: {
    name: string;
    role: string;
    avatar: string | null;
    village: string;
  };
  summary: {
    total_land_ha: number;
    fertilizer_received_kg: number;
    total_transactions: number;
    main_commodity: string;
  };
  recent_activities: Array<any>;
  calendars: {
    planting: Array<any>;
    fertilizer: Array<any>;
  };
  updated_at?: string;
}

export interface TransactionCache {
  id: number | string;
  [key: string]: any;
}



export interface FarmerGroup {
  id: number | string;
  name: string;
  description?: string | null;
  cooperative_id?: number | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Farmer {
  id: number | string;
  user_id?: number | null; // Nullable saat offline baru
  
  // Data Akun User (Penting untuk pendaftaran Petani Baru)
  name?: string;
  email?: string;
  phone?: string;
  cooperative_id?: number | null;

  // Data Profile Farmer
  farmer_group_id?: number | null;
  nik?: string | null;
  province_id?: string | null;
  city_id?: string | null;
  district_id?: string | null;
  village_id?: string | null;
  total_land_area?: number | string | null; // 🌟 Diperbarui: dukung string, number, null
  notes?: string | null;
  created_at?: string;
  updated_at?: string;

  // Relasi Opsional (Untuk sync UI App & API response)
  user?: any;
  farmer_group?: FarmerGroup | any;
  village?: any;

  // Relation Array (Untuk penampung lokal)
  lands?: Land[];
  [key: string]: any; // 🌟 Fleksibilitas untuk properti tambahan dari API
}

export interface Land {
  id: number | string;
  farmer_id: number | string;
  land_name: string;
  province_id?: string | null;
  city_id?: string | null;
  district_id?: string | null;
  village_id?: string | null;
  area: number;
  unit: string; // 'Ha' | 'm2'
  status: 'Milik Sendiri' | 'Sewa' | 'Bagi Hasil' | 'Lainnya';
  current_use?: string | null;
  soil_type?: string | null;
  water_source?: string | null;
  irrigation_type?: string | null;
  ownership_document?: string | null;
  location_address?: string | null;
  polygon_coordinates?: any | null;
  center_latitude?: number | null;
  center_longitude?: number | null;
  average_temperature?: number | null;
  average_humidity?: number | null;
  average_monthly_precipitation?: number | null;
  created_at?: string;
  updated_at?: string;
  
  // Relation Array (Untuk penampung lokal)
  plants?: Plant[];
}

export interface Plant {
  id: number | string;
  land_id: number | string;
  name: string;
  planting_date: string;
  current_phase: string;
  last_fertilizer_type?: string | null;
  last_fertilizer_amount: number;
  last_phase?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Fertilizer {
  id: number;
  fertilizer_code: string;
  cooperative_id: number;
  name: string;
  image?: string | null;
  packaging_size_kg: number;
  current_stock_kg: number;
  minimum_stock_kg: number;
  price_per_kg: number;
  status: 'tersedia' | 'menipis' | 'habis';
  created_at?: string;
  updated_at?: string;
}

// --- INTERFACE ANTREAN SINKRONISASI ---

export interface SyncQueue {
  id?: number; // Auto Increment Dexie
  table_name: 'farmers' | 'farmer_groups' | 'lands' | 'plants' | 'fertilizers';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  
  // Endpoint disesuaikan persis dengan api.php
  // Contoh: '/cooperative/fertilizers', '/farmers', '/plants'
  endpoint: string; 
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: Record<string, any>;
  created_at: string;
}


export class CoopFlowDB extends Dexie {
  farmers!: Table<Farmer, number | string>;
  farmerGroups!: Table<FarmerGroup, number | string>;
  lands!: Table<Land, number | string>;
  plants!: Table<Plant, number | string>;
  fertilizers!: Table<Fertilizer, number>;
  syncQueue!: Table<SyncQueue, number>;
  
  // 🌟 STORE BARU UNTUK DASHBOARD PETANI
  petaniDashboard!: Table<FarmerDashboardCache, string>;
  transactions!: Table<TransactionCache, number | string>;

  constructor() {
    super('CoopFlowOfflineDB');
    
    // Upgrade ke Versi 2
    this.version(2).stores({
      farmers: 'id, user_id, nik, farmer_group_id',
      farmerGroups: 'id, name',
      lands: 'id, farmer_id, land_name',
      plants: 'id, land_id, name',
      fertilizers: 'id, fertilizer_code, cooperative_id',
      syncQueue: '++id, table_name, action, created_at, method',
      
      // 🌟 INDEKS STORE BARU
      petaniDashboard: 'id',
      transactions: 'id'
    });
  }
}

export const db = new CoopFlowDB();