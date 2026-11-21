import React from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const categories = [
    { id: 1, name: 'Potato Chips', slug: 'potato-chips', count: 6, icon: '🥔' },
    { id: 2, name: 'Cassava Chips', slug: 'cassava-chips', count: 4, icon: '🍠' },
    { id: 3, name: 'Chocolate Cookies', slug: 'chocolate-cookies', count: 5, icon: '🍪' },
    { id: 4, name: 'Cheese Crackers', slug: 'cheese-crackers', count: 4, icon: '🧀' },
    { id: 5, name: 'Spicy Snacks', slug: 'spicy-snacks', count: 6, icon: '🌶️' },
    { id: 6, name: 'Snack Bundles', slug: 'snack-bundles', count: 8, icon: '🎁' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Kategori Snack</h1>
          <p className="text-xs text-slate-500">Kelompok kategori makanan ringan KRAVO.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{c.icon}</span>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{c.name}</h3>
                <span className="text-xs text-slate-400">{c.count} Produk Aktif</span>
              </div>
            </div>
            <div className="space-x-1">
              <button className="p-2 text-slate-400 hover:text-kravo-orange"><Edit className="w-4 h-4" /></button>
              <button className="p-2 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
