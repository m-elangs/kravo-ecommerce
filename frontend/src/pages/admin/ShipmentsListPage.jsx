import React, { useState, useEffect } from 'react'
import { RefreshCw, Truck, Search } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

const STATUS_STYLES = {
  pending_packing: 'bg-amber-100 text-amber-800',
  packed:          'bg-indigo-100 text-indigo-800',
  picked_up:       'bg-purple-100 text-purple-800',
  in_transit:      'bg-blue-100 text-blue-800',
  delivered:       'bg-emerald-100 text-emerald-800',
}

const STATUS_LABELS = {
  pending_packing: 'Menunggu Packing',
  packed:          'Telah Dipacking',
  picked_up:       'Kurir Menjemput',
  in_transit:      'Dalam Perjalanan',
  delivered:       'Telah Diterima',
}

export default function ShipmentsListPage() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [status, setStatus]       = useState('')
  const [meta, setMeta]           = useState(null)
  const [page, setPage]           = useState(1)

  const load = async (s = search, st = status, p = page) => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/admin/shipments', { params: { search: s, status: st || undefined, page: p } })
      setShipments(res.data || [])
      setMeta(res.meta || null)
    } catch { setShipments([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, status])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(search, status, 1) }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Data Logistik Pengiriman</h1>
          <p className="text-xs text-slate-500">Lacak status ekspedisi pengiriman seluruh pesanan snack KRAVO.</p>
        </div>
        <button onClick={() => load()} className="p-2 text-slate-400 hover:text-kravo-orange rounded-xl"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
            <input type="text" placeholder="Cari no. resi / no. order..." value={search} onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-kravo-orange/30" />
            <button type="submit" className="px-3 py-2 bg-kravo-dark text-white rounded-xl text-xs font-bold"><Search className="w-3.5 h-3.5" /></button>
          </form>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold">
            <option value="">Semua Status Pengiriman</option>
            <option value="pending_packing">Menunggu Packing Dapur</option>
            <option value="packed">Telah Dipacking</option>
            <option value="picked_up">Kurir Menjemput</option>
            <option value="in_transit">Dalam Pengiriman (In Transit)</option>
            <option value="delivered">Tiba di Tujuan (Delivered)</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" /></div>
        ) : shipments.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400"><Truck className="w-10 h-10 mb-2" /><p className="text-sm">Belum ada data pengiriman</p></div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">No. Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Kurir Ekspedisi</th>
                <th className="py-3 px-4">No. Resi Kurir</th>
                <th className="py-3 px-4">Status Pengiriman</th>
                <th className="py-3 px-4">Waktu Dikirim</th>
                <th className="py-3 px-4">Waktu Tiba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {shipments.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[11px]">{s.order_number}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-bold">{s.customer_name}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{s.courier}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    {s.tracking_number || <span className="text-slate-400 font-normal italic">Belum Input Resi</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLES[s.status] ?? 'bg-slate-100 text-slate-500'}`}>
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{s.shipped_at ?? '—'}</td>
                  <td className="py-3.5 px-4 text-slate-500">{s.delivered_at ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t text-xs text-slate-500">
            <span>Total {meta.total} pengiriman</span>
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
