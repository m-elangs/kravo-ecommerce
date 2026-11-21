import React from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight, Clock, CheckCircle } from 'lucide-react'

export default function MyOrdersPage() {
  const orders = [
    { id: 'ORD-202611-0089', date: '21 Nov 2026', items: 3, total: 83000, status: 'Shipped', statusLabel: 'Dalam Pengiriman' },
    { id: 'ORD-202610-0045', date: '18 Okt 2026', items: 5, total: 135000, status: 'Delivered', statusLabel: 'Pesanan Selesai' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Riwayat Transaksi</span>
        <h1 className="text-3xl font-black text-kravo-dark">Pesanan Saya</h1>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-kravo-orange">{o.id}</span>
                <span className="text-xs text-slate-400 ml-3">{o.date}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                o.status === 'Shipped' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {o.statusLabel}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total ({o.items} item snack):</span>
                <span className="text-lg font-black text-kravo-dark">Rp {o.total.toLocaleString('id-ID')}</span>
              </div>

              <Link
                to={`/order-tracking/${o.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold transition-colors"
              >
                Lihat Detail & Lacak <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
