import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Calendar,
  Filter,
  BarChart3,
  ArrowUpRight,
  RefreshCw,
  PackageCheck
} from 'lucide-react'
import { adminApi } from '../../api/adminApi'

const MONTH_NAMES = [
  { num: 1, name: 'Januari', short: 'Jan' },
  { num: 2, name: 'Februari', short: 'Feb' },
  { num: 3, name: 'Maret', short: 'Mar' },
  { num: 4, name: 'April', short: 'Apr' },
  { num: 5, name: 'Mei', short: 'Mei' },
  { num: 6, name: 'Juni', short: 'Jun' },
  { num: 7, name: 'Juli', short: 'Jul' },
  { num: 8, name: 'Agustus', short: 'Agt' },
  { num: 9, name: 'September', short: 'Sep' },
  { num: 10, name: 'Oktober', short: 'Okt' },
  { num: 11, name: 'November', short: 'Nov' },
  { num: 12, name: 'Desember', short: 'Des' },
]

export default function DashboardOverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('all') // 'all' or 1..12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [hoveredMonth, setHoveredMonth] = useState(null)

  const loadData = (m = selectedMonth, y = selectedYear) => {
    setLoading(true)
    const params = { year: y }
    if (m && m !== 'all') {
      params.month = m
    }
    adminApi.getDashboard(params)
      .then(res => {
        if (res.success && res.data) {
          setData(res.data)
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData(selectedMonth, selectedYear)
  }, [selectedMonth, selectedYear])

  const kpis = data || {}
  const monthlySales = kpis.monthly_sales || []
  const monthBreakdown = kpis.month_breakdown || {}
  const filterMeta = kpis.filter || {}

  // Calculate dynamic maximum revenue scale for chart scaling
  const maxRevenueVal = useMemo(() => {
    const highestBar = Math.max(
      ...monthlySales.map(d => Math.max(d.b2c || 0, d.b2b || 0)),
      0
    )
    // Minimum scale denominator to make bars visible and avoid divide-by-zero
    return highestBar > 0 ? highestBar * 1.15 : 1000000
  }, [monthlySales])

  const currentMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') {
      return `Akumulasi Seluruh Bulan (${selectedYear})`
    }
    const found = MONTH_NAMES.find(m => m.num === Number(selectedMonth))
    return found ? `${found.name} ${selectedYear}` : `Bulan ${selectedMonth} ${selectedYear}`
  }, [selectedMonth, selectedYear])

  const formatRupiah = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID')
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header with Month & Year Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-kravo-dark text-white">
              Executive Dashboard
            </span>
            <span className="text-xs text-slate-400 font-medium">Data Realtime Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ringkasan Keuangan & Operasional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Performa omset penjualan, audit batch FEFO, dan status kemitraan reseller.
          </p>
        </div>

        {/* Filter Controls: Month & Year Selector */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-kravo-orange" />
            <span className="text-slate-400 font-medium">Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Bulan (Jan - Des)</option>
              {MONTH_NAMES.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name} {m.num === 11 ? '(Bulan Berjalan)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700">
            <span className="text-slate-400 font-medium">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {(filterMeta.available_years || [selectedYear]).map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadData(selectedMonth, selectedYear)}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-kravo-orange' : ''}`} />
          </button>
        </div>
      </div>

      {/* Monthly Filter Summary Spotlight Card */}
      <div className="bg-gradient-to-r from-kravo-dark via-kravo-darkMuted to-[#1A2019] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-kravo-orange/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-kravo-orange text-white text-[11px] font-black uppercase tracking-wider">
                {selectedMonth === 'all' ? 'Laporan Tahunan' : 'Laporan Bulanan'}
              </span>
              <span className="text-xs text-kravo-cream/70 font-medium">
                Periode: <strong className="text-white">{currentMonthLabel}</strong>
              </span>
            </div>
            <div className="text-xs text-kravo-cream/70 font-medium">Total Pendapatan Terverifikasi</div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatRupiah(kpis.total_revenue)}
            </div>
            <div className="text-xs text-kravo-cream/60">
              Total <strong className="text-white font-bold">{kpis.total_orders || 0} transaksi berhasil</strong> (Status: Paid / Processing / Shipped / Delivered)
            </div>
          </div>

          {/* Breakdown Pills: B2C vs B2B */}
          <div className="grid grid-cols-2 gap-3 min-w-[280px] sm:min-w-[340px]">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="flex items-center gap-1.5 text-xs text-kravo-cream/80 mb-1 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                B2C Retail
              </div>
              <div className="text-lg font-black text-white">
                {formatRupiah(monthBreakdown.b2c_revenue)}
              </div>
              <div className="text-[11px] text-kravo-cream/60 mt-0.5">
                {monthBreakdown.b2c_orders || 0} Pesanan
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 mb-1 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-kravo-orange"></span>
                B2B Wholesale
              </div>
              <div className="text-lg font-black text-amber-400">
                {formatRupiah(monthBreakdown.b2b_revenue)}
              </div>
              <div className="text-[11px] text-kravo-cream/60 mt-0.5">
                {monthBreakdown.b2b_orders || 0} Pesanan Grosir
              </div>
            </div>

            <div className="col-span-2 pt-1 flex justify-end">
              <Link 
                to="/admin/reports" 
                className="inline-flex items-center gap-1.5 text-xs text-kravo-orange hover:text-white font-bold transition-colors"
              >
                Lihat Detail Laporan Akuntansi <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {selectedMonth === 'all' ? 'Total Revenue (All Time)' : 'Revenue Bulan Terpilih'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {formatRupiah(kpis.total_revenue)}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Transaksi Terverifikasi
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{kpis.total_orders || 0}</div>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-bold mt-1">
              {monthBreakdown.b2c_orders || 0} Retail + {monthBreakdown.b2b_orders || 0} Grosir
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{kpis.total_customers || 0}</div>
            <div className="text-xs text-slate-400 mt-1">Pelanggan Retail Terdaftar</div>
          </div>
        </div>

        {/* Total Resellers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Resellers</span>
            <div className="w-10 h-10 rounded-xl bg-kravo-orange/10 text-kravo-orange flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{kpis.total_resellers || 0} Mitra</div>
            <div className="text-xs text-kravo-orange font-bold mt-1">
              {kpis.pending_resellers || 0} Menunggu Verifikasi
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Sales Revenue Diagram & Best-Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Sales Real Database Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-kravo-orange" />
                <h3 className="font-extrabold text-base text-slate-900">Monthly Sales Revenue</h3>
              </div>
              <p className="text-xs text-slate-500">
                Grafik agregasi penjualan riil database ({selectedYear}) — Klik bulan untuk filter
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-kravo-dark"></span> 
                <span>B2C Retail</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-kravo-orange"></span> 
                <span>B2B Wholesale</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="pt-4">
            {/* Hover Tooltip Spotlight */}
            <div className="min-h-[44px] p-2.5 mb-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              {hoveredMonth ? (
                <>
                  <div className="font-bold text-slate-900">
                    Bulan: <span className="text-kravo-orange">{hoveredMonth.month_name} {hoveredMonth.year}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-700">Retail: <strong>{formatRupiah(hoveredMonth.b2c)}</strong> ({hoveredMonth.b2c_orders} order)</span>
                    <span className="text-amber-700">Grosir: <strong>{formatRupiah(hoveredMonth.b2b)}</strong> ({hoveredMonth.b2b_orders} order)</span>
                    <span className="font-black text-slate-900">Total: {formatRupiah(hoveredMonth.total)}</span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 italic">
                  Arahkan kursor atau klik pada salah satu bulan untuk melihat rincian omset.
                </div>
              )}
            </div>

            {/* Bar Chart Area */}
            <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-200">
              {monthlySales.map((d) => {
                const isSelected = selectedMonth !== 'all' && Number(selectedMonth) === d.month_num
                
                // Calculate proportional bar heights based on maxRevenueVal
                const b2cHeightPct = maxRevenueVal > 0 
                  ? (d.b2c > 0 ? Math.max((d.b2c / maxRevenueVal) * 100, 8) : 0) 
                  : 0
                const b2bHeightPct = maxRevenueVal > 0 
                  ? (d.b2b > 0 ? Math.max((d.b2b / maxRevenueVal) * 100, 8) : 0) 
                  : 0

                return (
                  <div
                    key={d.month_num}
                    onClick={() => setSelectedMonth(d.month_num)}
                    onMouseEnter={() => setHoveredMonth(d)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className={`flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer p-1 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-amber-50 ring-2 ring-kravo-orange shadow-sm'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-full max-w-[2.25rem] flex items-end gap-1 h-full">
                      {/* B2C Bar */}
                      <div
                        style={{ height: `${b2cHeightPct}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          d.b2c > 0 
                            ? 'bg-kravo-dark hover:opacity-80' 
                            : 'bg-slate-100 h-1'
                        }`}
                        title={`B2C: ${formatRupiah(d.b2c)} (${d.b2c_orders} order)`}
                      />
                      {/* B2B Bar */}
                      <div
                        style={{ height: `${b2bHeightPct}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          d.b2b > 0 
                            ? 'bg-kravo-orange hover:opacity-80' 
                            : 'bg-slate-100 h-1'
                        }`}
                        title={`B2B: ${formatRupiah(d.b2b)} (${d.b2b_orders} order)`}
                      />
                    </div>
                    <span className={`text-[11px] font-bold ${
                      isSelected ? 'text-kravo-orange font-black' : 'text-slate-500'
                    }`}>
                      {d.month}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 font-medium">
              <span>Skala Maksimum: {formatRupiah(maxRevenueVal)}</span>
              <span>Klik batang untuk filter bulan otomatis</span>
            </div>
          </div>
        </div>

        {/* Best-Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Best-Selling Products</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{currentMonthLabel}</span>
          </div>

          <div className="space-y-3">
            {(kpis.best_selling_products || []).length > 0 ? (
              kpis.best_selling_products.map((item, idx) => (
                <div key={item.product_name} className="flex items-center justify-between text-xs p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-slate-400 w-4">#{idx + 1}</span>
                    <div>
                      <span className="font-bold text-slate-800 line-clamp-1">{item.product_name}</span>
                      <span className="text-[11px] text-slate-400">{item.total_qty} pcs terjual</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900">
                    {formatRupiah(item.total_revenue)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic py-8 text-center">
                Belum ada transaksi produk di periode ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical Food Safety & Inventory Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-amber-950">Low Stock Alerts (Stok Menipis &le; 50 pcs)</h3>
            </div>
            <Link to="/admin/inventory" className="text-xs font-bold text-amber-700 hover:underline">Kelola Stok</Link>
          </div>

          <div className="space-y-2 text-xs">
            {kpis.low_stock_alerts && kpis.low_stock_alerts.length > 0 ? (
              kpis.low_stock_alerts.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200">
                  <div>
                    <span className="font-bold text-slate-800">{inv.product_variant?.product?.name} ({inv.product_variant?.name})</span>
                    <span className="block text-[11px] text-slate-500">SKU: {inv.product_variant?.sku}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                    Sisa: {inv.available_stock} pcs
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-3 bg-white rounded-xl">Semua stok berada di atas batas aman.</div>
            )}
          </div>
        </div>

        {/* Expiring Product Alerts (FEFO Early Warning) */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-rose-950">Expiring Product Alerts (&le; 60 Hari)</h3>
            </div>
            <Link to="/admin/batches" className="text-xs font-bold text-rose-700 hover:underline">Batch FEFO</Link>
          </div>

          <div className="space-y-2 text-xs">
            {kpis.expiring_product_alerts && kpis.expiring_product_alerts.length > 0 ? (
              kpis.expiring_product_alerts.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-200">
                  <div>
                    <span className="font-bold text-slate-800">Batch #{b.batch_number} ({b.product_variant?.product?.name})</span>
                    <span className="block text-[11px] text-slate-500">Expired: {b.expiry_date}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold">
                    {b.current_quantity} pcs Prioritas
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-3 bg-white rounded-xl">Seluruh batch produksi dalam kondisi segar (&gt; 60 hari).</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Recent Orders</h3>
            <p className="text-xs text-slate-500">Pesanan terbaru yang tercatat di sistem</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-kravo-orange hover:underline">
            Kelola Semua Pesanan &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Pemesan</th>
                <th className="py-3 px-3">Segmen</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Grand Total</th>
                <th className="py-3 px-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {(kpis.recent_orders || []).map((o) => (
                <tr key={o.id}>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{o.order_number}</td>
                  <td className="py-3.5 px-3">{o.user?.name || 'Customer'}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      o.order_type === 'b2b_wholesale' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {o.order_type === 'b2b_wholesale' ? 'B2B Wholesale' : 'B2C Retail'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold">{formatRupiah(o.grand_total)}</td>
                  <td className="py-3.5 px-3">
                    <Link to="/admin/orders" className="text-kravo-orange hover:underline font-bold">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
