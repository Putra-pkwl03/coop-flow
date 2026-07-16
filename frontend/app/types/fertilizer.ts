// types/fertilizer.ts
export interface FertilizerItem {
  id: number;
  nama: string; // Organik, NPK, Urea
  fungsi: string;
  harga: number;
  jumlah_karung: number;
  is_checked?: boolean;
}

export interface PredictionResponse {
  success: boolean;
  message: string;
  data: {
    recommendations: FertilizerItem[];
  };
}