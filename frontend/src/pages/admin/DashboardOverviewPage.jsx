import React, { useState, useEffect } from 'react'
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
  Loader2
} from 'lucide-react'
import { adminApi } from '../../api/adminApi'

export default function DashboardOverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => {
        if (res.success && res.data) {
          setData(res.data)
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
        <span className="text-xs">Memuat data analitik KRAVO HQ...</span>
      </div>
    )
  }

  const kpis = data || {}

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">Ringkasan performa penjualan retail B2C, kemitraan B2B, dan kesehatan inventaris FEFO.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/batches" className="px-4 py-2.5 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cek Batch Makanan FEFO
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              Rp {Number(kpis.total_revenue || 0).toLocaleString('id-ID')}
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
              B2C Retail & B2B Wholesale
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

      {/* Monthly Sales Chart & Best-Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Simulated Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Monthly Sales Revenue</h3>
              <p className="text-xs text-slate-500">Perbandingan Penjualan B2C Retail vs B2B Wholesale</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-kravo-dark"></span> B2C Retail</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-kravo-orange"></span> B2B Wholesale</div>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-slate-100">
            {(kpis.monthly_sales || []).map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full max-w-[2.5rem] flex items-end gap-1 h-full">
                  <div style={{ height: `${(d.b2c / 150000000) * 100}%` }} className="w-1/2 bg-kravo-dark rounded-t-md hover:opacity-80 transition-all" title={`B2C: Rp ${d.b2c.toLocaleString('id-ID')}`}></div>
                  <div style={{ height: `${(d.b2b / 150000000) * 100}%` }} className="w-1/2 bg-kravo-orange rounded-t-md hover:opacity-80 transition-all" title={`B2B: Rp ${d.b2b.toLocaleString('id-ID')}`}></div>
                </div>
                <span className="text-[11px] font-bold text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best-Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Best-Selling Products</h3>
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
                  <span className="font-extrabold text-slate-900">Rp {Number(item.total_revenue).toLocaleString('id-ID')}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic py-4 text-center">Menunggu pesanan pertama masuk.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs font-bold text-kravo-orange hover:underline">Kelola Semua Pesanan</Link>
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
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.order_type === 'b2b_wholesale' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                      }`}>{o.order_type === 'b2b_wholesale' ? 'B2B Wholesale' : 'B2C Retail'}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold">Rp {Number(o.grand_total).toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-3">
                    <Link to="/admin/orders" className="text-kravo-orange hover:underline font-bold">Detail</Link>
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
