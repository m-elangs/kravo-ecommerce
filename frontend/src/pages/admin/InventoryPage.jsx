import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertTriangle, Boxes, ArrowUpDown } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

export default function InventoryPage() {
  const [inventory, setInventory]   = useState([])
  const [movements, setMovements]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('stock')
  const [lowOnly, setLowOnly]       = useState(false)

  const loadStock = async () => {
    setLoading(true)
    try {
      const { data } = await axiosClient.get('/admin/inventory', { params: { low_stock: lowOnly ? 1 : undefined } })
      setInventory(data.data || [])
    } catch { setInventory([]) } finally { setLoading(false) }
  }

  const loadMovements = async () => {
    setLoading(true)
    try {
      const { data } = await axiosClient.get('/admin/inventory/movements')
      setMovements(data.data || [])
    } catch { setMovements([]) } finally { setLoading(false) }
  }

  useEffect(() => { tab === 'stock' ? loadStock() : loadMovements() }, [tab, lowOnly])

  const TAB_CLS = (t) => `px-4 py-2 text-xs font-bold rounded-xl transition-colors ${tab === t ? 'bg-kravo-dark text-white' : 'text-slate-500 hover:bg-slate-100'}`

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Inventaris Gudang</h1>
          <p className="text-xs text-slate-500">Stok fisik, reserved, dan riwayat pergerakan.</p>
        </div>
        <button onClick={() => tab === 'stock' ? loadStock() : loadMovements()} className="p-2 text-slate-400 hover:text-kravo-orange rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <button className={TAB_CLS('stock')} onClick={() => setTab('stock')}>Stok Varian</button>
        <button className={TAB_CLS('movements')} onClick={() => setTab('movements')}>Riwayat Pergerakan</button>
        {tab === 'stock' && (
          <label className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} className="accent-kravo-orange" />
            Hanya Stok Rendah
          </label>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'stock' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Produk & Varian</th>
                <th className="py-3 px-4">Stok Tersedia</th>
                <th className="py-3 px-4">Stok Reserved</th>
                <th className="py-3 px-4">Reorder Point</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {inventory.map(i => (
                <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[11px]">{i.sku}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{i.product_name}</div>
                    <div className="text-slate-400 text-[10px]">{i.variant_name}</div>
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-700">{i.quantity_available} pcs</td>
                  <td className="py-3.5 px-4 font-bold text-amber-600">{i.quantity_reserved} pcs</td>
                  <td className="py-3.5 px-4 text-slate-500">{i.reorder_point} pcs</td>
                  <td className="py-3.5 px-4">
                    {i.is_low_stock ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Aman</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Referensi</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500">{m.created_at}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.product_name}<div className="text-slate-400 text-[10px]">{m.variant}</div></td>
                  <td className="py-3.5 px-4 font-mono text-[10px]">{m.batch_number}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {m.type === 'in' ? '▲ IN' : '▼ OUT'}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 font-black ${m.type === 'in' ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {m.type === 'in' ? '+' : '-'}{m.quantity}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{m.reference}</td>
                  <td className="py-3.5 px-4 text-slate-500">{m.notes ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
