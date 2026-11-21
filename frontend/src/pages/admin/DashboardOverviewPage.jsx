import React from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  PackageCheck
} from 'lucide-react'

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">Ringkasan performa penjualan retail B2C, kemitraan B2B, dan kesehatan inventaris FEFO.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/batches" className="px-4 py-2 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cek Batch Makanan
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
            <div className="text-2xl font-black text-slate-900">Rp 482.500.000</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% <span className="text-slate-400 font-normal">dari bulan lalu</span>
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
            <div className="text-2xl font-black text-slate-900">3.420</div>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.1% <span className="text-slate-400 font-normal">order baru</span>
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
            <div className="text-2xl font-black text-slate-900">8.910</div>
            <div className="text-xs text-slate-400 mt-1">Member B2C retail aktif</div>
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
            <div className="text-2xl font-black text-slate-900">142 Mitra</div>
            <div className="text-xs text-kravo-orange font-bold mt-1">8 Menunggu Verifikasi</div>
          </div>
        </div>
      </div>

      {/* Critical Food Safety & Inventory Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-amber-950">Low Stock Alerts (Stok Kritis &lt; 50 pcs)</h3>
            </div>
            <Link to="/admin/inventory" className="text-xs font-bold text-amber-700 hover:underline">Kelola Stok</Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200">
              <div>
                <span className="font-bold text-slate-800">KRAVO Spicy Ghost Pepper Crisps (100g)</span>
                <span className="block text-[11px] text-slate-500">SKU: KRV-POT-GHP-100</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                Sisa: 18 pcs
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200">
              <div>
                <span className="font-bold text-slate-800">KRAVO Golden Cheddar Crackers (Family Pack)</span>
                <span className="block text-[11px] text-slate-500">SKU: KRV-CRK-CHD-250</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                Sisa: 34 pcs
              </span>
            </div>
          </div>
        </div>

        {/* Expiring Product Alerts (FEFO Early Warning) */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-rose-950">Expiring Product Alerts (&lt;= 60 Hari)</h3>
            </div>
            <Link to="/admin/batches" className="text-xs font-bold text-rose-700 hover:underline">Batch FEFO</Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-200">
              <div>
                <span className="font-bold text-slate-800">Batch #KB-2026-04 (Cassava Original 100g)</span>
                <span className="block text-[11px] text-slate-500">Expired: 15 Des 2026 (Tersisa 24 Hari)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold">
                120 pcs Karantina FEFO
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-200">
              <div>
                <span className="font-bold text-slate-800">Batch #KB-2026-09 (Fudge Brownie Cookies)</span>
                <span className="block text-[11px] text-slate-500">Expired: 05 Jan 2027 (Tersisa 45 Hari)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                85 pcs Prioritas Keluar
              </span>
            </div>
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

          {/* Simple Visual Bar Chart simulation */}
          <div className="h-56 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-slate-100">
            {[
              { month: 'Jun', b2c: 40, b2b: 60 },
              { month: 'Jul', b2c: 55, b2b: 70 },
              { month: 'Agt', b2c: 50, b2b: 85 },
              { month: 'Sep', b2c: 65, b2b: 90 },
              { month: 'Okt', b2c: 75, b2b: 110 },
              { month: 'Nov', b2c: 85, b2b: 130 },
            ].map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full max-w-[2.5rem] flex items-end gap-1 h-full">
                  <div style={{ height: `${d.b2c}%` }} className="w-1/2 bg-kravo-dark rounded-t-md hover:opacity-80 transition-all" title={`B2C: ${d.b2c}jt`}></div>
                  <div style={{ height: `${d.b2b}%` }} className="w-1/2 bg-kravo-orange rounded-t-md hover:opacity-80 transition-all" title={`B2B: ${d.b2b}jt`}></div>
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
            {[
              { name: 'KRAVO Gourmet Truffle Cassava', sales: '1.240 pcs', rev: 'Rp 30.380.000', icon: '🥔' },
              { name: 'KRAVO Dark Fudge Brownie Cookies', sales: '980 pcs', rev: 'Rp 27.440.000', icon: '🍪' },
              { name: 'KRAVO Golden Cheddar Crackers', sales: '870 pcs', rev: 'Rp 19.140.000', icon: '🧀' },
              { name: 'KRAVO Spicy Ghost Pepper Crisps', sales: '760 pcs', rev: 'Rp 19.760.000', icon: '🌶️' },
            ].map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-slate-400 w-4">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base">{item.icon}</div>
                  <div>
                    <span className="font-bold text-slate-800 line-clamp-1">{item.name}</span>
                    <span className="text-[11px] text-slate-400">{item.sales} terjual</span>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900">{item.rev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs font-bold text-kravo-orange hover:underline">Lihat Semua Pesanan</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-3">Tipe</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Total Tagihan</th>
                <th className="py-3 px-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr>
                <td className="py-3.5 px-3 font-bold text-slate-900">ORD-202611-0089</td>
                <td className="py-3.5 px-3">Budi Santoso</td>
                <td className="py-3.5 px-3"><span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold">B2C Retail</span></td>
                <td className="py-3.5 px-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">Shipped</span></td>
                <td className="py-3.5 px-3 font-bold">Rp 83.000</td>
                <td className="py-3.5 px-3"><Link to="/admin/orders" className="text-kravo-orange hover:underline font-bold">Detail</Link></td>
              </tr>
              <tr>
                <td className="py-3.5 px-3 font-bold text-slate-900">ORD-202611-0088</td>
                <td className="py-3.5 px-3">CV Snack Barokah Mandiri</td>
                <td className="py-3.5 px-3"><span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">B2B Wholesale</span></td>
                <td className="py-3.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Paid</span></td>
                <td className="py-3.5 px-3 font-bold">Rp 5.400.000</td>
                <td className="py-3.5 px-3"><Link to="/admin/orders" className="text-kravo-orange hover:underline font-bold">Detail</Link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
