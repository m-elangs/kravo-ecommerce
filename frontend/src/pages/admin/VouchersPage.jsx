import React from 'react'
import { Plus, Ticket, CheckCircle } from 'lucide-react'

export default function VouchersPage() {
  const vouchers = [
    { code: 'KRAVOFRESH', discount: 'Diskon 15%', minOrder: 'Rp 50.000', used: 124, quota: 500, status: 'Active' },
    { code: 'B2BPARTNER', discount: 'Potongan Rp 100.000', minOrder: 'Rp 2.000.000', used: 45, quota: 100, status: 'Active' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Kupon & Voucher Promosi</h1>
          <p className="text-xs text-slate-500">Kelola kode promo retail dan grosir.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" /> Buat Voucher Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vouchers.map(v => (
          <div key={v.code} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-black px-3 py-1 bg-kravo-dark text-kravo-orange rounded-xl">
                {v.code}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {v.status}
              </span>
            </div>
            <div className="text-sm">
              <div className="font-extrabold text-slate-900">{v.discount}</div>
              <div className="text-xs text-slate-500">Min. Belanja: {v.minOrder}</div>
            </div>
            <div className="text-xs text-slate-400">
              Terpakai {v.used} dari kuota {v.quota}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
