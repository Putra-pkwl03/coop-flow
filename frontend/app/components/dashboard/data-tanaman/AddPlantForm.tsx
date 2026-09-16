'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Land, Plant } from '@/app/types/farmer'; 

// Penyesuaian antarmuka input tanaman agar mencakup parameter pendukung ML yang lengkap
interface PlantInput {
  name: string;
  planting_date: string;
  current_phase?: string;
  last_fertilizer_type?: string;
  last_fertilizer_amount?: number;
  last_phase?: string;
}

interface AddPlantFormProps {
  lands: Land[];
  initialLandId?: number | null; // <-- Tambahkan prop ini
  onCancel: () => void;
  onSave: (data: { land_id: number; plants: PlantInput[] }) => void;
  editingPlant?: (Plant & { land_id: number }) | null;
  onUpdate?: (
    plantId: string | number, 
    updatedData: { 
      name: string; 
      planting_date: string; 
      land_id: number;
      current_phase?: string;
      last_fertilizer_type?: string;
      last_fertilizer_amount?: number;
      last_phase?: string;
    }
  ) => void;
}

export default function AddPlantForm({ 
  lands, 
  initialLandId,
  onCancel, 
  onSave, 
  editingPlant, 
  onUpdate 
}: AddPlantFormProps) {
  
  const isEditMode = !!editingPlant;

  const defaultLandId = initialLandId || lands[0]?.id || 0;
  const [selectedLandId, setSelectedLandId] = useState<number>(defaultLandId);
  const [landArea, setLandArea] = useState<string>('0');

  // Inisialisasi baris input utama dengan field parameter tanaman terlengkap
  const [plantRows, setPlantRows] = useState<PlantInput[]>([
    { 
      name: '', 
      planting_date: new Date().toISOString().split('T')[0],
      current_phase: '',
      last_fertilizer_type: '',
      last_fertilizer_amount: undefined,
      last_phase: ''
    }
  ]);

// EFFECT 1: Update state saat initialLandId / editingPlant berubah
  useEffect(() => {
    if (isEditMode && editingPlant) {
      setSelectedLandId(editingPlant.land_id);
      setPlantRows([
        { 
          name: editingPlant.name, 
          planting_date: editingPlant.planting_date,
          current_phase: editingPlant.current_phase || '',
          last_fertilizer_type: editingPlant.last_fertilizer_type || '',
          last_fertilizer_amount: editingPlant.last_fertilizer_amount,
          last_phase: editingPlant.last_phase || ''
        }
      ]);
    } else {
      setSelectedLandId(initialLandId || lands[0]?.id || 0);
      setPlantRows([
        { 
          name: '', 
          planting_date: new Date().toISOString().split('T')[0],
          current_phase: '',
          last_fertilizer_type: '',
          last_fertilizer_amount: undefined,
          last_phase: ''
        }
      ]);
    }
  }, [editingPlant, isEditMode, lands, initialLandId]);

  // EFFECT 2: Update luas lahan otomatis sesuai selectedLandId
  useEffect(() => {
    const currentLand = lands.find((l) => l.id === Number(selectedLandId));
    if (currentLand) {
      setLandArea(currentLand.area);
    }
  }, [selectedLandId, lands]);

  

  // EFFECT 2: Sinkronisasi Luas Lahan saat target lahan diubah
  useEffect(() => {
    const currentLand = lands.find((l) => l.id === Number(selectedLandId));
    if (currentLand) {
      setLandArea(currentLand.area);
    }
  }, [selectedLandId, lands]);

  // Fungsi menambah baris input baru (Hanya aktif di mode tambah)
  const handleAddRow = () => {
    if (isEditMode) return;
    setPlantRows([
      ...plantRows,
      { 
        name: '', 
        planting_date: new Date().toISOString().split('T')[0],
        current_phase: '',
        last_fertilizer_type: '',
        last_fertilizer_amount: undefined,
        last_phase: '' 
      }
    ]);
  };

  // Fungsi menghapus baris input tertentu
  const handleRemoveRow = (index: number) => {
    if (plantRows.length === 1 || isEditMode) return; 
    setPlantRows(plantRows.filter((_, i) => i !== index));
  };

  // Fungsi memperbarui nilai input per baris secara dinamis
  const handleInputChange = (index: number, field: keyof PlantInput, value: any) => {
    const updatedRows = [...plantRows];
    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value === '' ? undefined : value
    };
    setPlantRows(updatedRows);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLandId) return;

    if (isEditMode && editingPlant && onUpdate) {
      onUpdate(editingPlant.id, {
        name: plantRows[0].name,
        planting_date: plantRows[0].planting_date,
        land_id: Number(selectedLandId),
        current_phase: plantRows[0].current_phase,
        last_fertilizer_type: plantRows[0].last_fertilizer_type,
        last_fertilizer_amount: plantRows[0].last_fertilizer_amount ? Number(plantRows[0].last_fertilizer_amount) : undefined,
        last_phase: plantRows[0].last_phase
      });
    } else {
      // Normalisasi jumlah pemupukan sebelum dikirim ke onSave
      const formattedPlants = plantRows.map(row => ({
        ...row,
        last_fertilizer_amount: row.last_fertilizer_amount ? Number(row.last_fertilizer_amount) : undefined
      }));

      onSave({
        land_id: Number(selectedLandId),
        plants: formattedPlants
      });
    }
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border shadow-md space-y-4 animate-in fade-in duration-200 ${isEditMode ? 'border-amber-500' : 'border-emerald-500'}`}>
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-800">
          {isEditMode ? 'Edit Informasi Varietas & Indikator Tanaman' : 'Tambah Varietas Tanaman Baru pada Lahan'}
        </h3>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${isEditMode ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>
          {isEditMode ? 'Mode Edit Data' : 'Mendukung Banyak Varietas Sekaligus'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* DETAIL LAHAN (MASTER) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-500 mb-1">Pilih Target Lahan</label>
            <select
              value={selectedLandId}
              onChange={(e) => setSelectedLandId(Number(e.target.value))}
              disabled={isEditMode}
              className="w-full border border-zinc-200 rounded-xl p-2.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {lands.map((land) => (
                <option key={land.id} value={land.id}>
                  {land.land_name || `Lahan #${land.id}`} - {land.location_address || 'Tanpa Alamat'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">Luas Lahan (Ha)</label>
            <input
              type="text"
              readOnly
              disabled
              value={`${landArea} Ha`}
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl p-2.5 text-sm font-bold text-zinc-500 cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

        {/* INPUT DINAMIS PER BARIS TANAMAN */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            {isEditMode ? 'Data Komoditas / Informasi Agrikultur' : 'Daftar Komoditas / Varietas Tanam'}
          </label>
          
          {plantRows.map((row, index) => (
            <div 
              key={index} 
              className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm space-y-3 relative group"
            >
              {/* Baris Utama: Nama & Tanggal Tanam */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className={isEditMode ? "sm:col-span-7" : "sm:col-span-6"}>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">
                    Nama Varietas / Jenis Tanaman {isEditMode ? '' : `(#${index + 1})`}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Padi Ciherang, Cabai Rawit"
                    value={row.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">Tanggal Tanam</label>
                  <input
                    type="date"
                    required
                    value={row.planting_date}
                    onChange={(e) => handleInputChange(index, 'planting_date', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {!isEditMode && (
                  <div className="sm:col-span-1 flex justify-center pb-0.5">
                    <button
                      type="button"
                      disabled={plantRows.length === 1}
                      onClick={() => handleRemoveRow(index)}
                      className="p-2.5 text-zinc-400 hover:text-rose-600 border border-zinc-100 hover:border-rose-200 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed w-full flex justify-center items-center"
                      title="Hapus baris ini"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                )}
              </div>

              {/* Baris Tambahan: Informasi Tambahan Komoditas (Fase & Pemupukan) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-dashed border-zinc-100">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">Fase Saat Ini</label>
                  <input
                    type="text"
                    placeholder="Contoh: Vegetatif"
                    value={row.current_phase || ''}
                    onChange={(e) => handleInputChange(index, 'current_phase', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-zinc-50/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">Fase Sebelumnya</label>
                  <input
                    type="text"
                    placeholder="Contoh: Persemaian"
                    value={row.last_phase || ''}
                    onChange={(e) => handleInputChange(index, 'last_phase', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-zinc-50/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">Jenis Pupuk Terakhir</label>
                  <input
                    type="text"
                    placeholder="Contoh: NPK Mutiara"
                    value={row.last_fertilizer_type || ''}
                    onChange={(e) => handleInputChange(index, 'last_fertilizer_type', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-zinc-50/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">Jumlah Pupuk (Kg)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: 25"
                    value={row.last_fertilizer_amount ?? ''}
                    onChange={(e) => handleInputChange(index, 'last_fertilizer_amount', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-zinc-50/30"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BUTTON TAMBAH BARIS */}
        {!isEditMode && (
          <button
            type="button"
            onClick={handleAddRow}
            className="w-full py-2 border border-dashed border-zinc-300 rounded-xl text-xs font-bold text-zinc-600 hover:text-emerald-600 hover:border-emerald-400 bg-zinc-50/50 hover:bg-emerald-50/30 transition flex items-center justify-center gap-2"
          >
            <FaPlus className="text-[10px]" />
            <span>Tambah Baris Tanaman Baru</span>
          </button>
        )}

        {/* FOOTER ACTION BUTTONS */}
        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition shadow-sm ${isEditMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {isEditMode ? 'Simpan Perubahan' : `Simpan Semua (${plantRows.length} Tanaman)`}
          </button>
        </div>
      </form>
    </div>
  );
}