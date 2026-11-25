import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Star, Search, ShoppingBag, Heart, Loader2 } from 'lucide-react'
import { productApi } from '../../api/productApi'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useAuth } from '../../contexts/AuthContext'
import { getProductImageUrl } from '../../utils/imageUrl'

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
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isReseller } = useAuth()

  useEffect(() => {
    productApi.getCategories()
      .then(res => {
        if (res.success) setCategories(res.data)
      })
      .catch(() => { })
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
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [selectedCat, search])

  const handleQuickAdd = async (product) => {
    if (!product.variants || product.variants.length === 0) return
    const variant = product.variants[0]
    setAddingId(product.id)
    try {
      const res = await addToCart(variant.id, 1, variant)
      if (res && res.success !== false) {
        alert(`Berhasil menambahkan ${res.addedQuantity || 1} pcs ${product.name} (${variant.name}) ke keranjang!`)
      } else {
        alert(res?.message || 'Gagal menambahkan ke keranjang.')
      }
    } catch (e) {
      alert(e?.message || 'Gagal menambahkan ke keranjang.')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Filter */}
        <aside className="lg:col-span-3 xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-kravo-creamBorder shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs text-kravo-dark uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-kravo-orange" /> Kategori Makanan
            </h3>
            <div className="space-y-1.5 text-xs font-semibold">
              <button
                onClick={() => setSelectedCat('all')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${selectedCat === 'all'
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
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center justify-between ${selectedCat === cat.slug
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
        <div className="lg:col-span-9 xl:col-span-10">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {products.map(p => {
                const defaultVariant = p.variants?.[0]
                const retailPrice = defaultVariant ? defaultVariant.retail_price : 0
                const wholesaleTier = defaultVariant?.price_tiers?.[0]
                const variantStock = defaultVariant?.inventory ? Number(defaultVariant.inventory.available_stock) : 0
                const totalStock = p.variants?.reduce((sum, v) => sum + (v.inventory ? Number(v.inventory.available_stock) : 0), 0) ?? 0
                const isOutOfStock = totalStock <= 0
                const moq = defaultVariant?.minimum_order_quantity || 1

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl p-5 border border-kravo-creamBorder shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative"
                  >
                    <div>
                      <div className="h-44 w-full mb-3 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
                        {/* Real-time Stock Badge */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-black tracking-wide shadow-md flex items-center gap-1">
                              Stok Habis
                            </span>
                          ) : totalStock <= 20 ? (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white text-[10px] font-black tracking-wide shadow-md flex items-center gap-1">
                              Sisa {totalStock} pcs
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-black tracking-wide shadow-md flex items-center gap-1">
                              Stok: {totalStock} pcs
                            </span>
                          )}
                        </div>

                        {getProductImageUrl(p) ? (
                          <img
                            src={getProductImageUrl(p)}
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
                          className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform"
                          style={{ display: getProductImageUrl(p) ? 'none' : 'flex' }}
                        >
                          {p.category?.icon || '🍿'}
                        </div>
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
                        {isReseller && wholesaleTier && (
                          <div className="text-right">
                            <span className="text-[10px] text-emerald-600 font-bold block">Grosir mulai</span>
                            <span className="text-xs font-bold text-emerald-700">
                              Rp {Number(wholesaleTier.unit_price).toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Reseller B2B Stock & MOQ Snapshot */}
                      {isReseller && (
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between text-slate-600">
                          <span>MOQ: <strong className="text-slate-900">{moq} pcs</strong></span>
                          <span>Stok Gudang: <strong className={isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}>{totalStock} pcs</strong></span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link
                          to={`/products/${p.slug}`}
                          className="flex-1 py-2 px-3 rounded-xl bg-kravo-dark hover:bg-kravo-darkMuted text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          Detail
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(p)}
                          className={`p-2 rounded-xl border transition-all shadow-sm cursor-pointer ${
                            isInWishlist(p.id)
                              ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                              : 'bg-white border-kravo-creamBorder text-slate-500 hover:text-rose-500 hover:border-rose-200'
                          }`}
                          title={isInWishlist(p.id) ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
                          aria-label={isInWishlist(p.id) ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist(p.id) ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleQuickAdd(p)}
                          disabled={addingId === p.id || isOutOfStock}
                          className={`p-2 rounded-xl text-xs font-bold transition-colors shadow-sm ${
                            isOutOfStock
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-kravo-orange hover:bg-kravo-orangeHover text-white cursor-pointer'
                          }`}
                          title={isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
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
