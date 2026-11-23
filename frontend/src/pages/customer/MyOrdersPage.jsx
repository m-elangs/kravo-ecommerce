import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ArrowRight,
  Loader2,
  Star,
  CheckCircle,
  X,
  AlertCircle,
  ShoppingBag,
  Search,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  Check,
  Store,
  Clock,
  Truck,
  CreditCard,
  ChevronRight
} from 'lucide-react'
import { orderApi } from '../../api/orderApi'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { getProductImageUrl } from '../../utils/imageUrl'

const RATING_LABELS = {
  1: 'Sangat Kecewa 😞',
  2: 'Kurang Memuaskan 😐',
  3: 'Cukup Baik & Enak 🙂',
  4: 'Sangat Lezat & Renyah 😊',
  5: 'Luar Biasa Istimewa! 🌟',
}

export default function MyOrdersPage() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Active view tab: 'orders' (Riwayat Pesanan) vs 'snacks' (Koleksi Snack Saya)
  const [activeTab, setActiveTab] = useState('orders')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Quick Re-order state
  const [addingVariantId, setAddingVariantId] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', productName: '' })

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  const showSuccessToast = (productName) => {
    setToast({
      show: true,
      message: 'Berhasil dimasukkan ke keranjang belanja!',
      productName,
    })
    setTimeout(() => {
      setToast({ show: false, message: '', productName: '' })
    }, 4000)
  }

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await orderApi.getOrders()
      if (res.success && res.data) {
        setOrders(res.data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  // Handle Quick Re-order
  const handleQuickReorder = async (item) => {
    const variantId = item.product_variant_id || item.product_variant?.id
    if (!variantId) return

    setAddingVariantId(variantId)
    try {
      await addToCart(variantId, 1, item.product_variant || null)
      showSuccessToast(item.product_name || item.product_variant?.product?.name || 'Snack')
    } catch (e) {
      alert('Gagal menambahkan snack ke keranjang.')
    } finally {
      setAddingVariantId(null)
    }
  }

  // Aggregate Unique Snacks across all user orders
  const uniqueSnacksPurchased = useMemo(() => {
    const map = new Map()

    orders.forEach((order) => {
      if (!order.items) return
      order.items.forEach((item) => {
        const vId = item.product_variant_id || item.product_variant?.id || item.id
        const product = item.product_variant?.product
        const categoryName = product?.category?.name || 'Snack'
        const categoryIcon = product?.category?.icon || '🍿'
        const availStock = item.product_variant?.inventory ? Number(item.product_variant.inventory.available_stock) : 0

        if (!map.has(vId)) {
          map.set(vId, {
            variantId: vId,
            productId: product?.id,
            productName: item.product_name || product?.name || 'Snack KRAVO',
            variantName: item.variant_name || `${item.product_variant?.weight_grams || 100}g`,
            sku: item.sku || item.product_variant?.sku,
            unitPrice: Number(item.unit_price) || Number(item.product_variant?.retail_price) || 0,
            categoryName,
            categoryIcon,
            product,
            availableStock: availStock,
            totalQuantityPurchased: 0,
            orderCount: 0,
            orderNumbers: [],
            lastOrderedAt: order.created_at,
          })
        }

        const data = map.get(vId)
        data.totalQuantityPurchased += item.quantity || 1
        data.orderCount += 1
        if (!data.orderNumbers.includes(order.order_number)) {
          data.orderNumbers.push(order.order_number)
        }
        if (new Date(order.created_at) > new Date(data.lastOrderedAt)) {
          data.lastOrderedAt = order.created_at
        }
      })
    })

    return Array.from(map.values()).sort(
      (a, b) => b.totalQuantityPurchased - a.totalQuantityPurchased
    )
  }, [orders])

  // Extract unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set()
    uniqueSnacksPurchased.forEach((s) => {
      if (s.categoryName) cats.add(s.categoryName)
    })
    return Array.from(cats)
  }, [uniqueSnacksPurchased])

  // Filter Orders based on search, status, and category
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (statusFilter !== 'all' && o.status !== statusFilter) {
        return false
      }

      // Category filter: check if any item in this order belongs to the category
      if (categoryFilter !== 'all') {
        const matchesCat = o.items?.some((it) => {
          const cat = it.product_variant?.product?.category?.name
          return cat && cat.toLowerCase() === categoryFilter.toLowerCase()
        })
        if (!matchesCat) return false
      }

      // Search query filter: matches order number, snack name, variant name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchNumber = o.order_number?.toLowerCase().includes(q)
        const matchItems = o.items?.some((it) => {
          const pName = (it.product_name || it.product_variant?.product?.name || '').toLowerCase()
          const vName = (it.variant_name || '').toLowerCase()
          return pName.includes(q) || vName.includes(q)
        })
        if (!matchNumber && !matchItems) return false
      }

      return true
    })
  }, [orders, statusFilter, categoryFilter, searchQuery])

  // Filter Unique Snacks based on search and category
  const filteredSnacks = useMemo(() => {
    return uniqueSnacksPurchased.filter((s) => {
      if (categoryFilter !== 'all' && s.categoryName.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = s.productName.toLowerCase().includes(q)
        const matchVar = s.variantName.toLowerCase().includes(q)
        const matchCat = s.categoryName.toLowerCase().includes(q)
        if (!matchName && !matchVar && !matchCat) return false
      }
      return true
    })
  }, [uniqueSnacksPurchased, categoryFilter, searchQuery])

  const handleOpenReviewModal = (order) => {
    setSelectedOrder(order)
    const firstItem = order.items?.[0]
    const prodId = firstItem?.product_variant?.product_id || firstItem?.product_variant?.product?.id || 1
    const prodName = firstItem?.product_name || firstItem?.product_variant?.product?.name || 'Snack KRAVO'

    setSelectedProduct({
      id: prodId,
      name: prodName,
      items: order.items || [],
    })
    setRating(5)
    setHoverRating(0)
    setComment('')
    setReviewError(null)
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!selectedOrder || !selectedProduct?.id) {
      setReviewError('Data pesanan atau produk tidak valid.')
      return
    }

    setSubmittingReview(true)
    setReviewError(null)

    try {
      await orderApi.submitReview({
        order_id: selectedOrder.id,
        product_id: selectedProduct.id,
        rating,
        comment: comment.trim() || null,
      })

      alert('Terima kasih! Ulasan produk Anda berhasil dikirim.')
      setShowReviewModal(false)
      loadOrders()
    } catch (err) {
      setReviewError(err?.message || 'Gagal mengirim ulasan. Silakan coba lagi.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Silakan Masuk Terlebih Dahulu</h2>
        <Link to="/account" className="inline-block px-6 py-2.5 rounded-xl bg-kravo-orange text-white text-xs font-bold shadow-md">
          Halaman Login
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-slate-700">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-white">
              {toast.productName}
            </div>
            <div className="text-[11px] text-slate-300">
              {toast.message}
            </div>
          </div>
          <Link
            to="/cart"
            className="ml-2 px-3 py-1.5 rounded-lg bg-kravo-orange hover:bg-kravo-orangeHover text-white text-[11px] font-bold transition-colors whitespace-nowrap"
          >
            Lihat Keranjang
          </Link>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Riwayat Transaksi Resmi</span>
          <h1 className="text-3xl font-black text-kravo-dark">Pesanan & Koleksi Snack</h1>
          <p className="text-xs text-slate-500 mt-1">
            Menampilkan riwayat belanja untuk akun: <span className="font-bold text-slate-800">{user.name}</span> <span className="text-slate-400">({user.email})</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="px-3.5 py-2 rounded-xl bg-kravo-orange text-white text-xs font-bold hover:bg-kravo-orangeHover transition-colors shadow-sm flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Keranjang Belanja
          </Link>
          <Link
            to="/account"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:text-kravo-orange hover:border-kravo-orange transition-colors"
          >
            Profil Akun
          </Link>
        </div>
      </div>

      {/* Main Tab Navigation: Riwayat Pesanan vs Riwayat per Jenis Snack */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-white p-2 rounded-2xl border border-kravo-creamBorder shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-kravo-dark text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Riwayat Transaksi ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('snacks')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'snacks'
                ? 'bg-kravo-dark text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Snack yang Pernah Dibeli ({uniqueSnacksPurchased.length} jenis)</span>
          </button>
        </div>

        {/* Total Summary Mini Pill */}
        <div className="text-right px-3 py-1 hidden lg:block">
          <span className="text-[11px] text-slate-400 block font-medium">Total Camilan Dipesan:</span>
          <span className="text-xs font-black text-kravo-orange">
            {uniqueSnacksPurchased.reduce((sum, s) => sum + s.totalQuantityPurchased, 0)} pcs camilan
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-kravo-creamBorder shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={activeTab === 'orders' ? 'Cari no. pesanan, nama snack, atau rasa...' : 'Cari nama camilan favorit Anda...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange font-medium text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter (Only in Orders view) */}
          {activeTab === 'orders' && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer py-1"
              >
                <option value="all">Semua Status</option>
                <option value="pending_payment">Menunggu Bayar</option>
                <option value="paid">Sudah Dibayar</option>
                <option value="processing">Diproses</option>
                <option value="shipped">Dikirim</option>
                <option value="delivered">Selesai (Delivered)</option>
              </select>
            </div>
          )}

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer py-1"
              >
                <option value="all">Semua Jenis Snack</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs font-bold">Memuat riwayat snack & pesanan...</span>
        </div>
      ) : activeTab === 'orders' ? (
        /* TAB 1: RIWAYAT TRANSAKSI DENGAN DAFTAR SNACK */
        filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-kravo-creamBorder text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Tidak Ada Pesanan yang Cocok'
                : 'Belum Ada Riwayat Pesanan'}
            </h3>
            <p className="text-xs text-slate-500">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Coba ubah kata kunci pencarian atau reset filter di atas.'
                : 'Pilih camilan lezat dari katalog kami untuk pesanan pertama Anda.'}
            </p>
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setCategoryFilter('all')
                }}
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Reset Filter
              </button>
            ) : (
              <Link to="/products" className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-kravo-orange text-white text-xs font-bold shadow-md">
                Mulai Belanja Snack
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((o) => {
              const hasReviewed = o.reviews && o.reviews.length > 0
              const isDelivered = o.status === 'delivered'
              const formattedDate = o.created_at
                ? new Date(o.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-'

              return (
                <div
                  key={o.id}
                  className="bg-white rounded-3xl border border-kravo-creamBorder shadow-sm overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Order Header */}
                  <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-black text-sm text-kravo-dark bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                        {o.order_number}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          o.order_type === 'b2b_wholesale'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {o.order_type === 'b2b_wholesale' ? 'B2B Wholesale (Reseller)' : 'B2C Retail Customer'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formattedDate} WIB
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          o.status === 'paid' || o.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'processing' || o.status === 'shipped'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* RINCIAN JENIS SNACK YANG DIBELI */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-kravo-orange" />
                      <span>Rincian Jenis Camilan yang Dibeli ({o.items?.length || 0} Varian)</span>
                    </div>

                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white overflow-hidden">
                      {o.items?.map((item) => {
                        const product = item.product_variant?.product
                        const imgUrl = getProductImageUrl(product)
                        const catIcon = product?.category?.icon || '🍿'
                        const catName = product?.category?.name || 'Snack'
                        const availStock = item.product_variant?.inventory
                          ? Number(item.product_variant.inventory.available_stock)
                          : 0
                        const isAdding = addingVariantId === (item.product_variant_id || item.product_variant?.id)

                        return (
                          <div
                            key={item.id}
                            className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                          >
                            {/* Snack Info */}
                            <div className="flex items-center gap-3.5">
                              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative">
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null
                                      e.target.style.display = 'none'
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                                    }}
                                  />
                                ) : null}
                                <span
                                  className="text-2xl"
                                  style={{ display: imgUrl ? 'none' : 'flex' }}
                                >
                                  {catIcon}
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 text-sm hover:text-kravo-orange transition-colors">
                                    <Link to="/products">{item.product_name || product?.name}</Link>
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                    {catName}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  Varian: <span className="font-semibold text-slate-700">{item.variant_name || `${item.product_variant?.weight_grams || 100}g`}</span>
                                  {item.sku && (
                                    <span className="text-[10px] text-slate-400 font-mono ml-2">({item.sku})</span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                                  <span className="font-black text-kravo-orange">
                                    {item.quantity} pcs × Rp {Number(item.unit_price).toLocaleString('id-ID')}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-extrabold text-slate-800">
                                    Total: Rp {Number(item.subtotal).toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quick Re-Order Button */}
                            <div className="flex items-center justify-end gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleQuickReorder(item)}
                                disabled={isAdding || availStock <= 0}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                                  availStock <= 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 hover:border-amber-300'
                                }`}
                                title={availStock <= 0 ? 'Stok sedang habis' : 'Pesan snack ini lagi'}
                              >
                                {isAdding ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                                ) : (
                                  <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                                )}
                                <span>{availStock <= 0 ? 'Stok Habis' : 'Beli Lagi'}</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Order Footer with Total & Actions */}
                  <div className="p-5 sm:p-6 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">
                        Total Pembayaran ({o.items?.length || 0} varian snack)
                      </div>
                      <div className="text-2xl font-black text-kravo-dark mt-0.5">
                        Rp {Number(o.grand_total).toLocaleString('id-ID')}
                      </div>
                      {o.shipment?.tracking_number && (
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Resi: <strong className="font-mono text-slate-800">{o.shipment.tracking_number}</strong> ({o.shipment.courier_name})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Tombol Beri Ulasan untuk pesanan Delivered */}
                      {isDelivered && (
                        hasReviewed ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Sudah Diulas
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(o)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-white text-white" />
                            Beri Ulasan
                          </button>
                        )
                      )}

                      <Link
                        to={`/order-tracking/${o.order_number}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        Lacak Pesanan <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {o.status === 'pending_payment' && (
                        <Link
                          to={`/payment/${o.order_number}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold transition-colors shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Bayar Sekarang
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* TAB 2: RINGKASAN KOLEKSI SNACK YANG PERNAH DIBELI */
        filteredSnacks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-kravo-creamBorder text-center space-y-3">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery || categoryFilter !== 'all'
                ? 'Tidak Ada Jenis Camilan yang Cocok'
                : 'Belum Ada Camilan yang Pernah Dibeli'}
            </h3>
            <p className="text-xs text-slate-500">
              {searchQuery || categoryFilter !== 'all'
                ? 'Coba gunakan kata kunci pencarian camilan lain atau reset filter.'
                : 'Setelah Anda melakukan pembelian snack, semua jenis snack yang pernah dipesan akan terkumpul di sini.'}
            </p>
            <Link to="/products" className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-kravo-orange text-white text-xs font-bold shadow-md">
              Jelajahi Katalog Snack
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
              <span>Menampilkan {filteredSnacks.length} jenis camilan yang pernah Anda beli:</span>
              <span className="text-slate-400">Diurutkan berdasarkan camilan paling sering dibeli</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSnacks.map((snack) => {
                const imgUrl = getProductImageUrl(snack.product)
                const isAdding = addingVariantId === snack.variantId
                const lastDate = snack.lastOrderedAt
                  ? new Date(snack.lastOrderedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-'

                return (
                  <div
                    key={snack.variantId}
                    className="bg-white p-5 rounded-2xl border border-kravo-creamBorder shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-18 h-18 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={snack.productName}
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
                          style={{ display: imgUrl ? 'none' : 'flex' }}
                        >
                          {snack.categoryIcon}
                        </span>
                      </div>

                      {/* Info Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {snack.categoryName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {snack.sku}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug truncate hover:text-kravo-orange transition-colors">
                          <Link to="/products">{snack.productName}</Link>
                        </h4>
                        <div className="text-xs text-slate-500 font-medium">
                          Varian: <strong className="text-slate-800">{snack.variantName}</strong>
                        </div>

                        <div className="mt-2 text-xs font-black text-kravo-orange">
                          Rp {snack.unitPrice.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {/* Stats & Repeat Order Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500">
                        <div>
                          Total Dibeli: <strong className="text-slate-900 font-bold">{snack.totalQuantityPurchased} pcs</strong> ({snack.orderCount} transaksi)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Terakhir: {lastDate}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleQuickReorder({
                            product_variant_id: snack.variantId,
                            product_name: snack.productName,
                          })
                        }
                        disabled={isAdding || snack.availableStock <= 0}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                          snack.availableStock <= 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-kravo-orange hover:bg-kravo-orangeHover text-white'
                        }`}
                      >
                        {isAdding ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5" />
                        )}
                        <span>{snack.availableStock <= 0 ? 'Stok Habis' : 'Pesan Lagi (+1)'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}

      {/* Modal Beri Ulasan */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Beri Ulasan Snack</h3>
                <p className="text-xs text-slate-400">
                  Pesanan: <span className="font-mono font-bold text-slate-700">{selectedOrder.order_number}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewError && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Product Info */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Produk yang Diulas *</label>
                {selectedProduct?.items && selectedProduct.items.length > 1 ? (
                  <select
                    value={selectedProduct.id}
                    onChange={(e) => {
                      const found = selectedProduct.items.find(
                        (it) =>
                          (it.product_variant?.product_id || it.product_variant?.product?.id) ===
                          parseInt(e.target.value)
                      )
                      setSelectedProduct({
                        ...selectedProduct,
                        id: parseInt(e.target.value),
                        name: found?.product_name || selectedProduct.name,
                      })
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none"
                  >
                    {selectedProduct.items.map((it) => {
                      const pId = it.product_variant?.product_id || it.product_variant?.product?.id || 1
                      return (
                        <option key={it.id} value={pId}>
                          {it.product_name} ({it.variant_name})
                        </option>
                      )
                    })}
                  </select>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                    🍿 {selectedProduct?.name}
                  </div>
                )}
              </div>

              {/* Star Rating Selector */}
              <div className="text-center py-2 space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Kualitas & Rasa Snack:</span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`} />
                      </button>
                    )
                  })}
                </div>
                <span className="text-xs font-black text-amber-600 block">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulasan Anda (Rasa, Kerenyahan, Kemasan) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda menikmati snack ini. Apakah renyah, bumbu pas, dan kemasan rapi?"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800 font-medium"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengirim...
                    </>
                  ) : (
                    'Kirim Ulasan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
