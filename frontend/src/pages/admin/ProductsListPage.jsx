import React from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'

export default function ProductsListPage() {
  const products = [
    { id: 1, name: 'KRAVO Gourmet Truffle Cassava', cat: 'Cassava Chips', variants: 3, retailPrice: 'Rp 24.500', stock: 540, status: 'Active' },
    { id: 2, name: 'KRAVO Golden Cheddar Crackers', cat: 'Cheese Crackers', variants: 2, retailPrice: 'Rp 22.000', stock: 320, status: 'Active' },
    { id: 3, name: 'KRAVO Dark Fudge Brownie Cookies', cat: 'Chocolate Cookies', variants: 2, retailPrice: 'Rp 28.000', stock: 210, status: 'Active' },
    { id: 4, name: 'KRAVO Spicy Ghost Pepper Crisps', cat: 'Potato Chips', variants: 3, retailPrice: 'Rp 26.000', stock: 18, status: 'Low Stock' },
  ]

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
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <input type="text" placeholder="Cari produk snack..." className="px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl flex-1 max-w-sm" />
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Nama Produk</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Varian</th>
              <th className="py-3 px-4">Harga Dasar Retail</th>
              <th className="py-3 px-4">Total Stok</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {products.map(p => (
              <tr key={p.id}>
                <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                <td className="py-3.5 px-4 text-slate-600">{p.cat}</td>
                <td className="py-3.5 px-4">{p.variants} varian</td>
                <td className="py-3.5 px-4 font-bold">{p.retailPrice}</td>
                <td className="py-3.5 px-4 font-black">{p.stock} pcs</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>{p.status}</span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button className="text-slate-500 hover:text-kravo-orange"><Edit className="w-3.5 h-3.5 inline" /></button>
                  <button className="text-slate-500 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
