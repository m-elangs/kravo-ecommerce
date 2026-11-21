import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, ShieldCheck, ShoppingBag, Heart, Store, ArrowRight, Loader2, Check } from 'lucide-react'
import { productApi } from '../../api/productApi'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user, isApprovedReseller } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    setLoading(true)
    productApi.getProduct(slug)
      .then(res => {
        if (res.success && res.data) {
          setProduct(res.data)
          if (res.data.variants && res.data.variants.length > 0) {
            setSelectedVariant(res.data.variants[0])
            setQuantity(res.data.variants[0].minimum_order_quantity > 1 && isApprovedReseller ? res.data.variants[0].minimum_order_quantity : 1)
          }
        }
      })
      .catch(() => {
        // Fallback for sample links
      })
      .finally(() => setLoading(false))
  }, [slug, isApprovedReseller])

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant)
    if (isApprovedReseller && variant.minimum_order_quantity > 1) {
      setQuantity(Math.max(quantity, variant.minimum_order_quantity))
    }
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    setAdding(true)
    try {
      await addToCart(selectedVariant.id, quantity)
      alert(`Berhasil menambahkan ${quantity} pcs ${product.name} ke keranjang!`)
    } catch (e) {
      alert('Gagal menambahkan ke keranjang.')
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!selectedVariant) return
    await addToCart(selectedVariant.id, quantity)
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
        <span className="text-xs">Memuat detail snack KRAVO...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="text-5xl">🍪</div>
        <h2 className="text-xl font-bold text-slate-800">Produk Tidak Ditemukan</h2>
        <Link to="/products" className="inline-block px-6 py-2.5 rounded-xl bg-kravo-orange text-white text-xs font-bold">
          Kembali ke Katalog
        </Link>
      </div>
    )
  }

  const activeBatch = selectedVariant?.active_batches?.[0]
  const currentStock = selectedVariant?.inventory?.available_stock || 0
  const isOutOfStock = currentStock <= 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Product Main View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Showcase */}
        <div className="bg-white rounded-3xl p-12 border border-kravo-creamBorder flex flex-col items-center justify-center relative shadow-sm">
          <div className="text-9xl select-none py-12 animate-pulse">
            {product.category?.icon || '🥔'}
          </div>
          <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-kravo-orange text-white text-xs font-black uppercase">
            {product.category?.name}
          </div>

          {/* FEFO Batch Indicator */}
          <div className="w-full mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>FEFO Batch: {activeBatch ? `#${activeBatch.batch_number}` : 'Standar Fresh Batch'}</span>
            </div>
            <div className="text-slate-500 font-medium">
              Exp: {activeBatch ? activeBatch.expiry_date : '2027'} (Aman & Segar)
            </div>
          </div>
        </div>

        {/* Right: Info, Price, B2B Tier & Actions */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">
              {product.category?.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-kravo-dark mt-1">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{product.tagline}</p>
            
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                <Star className="w-4 h-4 fill-amber-500" /> 4.9
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500 font-semibold">Standar Pangan Halal & FEFO</span>
              <span className="text-slate-300">|</span>
              <span className={`text-xs font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isOutOfStock ? 'Stok Habis' : `Tersedia (${currentStock} pcs)`}
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-white p-6 rounded-2xl border border-kravo-creamBorder space-y-1">
            <div className="text-xs text-slate-400 font-semibold">Harga Satuan Retail Konsumen</div>
            <div className="text-3xl font-black text-kravo-dark">
              Rp {selectedVariant ? Number(selectedVariant.retail_price).toLocaleString('id-ID') : '0'} 
              <span className="text-sm font-normal text-slate-500"> / pack</span>
            </div>
          </div>

          {/* B2B Wholesale Tier Matrix Banner */}
          {selectedVariant?.price_tiers && selectedVariant.price_tiers.length > 0 && (
            <div className="bg-gradient-to-br from-kravo-dark to-kravo-darkMuted text-white p-6 rounded-2xl border border-kravo-darkMuted space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-kravo-orange font-bold text-xs uppercase tracking-wider">
                  <Store className="w-4 h-4" /> Harga Grosir B2B (Reseller & Distributor)
                </div>
                <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-kravo-cream/80">
                  MOQ {selectedVariant.minimum_order_quantity} pcs
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {selectedVariant.price_tiers.map((t, idx) => (
                  <div key={t.id} className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <div className="text-kravo-cream/70 text-[10px]">Tier {idx + 1} (&ge; {t.min_quantity} pcs)</div>
                    <div className="font-extrabold text-kravo-orange mt-1">
                      Rp {Number(t.unit_price).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variant Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-kravo-dark uppercase tracking-wider block">
              Pilih Ukuran / Varian Kemasan
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants?.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleVariantChange(v)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedVariant?.id === v.id 
                      ? 'bg-kravo-dark text-white shadow-md' 
                      : 'bg-white text-kravo-dark border border-kravo-creamBorder hover:border-kravo-orange'
                  }`}
                >
                  {v.name} ({v.weight_grams}g)
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-kravo-creamBorder rounded-xl bg-white overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-base font-bold hover:bg-slate-100"
                >-</button>
                <span className="px-4 py-2 text-sm font-bold min-w-[3rem] text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-base font-bold hover:bg-slate-100"
                >+</button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
                className="flex-1 py-3 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" /> {adding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 px-6 rounded-xl bg-kravo-dark hover:bg-kravo-darkMuted text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              Beli Sekarang via Checkout
            </button>
          </div>

          {/* Ingredients & Storage */}
          <div className="pt-4 border-t border-kravo-creamBorder/60 space-y-2 text-xs text-slate-600">
            <div><strong>Komposisi:</strong> {product.ingredients || 'Bahan alami pilihan tanpa pengawet.'}</div>
            <div><strong>Petunjuk Penyimpanan:</strong> {product.storage_instructions || 'Simpan di tempat kering dan sejuk.'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
