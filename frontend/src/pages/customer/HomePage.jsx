import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Sparkles, ShieldCheck, Flame, ShoppingBag, Store, CheckCircle2 } from 'lucide-react'

const sampleProducts = [
  {
    id: 1,
    name: 'KRAVO Gourmet Truffle Cassava',
    category: 'Cassava Chips',
    price: 24500,
    wholesalePrice: 18000,
    moq: 50,
    rating: 4.9,
    reviews: 142,
    badge: 'BEST SELLER',
    flavor: 'Black Truffle & Sea Salt',
    image: '🥔',
  },
  {
    id: 2,
    name: 'KRAVO Golden Cheddar Crackers',
    category: 'Cheese Crackers',
    price: 22000,
    wholesalePrice: 16500,
    moq: 50,
    rating: 4.8,
    reviews: 98,
    badge: 'POPULAR',
    flavor: 'Aged Cheddar & Herb',
    image: '🧀',
  },
  {
    id: 3,
    name: 'KRAVO Dark Fudge Brownie Cookies',
    category: 'Chocolate Cookies',
    price: 28000,
    wholesalePrice: 21000,
    moq: 50,
    rating: 5.0,
    reviews: 215,
    badge: 'NEW OVEN',
    flavor: 'Belgian Dark Choc 70%',
    image: '🍪',
  },
  {
    id: 4,
    name: 'KRAVO Spicy Ghost Pepper Crisps',
    category: 'Potato Chips',
    price: 26000,
    wholesalePrice: 19500,
    moq: 50,
    rating: 4.9,
    reviews: 180,
    badge: 'HOT SPICY',
    flavor: 'Smoked Ghost Pepper',
    image: '🌶️',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-kravo-dark text-kravo-cream pt-12 pb-20 lg:py-28 px-4 sm:px-6 lg:px-8 rounded-b-3xl sm:rounded-b-4xl shadow-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-kravo-orange">
              <Sparkles className="w-4 h-4" /> Sensasi Renyah Premium Generasi Baru
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Good Snacks. <br />
              <span className="text-kravo-orange">Better Moments.</span>
            </h1>

            <p className="text-base sm:text-lg text-kravo-cream/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Snack kemasan gourmet dari bahan alami pilihan. Dibuat dengan standar higienis FEFO untuk menjamin kerenyahan dan kesegaran maksimal di setiap gigitan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link 
                to="/products"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-base shadow-lg shadow-kravo-orange/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5" /> Jelajahi Menu Retail
              </Link>
              <Link 
                to="/wholesale"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/30 flex items-center justify-center gap-2 transition-all"
              >
                <Store className="w-5 h-5 text-kravo-orange" /> Gabung Reseller B2B
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-kravo-darkMuted/80 max-w-md mx-auto lg:mx-0">
              <div>
                <span className="text-2xl font-black text-white">100%</span>
                <span className="block text-xs text-kravo-cream/60">Bahan Alami</span>
              </div>
              <div>
                <span className="text-2xl font-black text-white">4.9★</span>
                <span className="block text-xs text-kravo-cream/60">Rating Pelanggan</span>
              </div>
              <div>
                <span className="text-2xl font-black text-kravo-orange">FEFO</span>
                <span className="block text-xs text-kravo-cream/60">Fresh Batch</span>
              </div>
            </div>
          </div>

          {/* Right Visual Floating Showcase */}
          <div className="relative flex items-center justify-center">
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-kravo-orange/30 to-kravo-cream/10 blur-3xl absolute -z-10 animate-pulse"></div>
            <div className="bg-gradient-to-br from-kravo-darkMuted to-[#181C17] p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl text-center space-y-4 max-w-md w-full">
              <div className="text-7xl sm:text-8xl select-none animate-bounce">
                🥔✨
              </div>
              <div className="inline-block px-3 py-1 bg-kravo-orange text-white text-xs font-black rounded-full uppercase tracking-wider">
                Signature Item
              </div>
              <h3 className="text-2xl font-black text-white">Truffle Cassava Gourmet</h3>
              <p className="text-xs text-kravo-cream/70">Perpaduan keripik singkong renyah dengan aroma black truffle asli & sentuhan sea salt Mediterania.</p>
              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <div className="text-left">
                  <span className="text-[10px] text-kravo-cream/60 block">Harga Retail</span>
                  <span className="text-lg font-black text-white">Rp 24.500</span>
                </div>
                <Link to="/products/truffle-cassava" className="px-4 py-2 rounded-lg bg-kravo-orange text-white text-xs font-bold hover:bg-kravo-orangeHover flex items-center gap-1">
                  Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products (B2C & B2B Preview) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-kravo-orange uppercase tracking-widest block">Snack Paling Dicari</span>
            <h2 className="text-3xl font-black text-kravo-dark tracking-tight">Koleksi Terpopuler</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-kravo-orange hover:underline">
            Lihat Semua Produk <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleProducts.map((p) => (
            <div 
              key={p.id}
              className="bg-white rounded-2xl p-5 border border-kravo-creamBorder shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-kravo-orange/15 text-kravo-orange">
                    {p.badge}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {p.rating}
                  </div>
                </div>

                <div className="h-40 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                  {p.image}
                </div>

                <div className="text-[11px] font-bold text-kravo-orange uppercase tracking-wider mb-1">
                  {p.category}
                </div>
                <h3 className="font-extrabold text-base text-kravo-dark line-clamp-1 group-hover:text-kravo-orange transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3">{p.flavor}</p>
              </div>

              <div className="pt-3 border-t border-kravo-creamBorder/60 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Retail</span>
                    <span className="text-lg font-black text-kravo-dark">
                      Rp {p.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-semibold block">Grosir mulai</span>
                    <span className="text-xs font-bold text-emerald-700">
                      Rp {p.wholesalePrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/products/sample-${p.id}`}
                  className="w-full py-2.5 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Detail & Pesan
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* B2B Reseller Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-kravo-dark via-kravo-darkMuted to-[#1A2019] text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-kravo-darkMuted relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="px-3 py-1 rounded-full bg-kravo-orange text-white text-xs font-black uppercase tracking-wider">
              Program Kemitraan B2B
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ingin Menjadi Distributor atau Reseller KRAVO di Kota Anda?
            </h2>
            <p className="text-sm sm:text-base text-kravo-cream/80 leading-relaxed">
              Dapatkan harga grosir berjenjang (Tiered Pricing), Minimum Order Quantity fleksibel, materi promosi gratis, serta prioritas alokasi batch snack paling segar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-kravo-cream/90 font-medium pt-2">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-kravo-orange" /> Margin laba hingga 40%</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-kravo-orange" /> Dukungan faktur & tax invoice resmi</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-kravo-orange" /> Validasi batch FEFO terjaga</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-kravo-orange" /> Ekspedisi kargo terjangkau</div>
            </div>

            <div className="pt-4">
              <Link
                to="/wholesale"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm shadow-lg shadow-kravo-orange/30 transition-all hover:scale-105"
              >
                Daftar Sebagai Reseller Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
