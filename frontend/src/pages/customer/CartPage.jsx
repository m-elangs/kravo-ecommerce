import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Store, ShieldAlert, UserCheck } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { getProductImageUrl } from '../../utils/imageUrl'

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    retailSubtotal,
    belowMoqItems,
    getItemPriceInfo,
    totalCount,
    loading,
  } = useCart()
  const { isApprovedReseller, isReseller, isAdmin, user, login } = useAuth()
  const [switching, setSwitching] = useState(false)

  // Check if any cart item exceeds available warehouse stock
  const insufficientItems = items.filter(item => {
    const avail = item.product_variant?.inventory ? Number(item.product_variant.inventory.available_stock) : 0
    return item.quantity > avail
  })
  const hasInsufficientStock = insufficientItems.length > 0
  const hasBelowMoq = belowMoqItems.length > 0
  const wholesaleSavings = Math.max(0, retailSubtotal - subtotal)

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
            const priceInfo = getItemPriceInfo(item)
            const unitPrice = priceInfo.unitPrice
            const retailPrice = priceInfo.retailPrice
            const moq = priceInfo.moq
            const isBelowMoq = isApprovedReseller && !priceInfo.meetsMoq
            const itemTotal = unitPrice * item.quantity
            const availStock = variant?.inventory ? Number(variant.inventory.available_stock) : 0
            const isExceeded = item.quantity > availStock
            const minQty = isApprovedReseller ? moq : 1

            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-2xl border shadow-sm transition-all space-y-3 ${
                  isExceeded || isBelowMoq ? 'border-rose-300 ring-2 ring-rose-100' : 'border-kravo-creamBorder'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                      {getProductImageUrl(product) ? (
                        <img
                          src={getProductImageUrl(product)}
                          alt={product?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.style.display = 'none'
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <span
                        className="text-3xl"
                        style={{ display: getProductImageUrl(product) ? 'none' : 'flex' }}
                      >
                        {product?.category?.icon || '🍿'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-kravo-dark text-sm sm:text-base line-clamp-1">{product?.name}</h3>
                      <span className="text-xs text-slate-500 block">{variant?.name} ({variant?.weight_grams}g)</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {priceInfo.isWholesale && retailPrice > unitPrice && (
                          <span className="text-[11px] text-slate-400 line-through">
                            Rp {retailPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                        <span className={`text-xs font-black ${priceInfo.isWholesale ? 'text-emerald-700' : 'text-kravo-orange'}`}>
                          Rp {unitPrice.toLocaleString('id-ID')}
                        </span>
                        {priceInfo.isWholesale && (
                          <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                            Grosir · MOQ {moq} pcs
                          </span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className={`text-[11px] font-bold ${
                          availStock <= 0 ? 'text-rose-600' : isExceeded ? 'text-rose-600' : 'text-emerald-700'
                        }`}>
                          Stok Tersedia: {availStock} pcs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold overflow-hidden shadow-sm focus-within:border-kravo-orange focus-within:ring-1 focus-within:ring-kravo-orange transition-all">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(minQty, (item.quantity || minQty) - 1))}
                        disabled={item.quantity <= minQty}
                        className="px-2.5 py-2 hover:bg-slate-200 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer text-slate-700 transition-colors select-none"
                        title={item.quantity <= minQty && isApprovedReseller ? `Minimal pembelian grosir ${moq} pcs` : 'Kurangi kuantitas'}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={minQty}
                        max={availStock > 0 ? availStock : undefined}
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                          if (!isNaN(val)) {
                            updateQuantity(item.id, Math.max(0, val))
                          }
                        }}
                        onBlur={() => {
                          if (!item.quantity || item.quantity < minQty) {
                            updateQuantity(item.id, minQty)
                          }
                        }}
                        className="w-12 text-center bg-transparent py-1.5 font-black text-slate-900 focus:outline-none focus:bg-white text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        title="Ketik angka langsung untuk mengubah kuantitas"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, (item.quantity || 0) + 1)}
                        disabled={item.quantity >= availStock}
                        className="px-2.5 py-2 hover:bg-slate-200 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer text-slate-700 transition-colors select-none"
                        title={item.quantity >= availStock ? 'Maksimal stok tercapai' : 'Tambah kuantitas'}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[5.5rem]">
                      <span className="font-black text-sm text-kravo-dark">
                        Rp {itemTotal.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-2 transition-colors cursor-pointer"
                      title="Hapus Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Warning message if stock is insufficient */}
                {isExceeded && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center justify-between">
                    <span>⚠️ Jumlah dipesan ({item.quantity} pcs) melebihi stok gudang ({availStock} pcs).</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, availStock))}
                      className="text-[11px] underline font-bold hover:text-rose-900 cursor-pointer"
                    >
                      Sesuaikan ke {availStock} pcs
                    </button>
                  </div>
                )}

                {/* Warning message if below wholesale MOQ (reseller) */}
                {isBelowMoq && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center justify-between gap-2">
                    <span>⚠️ Pembelian grosir minimal <strong>{moq} pcs</strong> (MOQ). Saat ini baru {item.quantity || 0} pcs.</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, moq)}
                      className="text-[11px] underline font-bold hover:text-amber-950 cursor-pointer whitespace-nowrap"
                    >
                      Sesuaikan ke {moq} pcs
                    </button>
                  </div>
                )}
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
            {isApprovedReseller && wholesaleSavings > 0 && (
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Total Harga Retail</span>
                <span className="line-through">Rp {retailSubtotal.toLocaleString('id-ID')}</span>
              </div>
            )}
            {isApprovedReseller && wholesaleSavings > 0 && (
              <div className="flex justify-between text-emerald-700 text-xs font-bold">
                <span>Hemat Harga Grosir B2B</span>
                <span>- Rp {wholesaleSavings.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Subtotal {isApprovedReseller ? 'Grosir' : 'Produk'} ({totalCount} pcs)</span>
              <span className="font-bold text-kravo-dark">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>Ongkir & Voucher</span>
              <span className="text-emerald-700 font-bold">Dihitung di Checkout</span>
            </div>
          </div>

          <div className="pt-4 border-t border-kravo-creamBorder flex justify-between items-baseline">
            <span className="font-bold text-base text-kravo-dark">Estimasi Subtotal</span>
            <span className="text-2xl font-black text-kravo-dark">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>

          {isAdmin ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Mode Administrator Terdeteksi</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Akun Admin ({user?.email}) bertugas untuk operasional sistem, bukan untuk melakukan pembelian belanja. Silakan beralih ke akun Pelanggan untuk checkout.
              </p>
              <button
                type="button"
                disabled={switching}
                onClick={async () => {
                  setSwitching(true)
                  try {
                    await login('customer@kravo.id', 'password123')
                    alert('Berhasil beralih ke akun Pelanggan (Budi Santoso)!')
                  } catch (err) {
                    alert('Gagal beralih akun: ' + (err.message || 'error'))
                  } finally {
                    setSwitching(false)
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <UserCheck className="w-4 h-4" />
                {switching ? 'Beralih Akun...' : 'Beralih ke Akun Pelanggan (Budi)'}
              </button>
            </div>
          ) : hasInsufficientStock ? (
            <div className="space-y-2">
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-6 rounded-xl bg-slate-300 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                Stok Tidak Mencukupi untuk Checkout
              </button>
              <p className="text-[11px] text-rose-600 font-semibold text-center">
                Beberapa snack di keranjang Anda melebihi jumlah stok yang tersedia di gudang. Silakan sesuaikan jumlah pesanan terlebih dahulu.
              </p>
            </div>
          ) : hasBelowMoq ? (
            <div className="space-y-2">
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-6 rounded-xl bg-slate-300 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                Belum Memenuhi MOQ Grosir
              </button>
              <p className="text-[11px] text-amber-700 font-semibold text-center">
                {belowMoqItems.length} snack belum mencapai Minimum Order Quantity (MOQ). Klik "Sesuaikan ke MOQ" pada item terkait untuk melanjutkan checkout.
              </p>
            </div>
          ) : (
            <Link
              to="/checkout"
              className="w-full py-3.5 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all cursor-pointer"
            >
              Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
