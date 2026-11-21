import React from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function VariantsPage() {
  const variants = [
    { id: 1, product: 'KRAVO Gourmet Truffle Cassava', sku: 'KRV-CSV-TRF-100', name: '100g Pouch Reguler', weight: 100, price: 'Rp 24.500' },
    { id: 2, product: 'KRAVO Gourmet Truffle Cassava', sku: 'KRV-CSV-TRF-250', name: '250g Family Pack', weight: 250, price: 'Rp 55.000' },
    { id: 3, product: 'KRAVO Golden Cheddar Crackers', sku: 'KRV-CRK-CHD-100', name: '100g Pouch Reguler', weight: 100, price: 'Rp 22.000' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Varian Produk</h1>
          <p className="text-xs text-slate-500">SKU, ukuran kemasan, gramasi, dan rasa.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" /> Tambah Varian Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">SKU Code</th>
              <th className="py-3 px-4">Induk Produk</th>
              <th className="py-3 px-4">Nama Varian</th>
              <th className="py-3 px-4">Berat (Gram)</th>
              <th className="py-3 px-4">Harga Dasar Retail</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {variants.map(v => (
              <tr key={v.id}>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{v.sku}</td>
                <td className="py-3.5 px-4 text-slate-700">{v.product}</td>
                <td className="py-3.5 px-4 font-bold">{v.name}</td>
                <td className="py-3.5 px-4">{v.weight}g</td>
                <td className="py-3.5 px-4 font-extrabold text-kravo-dark">{v.price}</td>
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
