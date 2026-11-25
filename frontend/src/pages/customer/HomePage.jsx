import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Star,
  Sparkles,
  ShoppingBag,
  Heart,
  Store,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react'
import { productApi } from '../../api/productApi'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useAuth } from '../../contexts/AuthContext'
import { getProductImageUrl } from '../../utils/imageUrl'

// Fallback slides in case database is loading or has limited items
const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    name: 'Truffle Cassava Gourmet',
    categoryName: 'Cassava Chips',
    badge: 'Signature Item 🔥',
    tagline: 'Perpaduan keripik singkong renyah dengan aroma black truffle asli & sentuhan sea salt Mediterania.',
    retail_price: 24500,
    wholesale_price: 18000,
    slug: 'truffle-cassava-gourmet',
    icon: '🥔✨',
    imageUrl: null,
  },
  {
    id: 'slide-2',
    name: 'Donut Coklat Artisanal',
    categoryName: 'Artisanal Pastry',
    badge: 'Chef Choice 🍩',
    tagline: 'Donut panggang lembut berlapis lelehan premium Belgian Dark Chocolate bertabur remah biskuit.',
    retail_price: 24500,
    wholesale_price: 18000,
    slug: 'donut-coklat',
    icon: '🍩🍫',
    imageUrl: null,
  },
  {
    id: 'slide-3',
    name: 'Golden Cheddar Crackers',
    categoryName: 'Cheese Crackers',
    badge: 'Bestseller 🧀',
    tagline: 'Biskuit gurih renyah dengan lelehan keju Wisconsin Aged Cheddar & herba thyme panggang.',
    retail_price: 22000,
    wholesale_price: 16500,
    slug: 'golden-cheddar-crackers',
    icon: '🧀🌿',
    imageUrl: null,
  },
  {
    id: 'slide-4',
    name: 'Honey Butter Almond Crunch',
    categoryName: 'Nuts & Seeds',
    badge: 'Fresh Batch ✨',
    tagline: 'Kacang almond California sangrai dilapisi madu hutan organik & butter New Zealand gurih.',
    retail_price: 28000,
    wholesale_price: 21000,
    slug: 'honey-butter-almond',
    icon: '🍯🥜',
    imageUrl: null,
  }
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const touchStartX = useRef(null)

  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isReseller } = useAuth()

  useEffect(() => {
    productApi.getProducts({ per_page: 12 })
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          setFeaturedProducts(res.data)
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  // Build high-impact carousel slides from real database products + fallback
  const heroSlides = useMemo(() => {
    if (featuredProducts.length === 0) {
      return DEFAULT_SLIDES
    }

    const badges = ['Signature Item 🔥', 'Paling Dicari 🌟', 'FEFO Fresh Batch ✨', 'Chef Special 👑', 'Favorit Konsumen ⭐️']

    const mapped = featuredProducts.slice(0, 5).map((p, idx) => {
      const v = p.variants?.[0]
      const price = v ? Number(v.retail_price) : 24500
      const wPrice = v?.price_tiers?.[0] ? Number(v.price_tiers[0].unit_price) : Math.round(price * 0.8)
      return {
        id: p.id,
        name: p.name,
        categoryName: p.category?.name || 'Snack Gourmet',
        badge: badges[idx % badges.length],
        tagline: p.tagline || p.description || 'Snack gurih renyah kualitas gourmet terbuat dari bahan alami pilihan.',
        retail_price: price,
        wholesale_price: wPrice,
        slug: p.slug,
        icon: p.category?.icon || '🍿',
        imageUrl: getProductImageUrl(p),
        originalProduct: p,
      }
    })

    // If backend only has 1 or 2 products, supplement with default slides so carousel flows nicely
    if (mapped.length < 3) {
      return [...mapped, ...DEFAULT_SLIDES.slice(mapped.length)]
    }

    return mapped
  }, [featuredProducts])

  // Auto-slide effect every 4.5 seconds (paused when user hovers mouse)
  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 4500)

    return () => clearInterval(interval)
  }, [isPaused, heroSlides.length])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 40) nextSlide()
    if (diff < -40) prevSlide()
    touchStartX.current = null
  }

  const activeSlide = heroSlides[currentSlide] || heroSlides[0]

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

  // Categories list for interactive filter
  const categoriesList = useMemo(() => {
    const set = new Set()
    featuredProducts.forEach(p => {
      if (p.category?.name) set.add(p.category.name)
    })
    return ['ALL', ...Array.from(set)]
  }, [featuredProducts])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'ALL') return featuredProducts
    return featuredProducts.filter(p => p.category?.name === selectedCategory)
  }, [featuredProducts, selectedCategory])

  return (
    <div className="space-y-10 pb-14">
      {/* Hero Section with Auto-sliding Showcase */}
      <section className="relative overflow-hidden bg-kravo-dark text-kravo-cream pt-8 pb-12 lg:py-14 px-4 sm:px-6 lg:px-10 xl:px-12 rounded-b-3xl shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-kravo-orange/15 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">

          {/* Left Text & Brand Pitch */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-kravo-orange backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-kravo-orange animate-spin" style={{ animationDuration: '6s' }} />
              <span>Sensasi Renyah Premium Generasi Baru</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Good Snacks. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-kravo-orange via-amber-400 to-kravo-orange">
                Better Moments.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-kravo-cream/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Snack kemasan gourmet dari bahan alami pilihan. Dibuat dengan standar higienis <strong className="text-white font-bold">FEFO (First-Expired, First-Out)</strong> untuk menjamin kerenyahan dan kesegaran maksimal di setiap gigitan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-base shadow-xl shadow-kravo-orange/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <ShoppingBag className="w-5 h-5" /> Jelajahi Menu Retail
              </Link>
              {isReseller && (
                <Link
                  to="/wholesale"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/30 backdrop-blur-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <Store className="w-5 h-5 text-kravo-orange" /> Portal Mitra B2B
                </Link>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="text-2xl sm:text-3xl font-black text-white block">100%</span>
                <span className="text-xs text-kravo-cream/60">Bahan Alami</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 block">4.9★</span>
                <span className="text-xs text-kravo-cream/60">Rating Konsumen</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="text-2xl sm:text-3xl font-black text-kravo-orange block">FEFO</span>
                <span className="text-xs text-kravo-cream/60">Rotasi Fresh Batch</span>
              </div>
            </div>
          </div>

          {/* Right Visual: Interactive Auto-Sliding Showcase */}
          <div
            className="lg:col-span-5 relative flex flex-col items-center justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Pulsing ambient aura behind card */}
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-kravo-orange/30 via-amber-500/20 to-transparent blur-3xl absolute -z-10 animate-pulse-glow" />

            {/* Showcase Main Card */}
            <div className="w-full max-w-lg bg-gradient-to-br from-[#272D25] via-[#1F241E] to-[#151914] p-5 sm:p-7 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-500">

              {/* Card Header: Slide Counter & Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-kravo-orange text-white shadow-sm">
                    {activeSlide.badge}
                  </span>
                  {isPaused && (
                    <span className="text-[10px] text-kravo-cream/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                      Dijeda
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono font-bold text-kravo-cream/60 tracking-wider">
                  0{currentSlide + 1} / 0{heroSlides.length}
                </div>
              </div>

              {/* Animated Progress Timer Line */}
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-5">
                <div
                  key={currentSlide}
                  className={`h-full bg-kravo-orange transition-all ${isPaused ? 'w-full opacity-60' : 'animate-[marquee_4.5s_linear]'}`}
                  style={{ width: isPaused ? '100%' : undefined }}
                />
              </div>

              {/* Product Visual Centerpiece */}
              <div className="relative h-56 sm:h-64 w-full flex items-center justify-center rounded-2xl bg-gradient-to-b from-white/10 to-transparent p-4 mb-4 overflow-hidden group">
                {activeSlide.imageUrl ? (
                  <img
                    key={activeSlide.id}
                    src={activeSlide.imageUrl}
                    alt={activeSlide.name}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.6)] animate-float-smooth transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.display = 'none'
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}

                {/* Fallback Emoji/Icon */}
                <div
                  className="text-8xl sm:text-9xl select-none animate-float-smooth filter drop-shadow-2xl"
                  style={{ display: activeSlide.imageUrl ? 'none' : 'flex' }}
                >
                  {activeSlide.icon}
                </div>

                {/* Left / Right Carousel Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-kravo-orange text-white border border-white/20 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 z-20"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-kravo-orange text-white border border-white/20 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 z-20"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info & Descriptions */}
              <div className="space-y-2 text-center sm:text-left transition-opacity duration-300">
                <span className="text-[11px] font-bold uppercase tracking-widest text-kravo-orange block">
                  {activeSlide.categoryName}
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight line-clamp-1">
                  {activeSlide.name}
                </h3>
                <p className="text-xs text-kravo-cream/70 line-clamp-2 leading-relaxed min-h-[32px]">
                  {activeSlide.tagline}
                </p>
              </div>

              {/* Price & Action Row */}
              <div className="pt-4 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                <div className="text-left">
                  <span className="text-[10px] text-kravo-cream/60 block uppercase font-medium">Harga Retail</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">
                      Rp {Number(activeSlide.retail_price).toLocaleString('id-ID')}
                    </span>
                    {isReseller && (
                      <span className="text-[11px] font-bold text-emerald-400">
                        (Grosir: Rp {Number(activeSlide.wholesale_price).toLocaleString('id-ID')})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeSlide.originalProduct && (
                    <button
                      onClick={() => handleQuickAdd(activeSlide.originalProduct)}
                      disabled={addingId === activeSlide.id}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingBag className="w-4 h-4 text-kravo-orange" />
                    </button>
                  )}
                  <Link
                    to={`/products/${activeSlide.slug}`}
                    className="px-5 py-2.5 rounded-xl bg-kravo-orange text-white text-xs font-bold hover:bg-kravo-orangeHover flex items-center gap-1.5 shadow-lg shadow-kravo-orange/30 transition-all hover:scale-105 active:scale-95"
                  >
                    Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Interactive Slide Dots Bar */}
              <div className="flex items-center justify-center gap-2 pt-5">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Ke slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index
                      ? 'w-8 bg-kravo-orange shadow-md shadow-kravo-orange/50'
                      : 'w-2 bg-white/25 hover:bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Swipe Instruction on Mobile */}
            <p className="text-[11px] text-kravo-cream/40 mt-3 sm:hidden flex items-center gap-1">
              👈 Geser kiri/kanan untuk memilih snack 👉
            </p>
          </div>
        </div>
      </section>

      {/* Infinite Marquee Ticker: Brand Trust & Selling Points */}
      <section className="relative overflow-hidden bg-gradient-to-r from-kravo-dark via-[#1A2019] to-kravo-dark text-kravo-cream border-y border-kravo-darkMuted/60 py-3.5 shadow-md">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-xs font-bold tracking-wider uppercase">
          {/* Ticker Set 1 */}
          <div className="flex items-center gap-8 text-kravo-cream/90">
            <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-kravo-orange" /> Gourmet Artisanal Quality</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> 100% Bahan Alami Tanpa Pengawet</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Standar Rotasi FEFO Selalu Fresh</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-sky-400" /> Pengiriman Cepat Free Extra Bubble Wrap</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Rating 4.9/5 dari 10.000+ Konsumen</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><Store className="w-4 h-4 text-kravo-orange" /> Peluang Kemitraan Reseller B2B Seluruh Indonesia</span>
            <span className="text-kravo-orange">•</span>
          </div>

          {/* Ticker Set 2 (for seamless loop) */}
          <div className="flex items-center gap-8 text-kravo-cream/90">
            <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-kravo-orange" /> Gourmet Artisanal Quality</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> 100% Bahan Alami Tanpa Pengawet</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Standar Rotasi FEFO Selalu Fresh</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-sky-400" /> Pengiriman Cepat Free Extra Bubble Wrap</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Rating 4.9/5 dari 10.000+ Konsumen</span>
            <span className="text-kravo-orange">•</span>
            <span className="flex items-center gap-2"><Store className="w-4 h-4 text-kravo-orange" /> Peluang Kemitraan Reseller B2B Seluruh Indonesia</span>
            <span className="text-kravo-orange">•</span>
          </div>
        </div>
      </section>

      {/* Featured Products Section with Interactive Category Filter */}
      <section className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-kravo-orange uppercase tracking-widest block mb-1">
              Snack Paling Dicari
            </span>
            <h2 className="text-3xl font-black text-kravo-dark tracking-tight">
              Koleksi Terpopuler
            </h2>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat
                  ? 'bg-kravo-dark text-white shadow-md'
                  : 'bg-white border border-kravo-creamBorder text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {cat === 'ALL' ? 'Semua Produk' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredProducts.map((p) => {
            const variant = p.variants?.[0]
            const price = variant ? Number(variant.retail_price) : 24500
            const wholesalePrice = variant?.price_tiers?.[0] ? Number(variant.price_tiers[0].unit_price) : Math.round(price * 0.8)
            const stock = p.variants?.reduce((s, v) => s + (v.inventory ? Number(v.inventory.available_stock) : 0), 0) ?? (variant?.inventory ? Number(variant.inventory.available_stock) : 0)
            const isOutOfStock = stock <= 0

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-5 border border-kravo-creamBorder shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-kravo-orange/15 text-kravo-orange">
                      {p.category?.name || 'SNACK'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isOutOfStock ? 'bg-rose-100 text-rose-700' : stock <= 20 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                        {isOutOfStock ? 'Habis' : `${stock} pcs`}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> 4.9
                      </div>
                    </div>
                  </div>

                  <div className="h-48 w-full mb-3 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center relative p-3">
                    {getProductImageUrl(p) ? (
                      <img
                        src={getProductImageUrl(p)}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.style.display = 'none'
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500"
                      style={{ display: getProductImageUrl(p) ? 'none' : 'flex' }}
                    >
                      {p.category?.icon || '🍿'}
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-kravo-orange uppercase tracking-wider mb-1">
                    {p.category?.name || 'KRAVO'}
                  </div>
                  <h3 className="font-extrabold text-base text-kravo-dark line-clamp-1 group-hover:text-kravo-orange transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{p.tagline || p.description || '-'}</p>
                </div>

                <div className="pt-3 border-t border-kravo-creamBorder/60 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Retail</span>
                      <span className="text-lg font-black text-kravo-dark">
                        Rp {price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {isReseller && (
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 font-semibold block">Grosir mulai</span>
                        <span className="text-xs font-bold text-emerald-700">
                          Rp {wholesalePrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/products/${p.slug}`}
                      className="flex-1 py-2.5 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      Detail
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(p)}
                      className={`p-2.5 rounded-xl border transition-all shadow-sm cursor-pointer ${
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
                      className={`p-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm ${isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-kravo-orange hover:bg-kravo-orangeHover cursor-pointer'
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
      </section>

      {/* B2B Reseller Highlight Banner */}
      {isReseller && (
        <section className="w-full px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-kravo-dark via-kravo-darkMuted to-[#1A2019] text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-kravo-darkMuted relative overflow-hidden shadow-2xl">
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
                  Buka Katalog Grosir B2B <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
