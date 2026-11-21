import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Star, Search, ShoppingBag, SlidersHorizontal } from 'lucide-react'

const catalogItems = [
  { id: 1, name: 'KRAVO Gourmet Truffle Cassava', cat: 'cassava', price: 24500, wholesale: 18000, rating: 4.9, icon: '🥔' },
  { id: 2, name: 'KRAVO Golden Cheddar Crackers', cat: 'crackers', price: 22000, wholesale: 16500, rating: 4.8, icon: '🧀' },
  { id: 3, name: 'KRAVO Dark Fudge Brownie Cookies', cat: 'cookies', price: 28000, wholesale: 21000, rating: 5.0, icon: '🍪' },
  { id: 4, name: 'KRAVO Spicy Ghost Pepper Crisps', cat: 'potato', price: 26000, wholesale: 19500, rating: 4.9, icon: '🌶️' },
  { id: 5, name: 'KRAVO BBQ Smokehouse Potato Crisps', cat: 'potato', price: 25000, wholesale: 19000, rating: 4.7, icon: '🍖' },
  { id: 6, name: 'KRAVO Matcha White Choc Cookies', cat: 'cookies', price: 29000, wholesale: 22000, rating: 4.8, icon: '🍵' },
  { id: 7, name: 'KRAVO Sea Salt Party Bundle (5 Packs)', cat: 'bundles', price: 110000, wholesale: 85000, rating: 5.0, icon: '🎁' },
  { id: 8, name: 'KRAVO Spicy Mania Bundle (5 Packs)', cat: 'bundles', price: 115000, wholesale: 89000, rating: 4.9, icon: '🔥' },
]

export default function CatalogPage() {
  const [selectedCat, setSelectedCat] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = catalogItems.filter(p => {
    const matchesCat = selectedCat === 'all' || p.cat === selectedCat
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-kravo-creamBorder pb-6">
        <div>
          <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Katalog Lengkap</span>
          <h1 className="text-3xl font-black text-kravo-dark">Pilihan Snack KRAVO</h1>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari rasa, keripik, cookies..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-kravo-creamBorder text-sm focus:outline-none focus:border-kravo-orange transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-kravo-creamBorder shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-kravo-dark uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-kravo-orange" /> Filter Kategori
            </h3>
            <div className="space-y-2 text-sm font-medium">
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'potato', label: 'Potato Chips' },
                { id: 'cassava', label: 'Cassava Chips' },
                { id: 'cookies', label: 'Chocolate Cookies' },
                { id: 'crackers', label: 'Cheese Crackers' },
                { id: 'bundles', label: 'Snack Bundles' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                    selectedCat === cat.id 
                      ? 'bg-kravo-dark text-white font-bold' 
                      : 'text-slate-600 hover:bg-kravo-cream'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <div 
                key={p.id}
                className="bg-white rounded-2xl p-5 border border-kravo-creamBorder shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 flex items-center justify-center text-6xl">
                    {p.icon}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {p.rating}
                  </div>
                  <h3 className="font-bold text-kravo-dark text-sm line-clamp-1">{p.name}</h3>
                </div>

                <div className="pt-4 border-t border-kravo-creamBorder/60 mt-3 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Retail</span>
                      <span className="text-base font-black text-kravo-dark">Rp {p.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 font-bold block">B2B Tier</span>
                      <span className="text-xs font-bold text-emerald-700">Rp {p.wholesale.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <Link
                    to={`/products/item-${p.id}`}
                    className="w-full py-2 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Beli / Grosir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
