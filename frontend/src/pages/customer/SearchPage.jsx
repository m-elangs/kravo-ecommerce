import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Star, ShoppingBag, Heart, Loader2 } from 'lucide-react'
import { productApi } from '../../api/productApi'
import { useWishlist } from '../../contexts/WishlistContext'
import { getProductImageUrl } from '../../utils/imageUrl'

export default function SearchPage() {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [params] = useSearchParams()
  const initialQuery = params.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    productApi.getProducts({ search: query })
      .then(res => {
        if (res.success && res.data) {
          setProducts(res.data)
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="max-w-xl mx-auto space-y-4 text-center">
        <h1 className="text-3xl font-black text-kravo-dark">Pencarian Snack KRAVO</h1>
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari keripik, cookies, donat, rasa truffle, pedas..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-kravo-creamBorder text-sm focus:outline-none focus:border-kravo-orange shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="border-t border-kravo-creamBorder pt-8">
        <div className="text-xs font-bold text-slate-500 mb-6">
          Menampilkan hasil untuk kata kunci: <strong className="text-kravo-dark">"{query || 'Semua Snack'}"</strong> ({products.length} snack)
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
            <span className="text-xs">Mencari snack...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-kravo-creamBorder">
            <span className="text-5xl block mb-2">🔍</span>
            <h3 className="font-bold text-sm text-slate-800">Tidak ada snack yang cocok</h3>
            <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau lihat seluruh menu di halaman katalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {products.map(p => {
              const defaultVariant = p.variants?.[0]
              const price = defaultVariant ? defaultVariant.retail_price : 0
              const imgUrl = getProductImageUrl(p)

              return (
                <div key={p.id} className="bg-white p-5 rounded-2xl border border-kravo-creamBorder shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all">
                  <div>
                    <div className="h-40 w-full mb-3 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.style.display = 'none'
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300"
                        style={{ display: imgUrl ? 'none' : 'flex' }}
                      >
                        {p.category?.icon || '🍿'}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-kravo-orange uppercase tracking-wider mb-0.5">
                      {p.category?.name}
                    </div>
                    <h3 className="font-bold text-sm text-kravo-dark line-clamp-1 group-hover:text-kravo-orange transition-colors">
                      {p.name}
                    </h3>
                    <div className="text-base font-black text-kravo-dark mt-1">
                      Rp {Number(price).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/products/${p.slug}`}
                      className="flex-1 py-2 rounded-xl bg-kravo-dark text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-kravo-orange transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Detail
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(p)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isInWishlist(p.id)
                          ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                          : 'bg-white border-kravo-creamBorder text-slate-500 hover:text-rose-500 hover:border-rose-200'
                      }`}
                      title={isInWishlist(p.id) ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
                      aria-label={isInWishlist(p.id) ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(p.id) ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
