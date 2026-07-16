"use client";

import { useState } from "react";
import Image from "next/image";

interface SelectedFertilizerItem {
  id: string | null;
  nama: string;
  image_url: string | null;
  jumlah_karung: number;
  packaging_size_kg: number;
  total_kg: number;
  total_cost: number;
}

interface TransactionPanelProps {
  grandTotalCost: number;
  items: SelectedFertilizerItem[];
  onBack: () => void;
}

const BACKEND_BASE_URL = "http://localhost:8000"; 

export default function TransactionPanel({ grandTotalCost, items, onBack }: TransactionPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("Tunai");
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const changeAmount = amountPaid - grandTotalCost;
  const changeDisplay = changeAmount > 0 ? changeAmount : 0;

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${BACKEND_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  /**
   * Logika Baru: Mengurai total_kg menjadi fisik karung.
   * Misal: total_kg = 140kg, packaging = 50kg, total_karung = 3
   * Distribusi: Karung 1 (50kg), Karung 2 (50kg), Karung 3 (40kg)
   */
  const getExpandedBags = () => {
    const expandedList: Array<{
      nama: string;
      image_url: string | null;
      bagIndex: number;
      type: "Utuh" | "Kustom/Eceran";
      weight_kg: number;
      cost: number;
    }> = [];

    items.forEach((item) => {
      let remainingKg = item.total_kg;
      const pricePerKg = item.total_cost / item.total_kg;
      
      // Menentukan total wadah fisik yang dibeli (dibulatkan ke atas)
      // Misal 140kg / 50kg = 2.8 -> Berarti ada 3 wadah fisik karung
      const totalBagsCount = Math.ceil(item.total_kg / item.packaging_size_kg);

      for (let i = 0; i < totalBagsCount; i++) {
        // Jika sisa kiloan masih lebih besar atau sama dengan ukuran kemasan default, pasang harga utuh
        // Jika sisa kiloan kurang dari kemasan default (ex: 40kg), pasang sisa kiloannya
        const currentBagWeight = remainingKg >= item.packaging_size_kg 
          ? item.packaging_size_kg 
          : remainingKg;

        if (currentBagWeight <= 0) break;

        const isUtuh = currentBagWeight === item.packaging_size_kg;

        expandedList.push({
          nama: item.nama,
          image_url: item.image_url,
          bagIndex: expandedList.length + 1,
          type: isUtuh ? "Utuh" : "Kustom/Eceran",
          weight_kg: currentBagWeight,
          cost: Math.round(currentBagWeight * pricePerKg),
        });

        remainingKg -= currentBagWeight;
      }
    });

    return expandedList;
  };

  const expandedBags = getExpandedBags();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-base font-bold text-gray-800">Transaksi Kebutuhan Pupuk</h3>
        <p className="text-xs text-gray-400 mt-0.5">Lengkapi pembayaran untuk transaksi kebutuhan pupuk</p>
      </div>

      {/* Ringkasan Pembelian */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rincian Fisik Karung</h4>
        
        <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white max-h-[360px] overflow-y-auto">
          {expandedBags.map((bag, idx) => {
            const validImageUrl = getImageUrl(bag.image_url);

            return (
              <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-400 w-4">{bag.bagIndex}</span>
                  
                  <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {validImageUrl ? (
                      <Image 
                        src={validImageUrl} 
                        alt={bag.nama} 
                        fill 
                        className="object-cover" 
                        sizes="40px"
                        unoptimized
                      />
                    ) : (
                      <div className="bg-emerald-50 text-emerald-800 text-[9px] font-bold p-1 text-center line-clamp-2">
                        {bag.nama.substring(0, 5).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="font-bold text-gray-800">{bag.nama}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-zinc-600 font-bold">{bag.weight_kg} Kg</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wide border ${
                        bag.type === "Utuh" 
                          ? "bg-blue-50 text-blue-700 border-blue-100" 
                          : "bg-orange-50 text-orange-700 border-orange-100"
                      }`}>
                        {bag.type === "Utuh" ? `Utuh (${bag.weight_kg}kg)` : "Diubah Kasir"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-zinc-700">1 Karung</p>
                  <p className="font-extrabold text-[#115e59] mt-0.5">Rp {bag.cost.toLocaleString("id-ID")}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rincian Total Kotak Abu-Abu */}
      <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Total Fisik Wadah</span>
          <span className="font-bold text-gray-800">{expandedBags.length} Karung</span>
        </div>
        <div className="flex justify-between">
          <span>Total Akumulasi Jenis</span>
          <span className="font-bold text-gray-800">{items.length} Produk Pupuk</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
          <span className="font-semibold text-gray-800">Total Harga</span>
          <span className="font-black text-zinc-900 text-base">Rp {grandTotalCost.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Pilihan Metode Pembayaran */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Metode Pembayaran</h4>
        <div className="flex gap-6 text-xs font-semibold text-gray-700">
          {["Tunai", "Transfer", "Qris"].map((method) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="payment_method"
                value={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
                className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              {method}
            </label>
          ))}
        </div>
      </div>

      {/* Input Nominal Dibayar */}
      {paymentMethod === "Tunai" && (
        <div className="space-y-3 bg-gray-50/40 p-3.5 border border-dashed border-gray-200 rounded-xl">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nominal Dibayar</h4>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rp</span>
            <input
              type="number"
              placeholder="0"
              value={amountPaid || ""}
              onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div className="flex justify-between items-center pt-1.5 text-xs">
            <span className="font-semibold text-zinc-500">Kembalian Cash</span>
            <span className="font-black text-emerald-600 text-sm">Rp {changeDisplay.toLocaleString("id-ID")}</span>
          </div>
        </div>
      )}

      {/* Tombol Aksi Bawah */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button onClick={onBack} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition">
          Kembali
        </button>
        <button onClick={() => alert("Transaksi Sukses Dikonfirmasi!")} className="px-5 py-2.5 bg-[#115e59] text-white rounded-xl text-xs font-bold hover:bg-[#134e4a] transition">
          Konfirmasi Pembayaran
        </button>
      </div>
    </div>
  );
}