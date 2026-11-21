import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, ShieldCheck, ShoppingBag, Heart, Store, Calendar, ArrowRight, Check } from 'lucide-react'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [selectedVariant, setSelectedVariant] = useState('100g')
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Product Main View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Image Showcase */}
        <div className="bg-white rounded-3xl p-12 border border-kravo-creamBorder flex flex-col items-center justify-center relative shadow-sm">
          <div className="text-9xl select-none py-12">
            🥔
          </div>
          <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-kravo-orange text-white text-xs font-black uppercase">
            Signature Gourmet
          </div>
          <div className="absolute top-6 right-6 p-3 rounded-full bg-kravo-cream hover:bg-kravo-orange hover:text-white transition-colors cursor-pointer">
            <Heart className="w-5 h-5" />
          </div>

          {/* FEFO Batch Indicator */}
          <div className="w-full mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Batch Produksi: #KB-2026-11</span>
            </div>
            <div className="text-slate-500 font-medium">
              Exp: 28 Oktober 2027 (Fresh)
            </div>
          </div>
        </div>

        {/* Right: Info, Price, B2B Tier & Actions */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Keripik & Chips</span>
            <h1 className="text-3xl sm:text-4xl font-black text-kravo-dark mt-1">
              KRAVO Gourmet Truffle Cassava 
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                <Star className="w-4 h-4 fill-amber-500" /> 4.9
              </div>
              <span className="text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-semibold">142 Ulasan Pelanggan</span>
              <span className="text-slate-400">|</span>
              <span className="text-xs text-emerald-600 font-bold">Stok Tersedia (540 pcs)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-white p-6 rounded-2xl border border-kravo-creamBorder space-y-2">
            <div className="text-xs text-slate-400 font-semibold">Harga Retail Konsumen</div>
            <div className="text-3xl font-black text-kravo-dark">Rp 24.500 <span className="text-sm font-normal text-slate-500">/ pack</span></div>
          </div>

          {/* B2B Wholesale Tier Matrix Banner */}
          <div className="bg-gradient-to-br from-kravo-dark to-kravo-darkMuted text-white p-6 rounded-2xl border border-kravo-darkMuted space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-kravo-orange font-bold text-xs uppercase tracking-wider">
                <Store className="w-4 h-4" /> Harga Grosir B2B (Reseller & Distributor)
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-kravo-cream/80">MOQ 50 pcs</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl">
                <div className="text-kravo-cream/70 text-[10px]">Tier 1 (50-199 pcs)</div>
                <div className="font-extrabold text-white mt-1">Rp 18.000</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-kravo-orange/40">
                <div className="text-kravo-cream/70 text-[10px]">Tier 2 (200-499 pcs)</div>
                <div className="font-extrabold text-kravo-orange mt-1">Rp 16.500</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl">
                <div className="text-kravo-cream/70 text-[10px]">Tier 3 (&gt;= 500 pcs)</div>
                <div className="font-extrabold text-white mt-1">Rp 14.500</div>
              </div>
            </div>
          </div>

          {/* Variant Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-kravo-dark uppercase tracking-wider block">Pilih Ukuran Kemasan</label>
            <div className="flex gap-3">
              {['100g (Pouch Reguler)', '250g (Family Pack)', 'Karton Isi 24'].map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedVariant === v 
                      ? 'bg-kravo-dark text-white shadow-md' 
                      : 'bg-white text-kravo-dark border border-kravo-creamBorder hover:border-kravo-orange'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and CTA */}
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

              <button className="flex-1 py-3 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all">
                <ShoppingBag className="w-4 h-4" /> Tambah ke Keranjang
              </button>
            </div>

            <Link
              to="/checkout"
              className="w-full py-3 px-6 rounded-xl bg-kravo-dark hover:bg-kravo-darkMuted text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              Beli Langsung Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
