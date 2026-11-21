import React from 'react'
import { Download, BarChart2, TrendingUp } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Laporan Keuangan & Mutasi Stok</h1>
          <p className="text-xs text-slate-500">Download rekapitulasi data akuntansi dan audit inventaris makanan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Laporan Penjualan B2C & B2B</h3>
            <p className="text-xs text-slate-500 mt-1">Rekap invoice, revenue bruto, diskon kupon, dan laba kotor.</p>
          </div>
          <button className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Excel / CSV
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Laporan Audit Mutasi Stok FEFO</h3>
            <p className="text-xs text-slate-500 mt-1">Jejak pergerakan batch, produksi masuk, teralokasi, dan sisa.</p>
          </div>
          <button className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Excel / CSV
          </button>
        </div>
      </div>
    </div>
  )
}
