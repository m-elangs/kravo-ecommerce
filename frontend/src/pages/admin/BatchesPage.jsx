import React from 'react'
import { Plus, ShieldCheck, AlertTriangle, Clock } from 'lucide-react'

export default function BatchesPage() {
  const batches = [
    { id: 1, batchNo: 'KB-2026-11', variant: 'Truffle Cassava 100g', mfd: '28 Okt 2026', exp: '28 Okt 2027', initialQty: 1000, currentQty: 540, fefoPriority: 2, status: 'Active (Fresh)' },
    { id: 2, batchNo: 'KB-2026-04', variant: 'Cassava Original 100g', mfd: '15 Des 2025', exp: '15 Des 2026', initialQty: 800, currentQty: 120, fefoPriority: 1, status: 'Near Expiry (24 Hari)' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Food Batch Tracking & FEFO Engine</h1>
          <p className="text-xs text-slate-500">Pelacakan tanggal produksi, kedaluwarsa, dan rotasi First Expired, First Out.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" /> Catat Batch Produksi Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Nomor Batch</th>
              <th className="py-3 px-4">Varian Snack</th>
              <th className="py-3 px-4">Tgl Manufaktur</th>
              <th className="py-3 px-4">Tgl Kedaluwarsa</th>
              <th className="py-3 px-4">Prioritas FEFO</th>
              <th className="py-3 px-4">Sisa Kuantitas</th>
              <th className="py-3 px-4">Status Keamanan Pangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {batches.map(b => (
              <tr key={b.id}>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.batchNo}</td>
                <td className="py-3.5 px-4 font-bold">{b.variant}</td>
                <td className="py-3.5 px-4 text-slate-600">{b.mfd}</td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900">{b.exp}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-black">Urutan #{b.fefoPriority}</span>
                </td>
                <td className="py-3.5 px-4 font-black">{b.currentQty} pcs</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    b.status.includes('Fresh') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
