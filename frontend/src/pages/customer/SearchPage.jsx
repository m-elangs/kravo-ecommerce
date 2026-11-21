import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Star, ShoppingBag } from 'lucide-react'

export default function SearchPage() {
  const [params] = useSearchParams()
  const initialQuery = params.get('q') || ''
  const [query, setQuery] = useState(initialQuery)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="max-w-xl mx-auto space-y-4 text-center">
        <h1 className="text-3xl font-black text-kravo-dark">Pencarian Snack KRAVO</h1>
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari keripik, cookies, rasa truffle, pedas..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-kravo-creamBorder text-sm focus:outline-none focus:border-kravo-orange shadow-sm"
          />
        </div>
      </div>

      <div className="border-t border-kravo-creamBorder pt-8">
        <div className="text-xs font-bold text-slate-500 mb-6">
          Menampilkan hasil untuk kata kunci: <strong className="text-kravo-dark">"{query || 'Semua Snack'}"</strong>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { id: 1, name: 'KRAVO Gourmet Truffle Cassava', price: 24500, rating: 4.9, icon: '🥔' },
            { id: 4, name: 'KRAVO Spicy Ghost Pepper Crisps', price: 26000, rating: 4.9, icon: '🌶️' },
          ].map(p => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-kravo-creamBorder shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-32 flex items-center justify-center text-6xl">{p.icon}</div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold my-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {p.rating}
                </div>
                <h3 className="font-bold text-sm text-kravo-dark">{p.name}</h3>
                <div className="text-base font-black text-kravo-dark mt-1">Rp {p.price.toLocaleString('id-ID')}</div>
              </div>
              <Link to={`/products/item-${p.id}`} className="mt-4 w-full py-2 rounded-xl bg-kravo-dark text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-kravo-orange transition-colors">
                <ShoppingBag className="w-3.5 h-3.5" /> Detail
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
