import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, RefreshCw, Package, AlertTriangle } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function ProductsListPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState(null)

  const load = async (s = search, p = page) => {
    setLoading(true)
    try {
      const { data } = await axiosClient.get('/admin/products', { params: { search: s, page: p, per_page: 20 } })
      setProducts(data.data || [])
      setMeta(data.meta || null)
    } catch { setProducts([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(search, 1) }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Master Data Produk</h1>
          <p className="text-xs text-slate-500">Katalog utama makanan ringan KRAVO.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" /> Tambah Produk Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Cari produk snack..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl flex-1"
            />
            <button type="submit" className="px-3 py-2 bg-kravo-dark text-white rounded-xl text-xs"><Search className="w-3.5 h-3.5" /></button>
          </form>
          <button onClick={() => load()} className="p-2 text-slate-400 hover:text-kravo-orange rounded-lg"><RefreshCw className="w-4 h-4" /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Package className="w-10 h-10 mb-2" />
            <p className="text-sm font-medium">Belum ada produk</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Varian</th>
                <th className="py-3 px-4">Harga Retail</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{p.category?.name ?? '-'}</td>
                  <td className="py-3.5 px-4">{p.variants_count ?? '—'} varian</td>
                  <td className="py-3.5 px-4 font-bold">{p.base_price ? fmt(p.base_price) : '—'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`font-black ${(p.total_stock ?? 999) < 50 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {p.total_stock ?? '—'} pcs
                    </span>
                    {(p.total_stock ?? 999) < 50 && <AlertTriangle className="w-3 h-3 text-amber-500 inline ml-1" />}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>{p.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button className="text-slate-400 hover:text-kravo-orange transition-colors"><Edit className="w-3.5 h-3.5 inline" /></button>
                    <button className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Total {meta.total} produk</span>
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
