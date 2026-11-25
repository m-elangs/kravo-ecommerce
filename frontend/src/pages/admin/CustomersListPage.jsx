import React, { useState, useEffect } from 'react'
import { RefreshCw, Users, Search } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function CustomersListPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [meta, setMeta]           = useState(null)
  const [page, setPage]           = useState(1)

  const load = async (s = search, p = page) => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/admin/customers', { params: { search: s, page: p } })
      setCustomers(res.data || [])
      setMeta(res.meta || null)
    } catch { setCustomers([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(search, 1) }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Data Pelanggan (B2C)</h1>
          <p className="text-xs text-slate-500">Semua customer retail KRAVO yang terdaftar.</p>
        </div>
        <button onClick={() => load()} className="p-2 text-slate-400 hover:text-kravo-orange rounded-xl"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {meta && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-1">Total Customer Terdaftar</p>
            <p className="text-3xl font-black text-slate-900">{meta.total}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
            <input type="text" placeholder="Cari nama / email..." value={search} onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl flex-1" />
            <button type="submit" className="px-3 py-2 bg-kravo-dark text-white rounded-xl text-xs"><Search className="w-3.5 h-3.5" /></button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" /></div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400"><Users className="w-10 h-10 mb-2" /><p className="text-sm">Belum ada pelanggan</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">No. HP</th>
                  <th className="py-3 px-4">Total Order</th>
                  <th className="py-3 px-4">Total Belanja</th>
                  <th className="py-3 px-4">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{c.email}</td>
                    <td className="py-3.5 px-4 text-slate-500">{c.phone ?? '-'}</td>
                    <td className="py-3.5 px-4 font-bold">{c.orders_count} order</td>
                    <td className="py-3.5 px-4 font-bold text-kravo-orange">{fmt(c.total_spent)}</td>
                    <td className="py-3.5 px-4 text-slate-400">{c.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t text-xs text-slate-500">
            <span>Total {meta.total} pelanggan</span>
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
