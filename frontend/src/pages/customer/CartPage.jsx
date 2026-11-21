import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ArrowRight, ShoppingBag, Tag, ShieldCheck } from 'lucide-react'

export default function CartPage() {
  const [items, setItems] = useState([
    { id: 1, name: 'KRAVO Gourmet Truffle Cassava', variant: '100g (Pouch)', price: 24500, qty: 2, icon: '🥔' },
    { id: 2, name: 'KRAVO Golden Cheddar Crackers', variant: '100g (Pouch)', price: 22000, qty: 1, icon: '🧀' },
  ])

  const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Pesanan Anda</span>
        <h1 className="text-3xl font-black text-kravo-dark">Keranjang Belanja</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-kravo-creamBorder shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-kravo-cream flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-kravo-dark text-sm sm:text-base">{item.name}</h3>
                  <span className="text-xs text-slate-500 block">{item.variant}</span>
                  <span className="text-xs font-black text-kravo-orange mt-1 block">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-kravo-creamBorder rounded-lg bg-slate-50 text-xs font-bold">
                  <button className="px-2.5 py-1.5 hover:bg-slate-200">-</button>
                  <span className="px-3 py-1.5">{item.qty}</span>
                  <button className="px-2.5 py-1.5 hover:bg-slate-200">+</button>
                </div>

                <div className="text-right min-w-[5rem]">
                  <span className="font-black text-sm text-kravo-dark">
                    Rp {(item.price * item.qty).toLocaleString('id-ID')}
                  </span>
                </div>

                <button className="text-slate-400 hover:text-rose-500 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-6">
          <h3 className="font-extrabold text-lg text-kravo-dark">Ringkasan Belanja</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Produk</span>
              <span className="font-bold text-kravo-dark">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimasi Berat</span>
              <span>300 gram</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Diskon Voucher</span>
              <span>- Rp 0</span>
            </div>
          </div>

          <div className="pt-4 border-t border-kravo-creamBorder flex justify-between items-baseline">
            <span className="font-bold text-base text-kravo-dark">Total Pembayaran</span>
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
