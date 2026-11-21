import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'

export default function WishlistPage() {
  const wishlist = [
    { id: 1, name: 'KRAVO Gourmet Truffle Cassava', price: 24500, icon: '🥔' },
    { id: 3, name: 'KRAVO Dark Fudge Brownie Cookies', price: 28000, icon: '🍪' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Koleksi Favorit</span>
        <h1 className="text-3xl font-black text-kravo-dark">Wishlist Snack KRAVO</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wishlist.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-kravo-creamBorder shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-32 flex items-center justify-center text-6xl">{p.icon}</div>
              <h3 className="font-bold text-sm text-kravo-dark line-clamp-1">{p.name}</h3>
              <div className="text-base font-black text-kravo-dark mt-1">Rp {p.price.toLocaleString('id-ID')}</div>
            </div>

            <div className="pt-4 flex gap-2">
              <button className="flex-1 py-2 px-3 rounded-xl bg-kravo-orange text-white text-xs font-bold hover:bg-kravo-orangeHover flex items-center justify-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" /> Beli
              </button>
              <button className="p-2 rounded-xl text-slate-400 hover:text-rose-500 border border-slate-200">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
