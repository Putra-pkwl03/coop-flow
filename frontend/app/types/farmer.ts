// types/farmer.ts

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  email_verified_at: string | null;
  remember_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerGroup {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Plant {
  id: string | number;
  land_id: number;
  name: string;
  planting_date: string;
  current_phase?: string;          
  last_fertilizer_type?: string;   
  last_fertilizer_amount?: number;
  last_phase?: string;
  created_at: string;
  updated_at: string;
}

export interface Land {
  id: number;
  farmer_id: number;
  land_name: string;
  province_id: string;
  city_id: string;
  district_id: string;
  village_id: string;
  area: string;
  unit: string;               
  status: string;           
  current_use: string;     
  soil_type: string;       
  water_source: string;    
  irrigation_type: string;    
  ownership_document: string; 
  location_address: string | null;
  polygon_coordinates: number[][]; 
  center_latitude: string;  
  center_longitude: string; 
  average_temperature: number;
  average_humidity: number;   
  average_monthly_precipitation: number;
  created_at: string;
  updated_at: string;
  plants?: Plant[]; 
  village?: Village;
}

export interface Village {
  id: string;
  code: string;
  district_code: string;
  name: string;
  meta?: {
    lat: string;
    long: string;
    pos: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Farmer {
  id: number;
  user_id: number;
  farmer_group_id: number;
  nik: string;
  province_id: string;
  city_id: string;
  district_id: string;
  village_id: string;
  total_land_area: string;
  notes: string | null;
  created_at: string;        
  updated_at: string;      
  user: User;
  farmer_group: FarmerGroup;
  lands: Land[];
  village?: Village; 
}