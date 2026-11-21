import React from 'react'
import { Eye, Printer, Filter } from 'lucide-react'

export default function OrdersListPage() {
  const orders = [
    { id: 'ORD-202611-0089', customer: 'Budi Santoso', type: 'B2C Retail', total: 'Rp 83.000', status: 'Shipped', date: '21 Nov 2026' },
    { id: 'ORD-202611-0088', customer: 'CV Snack Barokah', type: 'B2B Wholesale', total: 'Rp 5.400.000', status: 'Paid', date: '21 Nov 2026' },
    { id: 'ORD-202611-0087', customer: 'Rina Kusuma', type: 'B2C Retail', total: 'Rp 145.000', status: 'Processing', date: '20 Nov 2026' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Pesanan Masuk</h1>
          <p className="text-xs text-slate-500">Semua pesanan B2C retail dan B2B wholesale.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Nama Pemesan</th>
              <th className="py-3 px-4">Segmen</th>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Total Biaya</th>
              <th className="py-3 px-4">Status Pesanan</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {orders.map(o => (
              <tr key={o.id}>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.id}</td>
                <td className="py-3.5 px-4 font-bold">{o.customer}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    o.type.includes('B2B') ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                  }`}>{o.type}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">{o.date}</td>
                <td className="py-3.5 px-4 font-black">{o.total}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {o.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button className="text-slate-500 hover:text-kravo-orange p-1"><Eye className="w-4 h-4 inline" /></button>
                  <button className="text-slate-500 hover:text-slate-800 p-1"><Printer className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
