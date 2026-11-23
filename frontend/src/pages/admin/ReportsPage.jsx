import React, { useState, useEffect } from 'react'
import {
  Download,
  BarChart2,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  Filter,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { adminApi } from '../../api/adminApi'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales') // 'sales' | 'stock'

  // Sales Report State
  const [salesSummary, setSalesSummary] = useState(null)
  const [salesData, setSalesData] = useState([])
  const [salesLoading, setSalesLoading] = useState(true)
  const [salesTypeFilter, setSalesTypeFilter] = useState('all')
  const [salesStatusFilter, setSalesStatusFilter] = useState('all')
  const [salesSearch, setSalesSearch] = useState('')

  // Stock Movements Report State
  const [stockSummary, setStockSummary] = useState(null)
  const [stockData, setStockData] = useState([])
  const [stockLoading, setStockLoading] = useState(true)
  const [stockTypeFilter, setStockTypeFilter] = useState('all')
  const [stockSearch, setStockSearch] = useState('')

  // Fetch Sales Data
  const loadSalesReport = async () => {
    setSalesLoading(true)
    try {
      const res = await adminApi.getSalesReport({
        order_type: salesTypeFilter,
        status: salesStatusFilter,
      })
      if (res.success) {
        setSalesSummary(res.summary)
        setSalesData(res.data || [])
      }
    } catch {
      // Mock fallback if network issues
      setSalesSummary({
        total_revenue: 0,
        total_b2c_revenue: 0,
        total_b2b_revenue: 0,
        total_discounts: 0,
        total_shipping: 0,
        total_orders: 0,
        paid_orders_count: 0,
      })
      setSalesData([])
    } finally {
      setSalesLoading(false)
    }
  }

  // Fetch Stock Movements Data
  const loadStockReport = async () => {
    setStockLoading(true)
    try {
      const res = await adminApi.getStockMovementsReport({
        movement_type: stockTypeFilter,
      })
      if (res.success) {
        setStockSummary(res.summary)
        setStockData(res.data || [])
      }
    } catch {
      setStockSummary({
        total_in: 0,
        total_out: 0,
        total_allocated: 0,
        total_adjustments: 0,
        active_batches_count: 0,
        total_available_stock: 0,
        total_records: 0,
      })
      setStockData([])
    } finally {
      setStockLoading(false)
    }
  }

  useEffect(() => {
    loadSalesReport()
  }, [salesTypeFilter, salesStatusFilter])

  useEffect(() => {
    loadStockReport()
  }, [stockTypeFilter])

  // Export CSV Function (Excel-compatible with UTF-8 BOM)
  const downloadCsv = (filename, rows) => {
    const csvContent = '\uFEFF' + rows.map(e => e.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportSalesCsv = () => {
    if (salesData.length === 0) {
      alert('Tidak ada data penjualan untuk diekspor.')
      return
    }

    const headers = [
      'No. Invoice',
      'Tanggal Transaksi',
      'Nama Pelanggan',
      'Email',
      'Segmen Penjualan',
      'Status Pembayaran',
      'Metode Bayar',
      'Jumlah Item (pcs)',
      'Subtotal (Rp)',
      'Diskon Voucher (Rp)',
      'Ongkos Kirim (Rp)',
      'Grand Total (Rp)'
    ]

    const rows = salesData.map(o => [
      o.order_number,
      o.created_at,
      o.customer_name,
      o.customer_email,
      o.order_type,
      o.status,
      o.payment_method,
      o.items_count,
      o.subtotal,
      o.voucher_discount,
      o.shipping_cost,
      o.grand_total,
    ])

    const dateStr = new Date().toISOString().slice(0, 10)
    downloadCsv(`Laporan_Penjualan_KRAVO_${dateStr}.csv`, [headers, ...rows])
  }

  const exportStockMovementsCsv = () => {
    if (stockData.length === 0) {
      alert('Tidak ada data mutasi stok untuk diekspor.')
      return
    }

    const headers = [
      'Waktu Audit',
      'Nama Produk',
      'Varian',
      'SKU Barcode',
      'Nomor Batch FEFO',
      'Kedaluwarsa Batch',
      'Tipe Mutasi',
      'Jumlah Mutasi (pcs)',
      'Stok Sebelum (pcs)',
      'Stok Sesudah (pcs)',
      'Keterangan / Alasan',
      'Operator / Sistem'
    ]

    const rows = stockData.map(m => [
      m.created_at,
      m.product_name,
      m.variant_name,
      m.sku,
      m.batch_number,
      m.expiry_date,
      m.movement_type,
      m.quantity,
      m.previous_stock,
      m.current_stock,
      m.reason,
      m.operator,
    ])

    const dateStr = new Date().toISOString().slice(0, 10)
    downloadCsv(`Laporan_Audit_Mutasi_Stok_FEFO_KRAVO_${dateStr}.csv`, [headers, ...rows])
  }

  // Filtered lists for table search
  const filteredSales = salesData.filter(o =>
    o.order_number.toLowerCase().includes(salesSearch.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(salesSearch.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(salesSearch.toLowerCase())
  )

  const filteredStock = stockData.filter(m =>
    m.product_name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    m.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
    m.batch_number.toLowerCase().includes(stockSearch.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Laporan Keuangan & Mutasi Stok
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download rekapitulasi data akuntansi dan audit inventaris makanan.
          </p>
        </div>
      </div>

      {/* Two Main Cards: Matching Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Laporan Penjualan */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BarChart2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              B2C Retail & B2B Wholesale
            </span>
          </div>

          <div>
            <h3 className="font-black text-base text-slate-900">Laporan Penjualan B2C & B2B</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Rekap invoice, revenue bruto, diskon kupon, dan laba kotor.
            </p>
          </div>

          {/* Quick Metrics */}
          {salesSummary && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Total Omset Sukses:</span>
                <span className="font-black text-emerald-700 text-sm">{fmt(salesSummary.total_revenue)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Total Pesanan:</span>
                <span className="font-extrabold text-slate-800 text-sm">{salesSummary.total_orders} transaksi</span>
              </div>
            </div>
          )}

          <button
            onClick={exportSalesCsv}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-kravo-orange text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Excel / CSV
          </button>
        </div>

        {/* Card 2: Laporan Audit Mutasi Stok FEFO */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full">
              Audit Trail & Rotasi FEFO
            </span>
          </div>

          <div>
            <h3 className="font-black text-base text-slate-900">Laporan Audit Mutasi Stok FEFO</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Jejak pergerakan batch, produksi masuk, teralokasi, dan sisa.
            </p>
          </div>

          {/* Quick Metrics */}
          {stockSummary && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Batch FEFO Aktif:</span>
                <span className="font-black text-indigo-700 text-sm">{stockSummary.active_batches_count} batch</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Stok Gudang Siap:</span>
                <span className="font-extrabold text-slate-800 text-sm">{stockSummary.total_available_stock} pcs</span>
              </div>
            </div>
          )}

          <button
            onClick={exportStockMovementsCsv}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Excel / CSV
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'border-kravo-orange text-kravo-orange'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Rekap Data Penjualan & Keuangan
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'stock'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Audit Mutasi Stok & Jejak Batch FEFO
          </button>
        </div>

        {/* Tab 1: Sales View */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari invoice, pelanggan..."
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-kravo-orange focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={salesTypeFilter}
                  onChange={(e) => setSalesTypeFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-kravo-orange"
                >
                  <option value="all">Semua Segmen (B2C & B2B)</option>
                  <option value="b2c_retail">Retail Konsumen (B2C)</option>
                  <option value="b2b_wholesale">Grosir Agen (B2B)</option>
                </select>

                <select
                  value={salesStatusFilter}
                  onChange={(e) => setSalesStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-kravo-orange"
                >
                  <option value="all">Semua Status Order</option>
                  <option value="paid">PAID (Terbayar)</option>
                  <option value="processing">PROCESSING (Diproses)</option>
                  <option value="delivered">DELIVERED (Selesai)</option>
                  <option value="pending">PENDING</option>
                </select>

                <button
                  onClick={loadSalesReport}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {salesLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
                  <span className="text-xs">Memuat laporan penjualan...</span>
                </div>
              ) : filteredSales.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Tidak ada transaksi penjualan yang cocok dengan filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">No. Invoice</th>
                        <th className="py-3 px-4">Waktu</th>
                        <th className="py-3 px-4">Pelanggan</th>
                        <th className="py-3 px-4">Segmen</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Metode</th>
                        <th className="py-3 px-4 text-right">Subtotal</th>
                        <th className="py-3 px-4 text-right">Diskon</th>
                        <th className="py-3 px-4 text-right">Grand Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredSales.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[11px]">
                            {o.order_number}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {o.created_at}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{o.customer_name}</span>
                            <span className="text-[10px] text-slate-400">{o.customer_email}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.order_type === 'B2B Wholesale'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {o.order_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'DELIVERED' || o.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.status === 'PROCESSING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-semibold uppercase text-[11px]">
                            {o.payment_method}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-600">
                            {fmt(o.subtotal)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-rose-600 font-semibold">
                            {o.voucher_discount > 0 ? `-${fmt(o.voucher_discount)}` : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900">
                            {fmt(o.grand_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Stock Movements View */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari produk, SKU, batch..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={stockTypeFilter}
                  onChange={(e) => setStockTypeFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                >
                  <option value="all">Semua Tipe Mutasi</option>
                  <option value="in">IN (Produksi Masuk)</option>
                  <option value="out">OUT (Pengiriman Keluar)</option>
                  <option value="allocated">ALLOCATED (Alokasi Pesanan)</option>
                  <option value="adjustment">ADJUSTMENT (Penyesuaian)</option>
                </select>

                <button
                  onClick={loadStockReport}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stock Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {stockLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <span className="text-xs">Memuat laporan audit mutasi stok...</span>
                </div>
              ) : filteredStock.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Tidak ada catatan mutasi stok yang cocok dengan filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Waktu Audit</th>
                        <th className="py-3 px-4">Produk & Varian</th>
                        <th className="py-3 px-4">Batch FEFO</th>
                        <th className="py-3 px-4">Kedaluwarsa</th>
                        <th className="py-3 px-4">Tipe Mutasi</th>
                        <th className="py-3 px-4 text-center">Jumlah</th>
                        <th className="py-3 px-4 text-center">Stok Sblm / Ssdh</th>
                        <th className="py-3 px-4">Keterangan</th>
                        <th className="py-3 px-4">Operator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredStock.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                            {m.created_at}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{m.product_name}</span>
                            <span className="text-[10px] text-slate-400">{m.variant_name} ({m.sku})</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 text-[11px]">
                            {m.batch_number}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {m.expiry_date}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.movement_type === 'IN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.movement_type === 'OUT' || m.movement_type === 'ALLOCATED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {m.movement_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-black text-slate-900">
                            {m.movement_type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} pcs
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">
                            {m.previous_stock} → <strong className="text-slate-800">{m.current_stock}</strong> pcs
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={m.reason}>
                            {m.reason}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                            {m.operator}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
