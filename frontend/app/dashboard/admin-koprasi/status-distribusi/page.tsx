'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/axios'; 
import ProcurementOverview from '@/app/components/dashboard/admin-koperasi/procurement/ProcurementOverview';
import ProcurementTable from '@/app/components/dashboard/admin-koperasi/procurement/ProcurementTable';
import ProcurementTracker from '@/app/components/dashboard/admin-koperasi/procurement/ProcurementTracker'; 
import DistributionSummaryCard from '@/app/components/dashboard/admin-koperasi/procurement/DistributionSummaryCard';
import DistributionBanner from '@/app/components/dashboard/admin-koperasi/procurement/DistributionBanner';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function StatusDistribusiPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');

  // 1. FETCH ALL ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cooperative/procurement');
      if (response.data.success) {
        const data = response.data.data;
        setOrders(data);
        
        if (data.length > 0) {
          const latestOrder = data[0];
          if (latestOrder.periode_pengadaan) {
            setCurrentPeriod(latestOrder.periode_pengadaan);
          } else if (latestOrder.created_at) {
            const date = new Date(latestOrder.created_at);
            const formatted = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            setCurrentPeriod(formatted);
          }
        } else {
          const dynamicFallback = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          setCurrentPeriod(dynamicFallback);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data pengadaan:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. FETCH DETAIL ORDER
  const fetchOrderDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      const response = await api.get(`/cooperative/procurement/${id}`);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil detail pengadaan:", error);
      alert("Gagal memuat detail order.");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCompleteOrder = async (id: number) => {
    if (!confirm("Apakah Anda yakin fisik pupuk sudah dibongkar total di gudang koperasi?")) return;
    try {
      const response = await api.post(`/cooperative/procurement/${id}/complete`);
      if (response.data.success) {
        alert(response.data.message);
        fetchOrderDetail(id);
        fetchOrders();
      }
    } catch (err: any) {
      alert("Gagal memperbarui status pengiriman.");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.po_number.toLowerCase().includes(search.toLowerCase()) ||
                          order.periode_pengadaan.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'Disetujui') return matchesSearch && (['APPROVED', 'SELESAI'].includes(order.status_verifikasi) || order.status_logistik !== 'NONE');
    if (activeTab === 'Ditolak') return matchesSearch && ['REJECTED_DINAS', 'REJECTED_KEMENKO'].includes(order.status_verifikasi);
    return matchesSearch;
  });

  const totalPengajuan = orders.length;
  const totalJenisPupuk = orders.reduce((acc, curr) => acc + (curr.total_items || 0), 0);
  const disetujuiCount = orders.filter(o => o.status_verifikasi === 'APPROVED' || o.status_logistik === 'SELESAI').length;
  const menungguCount = orders.filter(o => ['PENDING_DINAS', 'PENDING_KEMENKO'].includes(o.status_verifikasi)).length;
  const ditolakCount = orders.filter(o => ['REJECTED_DINAS', 'REJECTED_KEMENKO'].includes(o.status_verifikasi)).length;

  const realOrdersCompleted = orders.filter(o => ['APPROVED', 'SELESAI'].includes(o.status_verifikasi) || o.status_logistik === 'SELESAI');
  const totalKgTersalurkan = realOrdersCompleted.reduce((acc, curr) => acc + (Number(curr.total_weight_kg) || 0), 0);
  const totalBagsTersalurkan = realOrdersCompleted.reduce((acc, curr) => acc + (Number(curr.total_bags_ordered) || 0), 0);
  const totalTonTersalurkan = (totalKgTersalurkan / 1000).toFixed(1);

  const generateChartData = () => {
    const monthsMap: { [key: string]: number } = {};
    const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Juni', 'Juli', 'Agt', 'Sept', 'Okt', 'Nov', 'Des'];
    const sortedOrders = [...orders].reverse();

    sortedOrders.forEach(order => {
      if (order.created_at) {
        const date = new Date(order.created_at);
        const monthName = namaBulan[date.getMonth()];
        const weightInTon = (Number(order.total_weight_kg) || 0) / 1000;
        monthsMap[monthName] = (monthsMap[monthName] || 0) + weightInTon;
      }
    });

    const formattedData = Object.keys(monthsMap).map(month => ({
      name: month,
      ton: parseFloat(monthsMap[month].toFixed(1))
    }));

    return formattedData.length > 0 ? formattedData : [{ name: '-', ton: 0 }];
  };

  return (
    <div className="space-y-6">
      {/* Header Utama */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-[#115e59] tracking-tight">Distribusi Pupuk</h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">Kelola pengiriman dan penyaluran pupuk dari koperasi ke Dinas Pertanian</p>
        </div>
        
        {/* Badge Periode Skeleton */}
        {loading ? (
          <div className="w-32 h-7 bg-zinc-200 animate-pulse rounded-xl" />
        ) : (
          <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-1.5 bg-white text-xs text-zinc-700 font-medium shadow-sm">
            <span>Periode</span>
            <span className="font-bold text-emerald-700">{currentPeriod}</span>
          </div>
        )}
      </div>

      {/* Komponen Statistik / Skeleton Overview */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 bg-white border border-zinc-100 rounded-xl space-y-3 shadow-sm animate-pulse">
              <div className="w-8 h-8 bg-zinc-200 rounded-lg" />
              <div className="h-3 bg-zinc-200 rounded w-2/3" />
              <div className="h-6 bg-zinc-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <ProcurementOverview 
          totalPengajuan={totalPengajuan}
          totalJenisPupuk={totalJenisPupuk}
          disetujuiCount={disetujuiCount}
          menungguCount={menungguCount}
          ditolakCount={ditolakCount}
        />
      )}

      {/* Visualisasi Sistem Horizontal Terbuka */}
      {selectedOrder && (
        <div className={loadingDetail ? 'opacity-50 pointer-events-none transition-opacity' : ''}>
          <ProcurementTracker 
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onCompleteOrder={handleCompleteOrder}
          />
        </div>
      )}

      {/* Bar Pencarian & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nomor pengadaan, periode pengadaan..."
            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white placeholder-zinc-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 border border-zinc-200 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 bg-white hover:bg-zinc-50 shadow-sm">
          <FaFilter className="w-3.5 h-3.5" /> Filter
        </button>
      </div>

      {/* Konten Split Grid Bawah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Sisi Kiri: Tabs + Tabel Utama */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-zinc-100 flex gap-6 text-sm font-semibold">
            {['Semua', 'Disetujui', 'Ditolak'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-2 transition-all ${activeTab === tab ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <ProcurementTable 
            loading={loading}
            loadingDetail={loadingDetail}
            orders={filteredOrders}
            selectedOrderId={selectedOrder?.id || null}
            selectedOrderData={selectedOrder} 
            onSelectOrder={(order) => {
              if (selectedOrder?.id === order.id) {
                setSelectedOrder(null);
              } else {
                fetchOrderDetail(order.id); 
              }
            }}
          />
        </div>

        {/* Sisi Kanan: Ringkasan Distribusi / Skeleton Summary */}
        <div className="sticky top-20 w-full">
          {loading ? (
            <div className="p-5 border border-zinc-100 bg-white rounded-2xl space-y-6 shadow-sm animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 rounded w-1/3" />
                <div className="h-3 bg-zinc-200 rounded w-1/2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 rounded-xl space-y-2">
                  <div className="h-3 bg-zinc-200 rounded w-2/3" />
                  <div className="h-5 bg-zinc-200 rounded w-1/2" />
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl space-y-2">
                  <div className="h-3 bg-zinc-200 rounded w-2/3" />
                  <div className="h-5 bg-zinc-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-zinc-200 rounded w-1/4" />
                <div className="h-36 bg-zinc-100 rounded-xl w-full" />
              </div>
            </div>
          ) : (
            <DistributionSummaryCard 
              totalTon={totalTonTersalurkan}
              totalBags={totalBagsTersalurkan}
              chartData={generateChartData()}
            />
          )}
        </div>
      </div>

      {/* Banner Ilustrasi Hijau */}
      <DistributionBanner />
    </div>
  );
}