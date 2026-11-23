import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { productApi } from '../../api/productApi'
import { getProductImageUrl } from '../../utils/imageUrl'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productApi.getCategories()
      .then(res => {
        if (res.success && res.data) {
          setCategories(res.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Kategori Produk</span>
        <h1 className="text-3xl font-black text-kravo-dark">Koleksi Makanan Ringan KRAVO</h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs font-bold">Memuat kategori KRAVO...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => {
            const imgUrl = getProductImageUrl(c)
            return (
              <Link
                key={c.slug}
                to={`/products?category=${c.slug}`}
                className="bg-white rounded-3xl p-8 border border-kravo-creamBorder shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="h-28 w-28 mb-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.style.display = 'none'
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="text-5xl group-hover:scale-110 transition-transform"
                      style={{ display: imgUrl ? 'none' : 'flex' }}
                    >
                      {c.icon || '🥔'}
                    </div>
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-kravo-cream text-kravo-dark text-xs font-bold mb-2">
                    {c.products_count ?? 0} Produk Aktif
                  </div>
                  <h3 className="text-xl font-black text-kravo-dark group-hover:text-kravo-orange transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">
                    {c.description || 'Pilihan camilan lezat dan berkualitas persembahan KRAVO.'}
                  </p>
                </div>

                <div className="pt-6 flex items-center gap-2 text-sm font-bold text-kravo-orange">
                  Lihat Semua Produk <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
