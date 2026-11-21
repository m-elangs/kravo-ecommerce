import React from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Store } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, totalCount, loading } = useCart()
  const { isApprovedReseller } = useAuth()

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-kravo-dark">Keranjang Belanja Masih Kosong</h2>
        <p className="text-xs text-slate-500">Pilih snack favorit Anda dari katalog untuk memulai pemesanan.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kravo-orange text-white text-xs font-bold hover:bg-kravo-orangeHover transition-colors shadow-md"
        >
          Jelajahi Katalog Snack <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Keranjang Belanja</span>
          <h1 className="text-3xl font-black text-kravo-dark">Pesanan Snack KRAVO ({totalCount} item)</h1>
        </div>
        {isApprovedReseller && (
          <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
            <Store className="w-4 h-4" /> Mode Harga Grosir B2B Aktif
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const variant = item.product_variant
            const product = variant?.product
            const unitPrice = variant ? Number(variant.retail_price) : 0
            const itemTotal = unitPrice * item.quantity

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-kravo-creamBorder shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-kravo-cream flex items-center justify-center text-3xl flex-shrink-0">
                    {product?.category?.icon || '🍿'}
                  </div>
                  <div>
                    <h3 className="font-bold text-kravo-dark text-sm sm:text-base line-clamp-1">{product?.name}</h3>
                    <span className="text-xs text-slate-500 block">{variant?.name} ({variant?.weight_grams}g)</span>
                    <span className="text-xs font-black text-kravo-orange mt-1 block">
                      Rp {unitPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-kravo-creamBorder rounded-lg bg-slate-50 text-xs font-bold">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-slate-200"
                    >-</button>
                    <span className="px-3 py-1.5 min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-slate-200"
                    >+</button>
                  </div>

                  <div className="text-right min-w-[5.5rem]">
                    <span className="font-black text-sm text-kravo-dark">
                      Rp {itemTotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-2 transition-colors"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Alokasi stok otomatis menerapkan algoritma <strong>FEFO (First Expired, First Out)</strong> saat checkout untuk menjamin batch snack selalu segar dari oven.</span>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-6">
          <h3 className="font-extrabold text-lg text-kravo-dark">Ringkasan Belanja</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Produk ({totalCount} pcs)</span>
              <span className="font-bold text-kravo-dark">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>Perhitungan Grosir & Diskon</span>
              <span className="text-emerald-700 font-bold">Dihitung di Checkout</span>
            </div>
          </div>

          <div className="pt-4 border-t border-kravo-creamBorder flex justify-between items-baseline">
            <span className="font-bold text-base text-kravo-dark">Estimasi Subtotal</span>
            <span className="text-2xl font-black text-kravo-dark">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>

          <Link
            to="/checkout"
            className="w-full py-3.5 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all"
          >
            Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
