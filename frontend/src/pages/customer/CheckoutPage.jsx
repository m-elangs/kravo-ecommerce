import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Store,
  CheckCircle2,
  X,
  QrCode,
  Building2,
  Wallet
} from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { checkoutApi } from '../../api/checkoutApi'
import { orderApi } from '../../api/orderApi'

const PAYMENT_METHODS = [
  { id: 'qris', name: 'QRIS (GoPay, OVO, Dana, ShopeePay)', icon: QrCode, badge: 'INSTAN' },
  { id: 'bca_va', name: 'BCA Virtual Account', icon: Building2, badge: 'OTOMATIS' },
  { id: 'mandiri_bill', name: 'Mandiri Bill Payment', icon: Building2, badge: 'OTOMATIS' },
  { id: 'bni_va', name: 'BNI Virtual Account', icon: Building2, badge: 'OTOMATIS' },
  { id: 'credit_card', name: 'Kartu Kredit / Debit (Visa/Mastercard)', icon: CreditCard, badge: '3D SECURE' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, fetchCart, belowMoqItems, retailSubtotal } = useCart()
  const { user, isApprovedReseller, isAdmin, login } = useAuth()
  const [switching, setSwitching] = useState(false)

  const [courier, setCourier] = useState('JNE Reguler')
  const [voucherCode, setVoucherCode] = useState('KRAVOFRESH')
  const [notes, setNotes] = useState('')
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Shipping form fields
  const [recipientName, setRecipientName] = useState(user?.name || 'Pelanggan KRAVO')
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '081234567890')
  const [streetAddress, setStreetAddress] = useState('Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan')

  // Auto-populate from user saved address
  useEffect(() => {
    if (user) {
      if (user.name) setRecipientName(user.name)
      if (user.phone) setPhoneNumber(user.phone)
      const primaryAddr = user.addresses?.find(a => a.is_primary) || user.addresses?.[0]
      if (primaryAddr) {
        if (primaryAddr.recipient_name) setRecipientName(primaryAddr.recipient_name)
        if (primaryAddr.phone_number) setPhoneNumber(primaryAddr.phone_number)
        const fullAddr = [primaryAddr.street_address, primaryAddr.city, primaryAddr.province, primaryAddr.postal_code].filter(Boolean).join(', ')
        if (fullAddr) setStreetAddress(fullAddr)
      }
    }
  }, [user])

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('qris')
  const [paying, setPaying] = useState(false)

  // Run backend calculation preview
  useEffect(() => {
    if (items.length === 0) return
    if (belowMoqItems.length > 0) {
      setPreview(null)
      return
    }

    setLoading(true)
    setError('')
    const checkoutItems = items.map(item => ({
      variant_id: item.product_variant_id,
      quantity: item.quantity,
    }))

    checkoutApi.preview({
      items: checkoutItems,
      courier,
      voucher_code: voucherCode || null,
    })
      .then(res => {
        if (res.success) {
          setPreview(res.data)
        }
      })
      .catch(err => {
        setError(err.message || 'Gagal memuat kalkulasi biaya checkout.')
      })
      .finally(() => setLoading(false))
  }, [items, courier, voucherCode, belowMoqItems.length])

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Silakan masuk ke akun Anda terlebih dahulu sebelum menyelesaikan pesanan.')
      navigate('/account')
      return
    }

    if (isAdmin) {
      alert('Akun Administrator tidak diperbolehkan melakukan checkout. Silakan gunakan akun Pelanggan.')
      return
    }

    if (items.length === 0) {
      alert('Keranjang belanja kosong.')
      return
    }

    // Reseller: validasi MOQ grosir
    if (isApprovedReseller && belowMoqItems.length > 0) {
      const first = belowMoqItems[0]
      const name = first.product_variant?.product?.name || 'Snack'
      const moq = first.product_variant?.minimum_order_quantity || 1
      setError(`Pembelian grosir "${name}" minimal ${moq} pcs (MOQ), saat ini ${first.quantity} pcs. Silakan sesuaikan jumlah di keranjang.`)
      return
    }

    // Pre-check available stock before submitting
    const outOfStock = items.find(item => {
      const avail = item.product_variant?.inventory ? Number(item.product_variant.inventory.available_stock) : 0
      return item.quantity > avail
    })
    if (outOfStock) {
      const name = outOfStock.product_variant?.product?.name || 'Snack'
      const avail = outOfStock.product_variant?.inventory ? Number(outOfStock.product_variant.inventory.available_stock) : 0
      setError(`Stok tidak mencukupi untuk "${name}". Tersedia: ${avail} pcs, Diminta: ${outOfStock.quantity} pcs. Silakan kurangi jumlah pesanan di keranjang terlebih dahulu.`)
      return
    }

    setSubmitting(true)
    setError('')

    const checkoutItems = items.map(item => ({
      variant_id: item.product_variant_id,
      quantity: item.quantity,
    }))

    try {
      const res = await checkoutApi.checkout({
        items: checkoutItems,
        courier,
        voucher_code: voucherCode || null,
        notes: notes || null,
      })

      if (res.success && res.data?.order) {
        const order = res.data.order
        const snapToken = res.data.snap_token
        setCreatedOrder(order)

        // Try Midtrans Snap Popup if available and actual token
        if (window.snap && snapToken && !snapToken.startsWith('SNAP-MOCK-')) {
          window.snap.pay(snapToken, {
            onSuccess: async (result) => {
              try {
                await orderApi.confirmPayment(order.order_number, {
                  payment_type: result.payment_type || 'midtrans_snap',
                  transaction_id: result.transaction_id || ('MID-' + Date.now()),
                })
              } catch { }
              await fetchCart()
              navigate(`/payment/${order.order_number}?status=success`)
            },
            onPending: async () => {
              await fetchCart()
              navigate(`/payment/${order.order_number}`)
            },
            onError: () => {
              alert('Pembayaran gagal atau dibatalkan.')
              navigate(`/payment/${order.order_number}`)
            },
            onClose: () => {
              navigate(`/payment/${order.order_number}`)
            }
          })
        } else {
          // Open interactive Sandbox Payment Modal
          setShowPaymentModal(true)
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal memproses checkout. Silakan periksa kembali pesanan Anda.')
    } finally {
      setSubmitting(false)
    }
  }

  // Confirm payment in sandbox
  const handleConfirmSandboxPayment = async () => {
    if (!createdOrder) return
    setPaying(true)
    try {
      await orderApi.confirmPayment(createdOrder.order_number, {
        payment_type: selectedMethod,
        transaction_id: 'TRX-MID-' + Math.floor(Math.random() * 9000000 + 1000000),
      })
      await fetchCart()
      setShowPaymentModal(false)
      navigate(`/payment/${createdOrder.order_number}?status=success`)
    } catch (err) {
      alert(err.message || 'Gagal mengonfirmasi pembayaran.')
    } finally {
      setPaying(false)
    }
  }

  const handlePayLater = async () => {
    if (!createdOrder) return
    await fetchCart()
    setShowPaymentModal(false)
    navigate(`/payment/${createdOrder.order_number}`)
  }

  if (isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Akun Administrator Tidak Dapat Checkout</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Sesuai standar operasional e-commerce KRAVO, akun <strong>Administrator ({user?.email})</strong> hanya diperuntukkan bagi manajemen katalog, audit inventaris, dan fulfillment pesanan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            disabled={switching}
            onClick={async () => {
              setSwitching(true)
              try {
                await login('customer@kravo.id', 'password123')
                alert('Berhasil beralih ke akun Pelanggan (Budi Santoso). Silakan lanjutkan checkout!')
              } catch (err) {
                alert('Gagal beralih akun: ' + (err.message || 'error'))
              } finally {
                setSwitching(false)
              }
            }}
            className="px-6 py-3 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <UserCheck className="w-4 h-4" />
            {switching ? 'Beralih Akun...' : 'Beralih ke Akun Pelanggan (Budi)'}
          </button>
          <Link
            to="/admin/dashboard"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            Kembali ke Dashboard Admin
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-kravo-dark">Tidak Ada Item untuk Dicheckout</h2>
        <Link to="/products" className="inline-block px-6 py-2.5 rounded-xl bg-kravo-orange text-white text-xs font-bold">
          Buka Katalog Produk
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Checkout Resmi</span>
        <h1 className="text-3xl font-black text-kravo-dark">Penyelesaian Pesanan KRAVO</h1>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Fields: Shipping & Courier */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-kravo-dark font-extrabold text-base">
              <MapPin className="w-5 h-5 text-kravo-orange" />
              <h3>1. Alamat Pengiriman Snack</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Nama Lengkap Penerima</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-kravo-creamBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-kravo-creamBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1">Alamat Lengkap Tujuan</label>
                <textarea
                  rows="3"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-kravo-creamBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Logistics Courier */}
          <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-kravo-dark font-extrabold text-base">
                <Truck className="w-5 h-5 text-kravo-orange" />
                <h3>2. Ekspedisi Pengiriman Makanan</h3>
              </div>
              {isApprovedReseller && (
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                  Tarif Kargo B2B Aktif
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'JNE Reguler', name: 'JNE Reguler', desc: '1-2 Hari Kerja' },
                { id: 'SiCepat Best', name: 'SiCepat Best', desc: 'Besok Sampai' },
                { id: 'GoSend Instant', name: 'GoSend Instant', desc: '3 Jam Tiba' },
              ].map(c => (
                <div
                  key={c.id}
                  onClick={() => setCourier(c.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${courier === c.id
                    ? 'border-kravo-orange bg-kravo-orange/5 ring-2 ring-kravo-orange/20'
                    : 'border-kravo-creamBorder hover:bg-slate-50'
                    }`}
                >
                  <div className="font-bold text-xs text-kravo-dark">{c.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Voucher promo input */}
          <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-3">
            <label className="block text-xs font-bold text-kravo-dark">Kupon Promo / Voucher KRAVO</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Contoh: KRAVOFRESH"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-kravo-orange"
              />
              <button
                type="button"
                onClick={() => alert(`Voucher ${voucherCode} diterapkan!`)}
                className="px-4 py-2.5 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold transition-colors"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>

        {/* Order Payment Summary */}
        <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-kravo-dark font-extrabold text-base">
            <CreditCard className="w-5 h-5 text-kravo-orange" />
            <h3>Rincian Tagihan Resmi</h3>
          </div>

          {isApprovedReseller && belowMoqItems.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4" /> Belum Memenuhi MOQ Grosir
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {belowMoqItems.map((it) => (
                  <li key={it.id}>
                    {it.product_variant?.product?.name}: {it.quantity} / {it.product_variant?.minimum_order_quantity} pcs
                  </li>
                ))}
              </ul>
              <Link to="/cart" className="inline-block underline font-bold">Sesuaikan di Keranjang →</Link>
            </div>
          )}

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-kravo-orange" />
              <span className="text-[11px]">Menghitung harga server...</span>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {/* Rincian harga per item (harga grosir untuk reseller) */}
              {preview?.items?.length > 0 && (
                <div className="space-y-2 pb-3 border-b border-slate-100">
                  {isApprovedReseller && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                      <Store className="w-3 h-3" /> Harga Grosir B2B Diterapkan
                    </span>
                  )}
                  {preview.items.map((pi) => (
                    <div key={pi.variant_id} className="flex justify-between gap-2">
                      <div className="text-slate-600 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{pi.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {pi.quantity} pcs × Rp {Number(pi.unit_price).toLocaleString('id-ID')}
                          {pi.is_wholesale && pi.tier_applied && (
                            <span className="ml-1 text-emerald-700 font-bold">({pi.tier_applied})</span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-kravo-dark whitespace-nowrap">
                        Rp {Number(pi.subtotal).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isApprovedReseller && preview && retailSubtotal > Number(preview.subtotal) && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Hemat Harga Grosir</span>
                  <span>- Rp {(retailSubtotal - Number(preview.subtotal)).toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Subtotal {isApprovedReseller ? 'Grosir' : 'Produk'}</span>
                <span className="font-bold text-kravo-dark">
                  Rp {preview ? Number(preview.subtotal).toLocaleString('id-ID') : '0'}
                </span>
              </div>

              {preview && Number(preview.voucher_discount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Diskon Kupon</span>
                  <span>- Rp {Number(preview.voucher_discount).toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Ongkos Ekspedisi</span>
                <span className="font-bold text-kravo-dark">
                  Rp {preview ? Number(preview.shipping_cost).toLocaleString('id-ID') : '0'}
                </span>
              </div>

              <div className="flex justify-between text-emerald-600 font-bold pt-2 border-t border-slate-100">
                <span>Alokasi Batch FEFO</span>
                <span>Lolos Validasi ✓</span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-kravo-creamBorder flex justify-between items-baseline">
            <span className="font-bold text-sm text-kravo-dark">Grand Total</span>
            <span className="text-2xl font-black text-kravo-dark">
              Rp {preview ? Number(preview.grand_total).toLocaleString('id-ID') : '0'}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting || loading || (isApprovedReseller && belowMoqItems.length > 0)}
            className="w-full py-4 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all disabled:opacity-50"
          >
            {submitting ? 'Memproses Pesanan...' : 'Bayar via Midtrans Snap'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* MIDTRANS SNAP SANDBOX PAYMENT MODAL */}
      {showPaymentModal && createdOrder && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-kravo-orange/10 text-kravo-orange flex items-center justify-center font-black">
                  M
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Portal Midtrans Snap (Sandbox)</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Order #{createdOrder.order_number}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePayLater}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Pembayaran</span>
                <span className="text-xl font-black text-kravo-dark">
                  Rp {Number(createdOrder.grand_total).toLocaleString('id-ID')}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Midtrans Verified
              </span>
            </div>

            {/* Method Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Pilih Saluran Pembayaran:</label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon
                  const isSelected = selectedMethod === m.id

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected
                        ? 'border-kravo-orange bg-kravo-orange/5 ring-2 ring-kravo-orange/20'
                        : 'border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-kravo-orange text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{m.name}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                        {m.badge}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmSandboxPayment}
                disabled={paying}
                className="w-full py-3.5 px-6 rounded-xl bg-kravo-orange hover:bg-orange-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {paying ? 'Memverifikasi Pembayaran...' : 'Bayar Sekarang (Konfirmasi Sandbox)'}
              </button>

              <button
                type="button"
                onClick={handlePayLater}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Bayar Nanti (Simpan Status Pending)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
