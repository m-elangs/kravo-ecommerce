import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Star, Search, ShoppingBag, Loader2 } from 'lucide-react'
import { productApi } from '../../api/productApi'
import { useCart } from '../../contexts/CartContext'

export default function CatalogPage() {
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState(initialCategory)
  const [search, setSearch] = useState('')
  const [addingId, setAddingId] = useState(null)
  
  const { addToCart } = useCart()

  useEffect(() => {
    productApi.getCategories()
      .then(res => {
        if (res.success) setCategories(res.data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (selectedCat !== 'all') params.category = selectedCat
    if (search) params.search = search

    productApi.getProducts(params)
      .then(res => {
        if (res.success) setProducts(res.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedCat, search])

  const handleQuickAdd = async (product) => {
    if (!product.variants || product.variants.length === 0) return
    const variantId = product.variants[0].id
    setAddingId(product.id)
    try {
      await addToCart(variantId, 1)
      alert(`Berhasil menambahkan ${product.name} ke keranjang!`)
    } catch (e) {
      alert('Gagal menambahkan ke keranjang.')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-kravo-creamBorder pb-6">
        <div>
          <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Katalog Resmi KRAVO</span>
          <h1 className="text-3xl font-black text-kravo-dark">Pilihan Snack Segar dari Oven</h1>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari rasa, keripik, cookies..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-kravo-creamBorder text-xs focus:outline-none focus:border-kravo-orange transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-kravo-creamBorder shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs text-kravo-dark uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-kravo-orange" /> Kategori Makanan
            </h3>
            <div className="space-y-1.5 text-xs font-semibold">
              <button
                onClick={() => setSelectedCat('all')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                  selectedCat === 'all' 
                    ? 'bg-kravo-dark text-white font-bold' 
                    : 'text-slate-600 hover:bg-kravo-cream'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.slug)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center justify-between ${
                    selectedCat === cat.slug 
                      ? 'bg-kravo-dark text-white font-bold' 
                      : 'text-slate-600 hover:bg-kravo-cream'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{cat.products_count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
              <span className="text-xs">Memuat katalog KRAVO...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-kravo-creamBorder text-center space-y-3">
              <div className="text-5xl">🥔</div>
              <h3 className="text-base font-bold text-slate-800">Tidak ada produk ditemukan</h3>
              <p className="text-xs text-slate-500">Coba kata kunci lain atau pilih kategori berbeda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => {
                const defaultVariant = p.variants?.[0]
                const retailPrice = defaultVariant ? defaultVariant.retail_price : 0
                const wholesaleTier = defaultVariant?.price_tiers?.[0]

                return (
                  <div 
                    key={p.id}
                    className="bg-white rounded-3xl p-5 border border-kravo-creamBorder shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="h-36 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                        {p.category?.icon || '🍿'}
                      </div>
                      <div className="text-[10px] font-bold text-kravo-orange uppercase tracking-wider mb-1">
                        {p.category?.name}
                      </div>
                      <h3 className="font-extrabold text-kravo-dark text-sm line-clamp-1 group-hover:text-kravo-orange transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.tagline || p.description}</p>
                    </div>

                    <div className="pt-4 border-t border-kravo-creamBorder/60 mt-4 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Retail</span>
                          <span className="text-base font-black text-kravo-dark">
                            Rp {Number(retailPrice).toLocaleString('id-ID')}
                          </span>
                        </div>
                        {wholesaleTier && (
                          <div className="text-right">
                            <span className="text-[10px] text-emerald-600 font-bold block">Grosir mulai</span>
                            <span className="text-xs font-bold text-emerald-700">
                              Rp {Number(wholesaleTier.unit_price).toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/products/${p.slug}`}
                          className="flex-1 py-2 px-3 rounded-xl bg-kravo-dark hover:bg-kravo-darkMuted text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          Detail
                        </Link>
                        <button
                          onClick={() => handleQuickAdd(p)}
                          disabled={addingId === p.id}
                          className="p-2 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold transition-colors shadow-sm"
                          title="Tambah ke Keranjang"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
