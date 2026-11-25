import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useWishlist } from '../../contexts/WishlistContext'
import { useCart } from '../../contexts/CartContext'

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [addingId, setAddingId] = useState(null)

  const handleAddToCart = async (item) => {
    if (!item.variantId) return
    setAddingId(item.id)
    try {
      const res = await addToCart(item.variantId, 1, item.variant)
      if (res && res.success !== false) {
        alert(`Berhasil menambahkan ${item.name} ke keranjang!`)
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Koleksi Favorit</span>
          <h1 className="text-2xl sm:text-3xl font-black text-kravo-dark">Wishlist Snack KRAVO</h1>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {items.length} produk tersimpan
        </span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-10 sm:p-14 rounded-3xl border border-kravo-creamBorder text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-kravo-dark">Wishlist Anda masih kosong</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tekan ikon hati pada produk snack favorit Anda di katalog untuk menyimpannya di sini.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold transition-colors shadow-sm"
          >
            Jelajahi Katalog Snack <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {items.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-3xl border border-kravo-creamBorder shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <Link to={p.slug ? `/products/${p.slug}` : '/products'} className="block h-40 w-full mb-3 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
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
                    className="w-full h-full flex items-center justify-center text-6xl"
                    style={{ display: p.imageUrl ? 'none' : 'flex' }}
                  >
                    {p.icon || '🍿'}
                  </div>
                </Link>

                <div className="text-[10px] font-bold text-kravo-orange uppercase tracking-wider mb-1">
                  {p.categoryName}
                </div>
                <Link to={p.slug ? `/products/${p.slug}` : '/products'}>
                  <h3 className="font-extrabold text-sm text-kravo-dark line-clamp-1 group-hover:text-kravo-orange transition-colors">
                    {p.name}
                  </h3>
                </Link>
                {p.tagline && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.tagline}</p>
                )}
                <div className="text-base font-black text-kravo-dark mt-2">
                  Rp {Number(p.price || 0).toLocaleString('id-ID')}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-kravo-creamBorder/60 flex gap-2">
                {p.variantId ? (
                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={addingId === p.id}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> {addingId === p.id ? 'Menambahkan...' : 'Keranjang'}
                  </button>
                ) : (
                  <Link
                    to={p.slug ? `/products/${p.slug}` : '/products'}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-kravo-dark hover:bg-kravo-darkMuted text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Lihat Detail
                  </Link>
                )}
                <button
                  onClick={() => removeFromWishlist(p.id)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                  title="Hapus dari Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
