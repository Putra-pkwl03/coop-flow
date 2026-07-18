// src/types/cooperative.ts
export interface CooperativeRegistrationData {
  cooperative_name: string;
  cooperative_code: string;
  nik_cooperative: string;
  npwp: string;
  legal_entity_type: string;
  legal_entity_number: string;
  established_date: string;
  address_cooperative: string;
  email_cooperative: string;
  phone_cooperative: string;
  province: string;
  city_koor: string;
  district: string;
  village: string;
  postal_code: string;
  capacity_ton: number | string;
  password: string;
}
