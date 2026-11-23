import React, { useState, useEffect } from 'react'
import { RefreshCw, CreditCard, Search } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const STATUS_STYLES = {
  paid:    'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed:  'bg-rose-100 text-rose-800',
  expired: 'bg-slate-100 text-slate-500',
}

export default function PaymentsListPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [meta, setMeta]         = useState(null)
  const [page, setPage]         = useState(1)

  const load = async (s = search, st = status, p = page) => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/admin/payments', { params: { search: s, status: st || undefined, page: p } })
      setPayments(res.data || [])
      setMeta(res.meta || null)
    } catch { setPayments([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, status])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(search, status, 1) }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Data Pembayaran</h1>
          <p className="text-xs text-slate-500">Riwayat transaksi pembayaran dari Midtrans & metode lain.</p>
        </div>
        <button onClick={() => load()} className="p-2 text-slate-400 hover:text-kravo-orange rounded-xl"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
            <input type="text" placeholder="Cari no. order..." value={search} onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl flex-1" />
            <button type="submit" className="px-3 py-2 bg-kravo-dark text-white rounded-xl text-xs"><Search className="w-3.5 h-3.5" /></button>
          </form>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <option value="">Semua Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" /></div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400"><CreditCard className="w-10 h-10 mb-2" /><p className="text-sm">Belum ada pembayaran</p></div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">No. Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Midtrans ID</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dibayar</th>
                <th className="py-3 px-4">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[11px]">{p.order_number}</td>
                  <td className="py-3.5 px-4 text-slate-700">{p.customer_name}</td>
                  <td className="py-3.5 px-4 text-slate-500 uppercase">{p.method ?? '-'}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">{p.midtrans_id ?? '-'}</td>
                  <td className="py-3.5 px-4 font-bold text-kravo-orange">{fmt(p.amount)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[p.status] ?? 'bg-slate-100 text-slate-500'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{p.paid_at ?? '-'}</td>
                  <td className="py-3.5 px-4 text-slate-400">{p.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t text-xs text-slate-500">
            <span>Total {meta.total} transaksi</span>
            <div className="flex gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg font-bold ${page === p ? 'bg-kravo-orange text-white' : 'hover:bg-slate-100'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
