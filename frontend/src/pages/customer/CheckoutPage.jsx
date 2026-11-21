import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Truck, CreditCard, ShieldCheck, ArrowRight, AlertCircle, Loader2, Store } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { checkoutApi } from '../../api/checkoutApi'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, fetchCart } = useCart()
  const { user, isApprovedReseller } = useAuth()

  const [courier, setCourier] = useState('JNE Reguler')
  const [voucherCode, setVoucherCode] = useState('KRAVOFRESH')
  const [notes, setNotes] = useState('')
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Shipping form fields
  const [recipientName, setRecipientName] = useState(user?.name || 'Budi Santoso')
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '081234567890')
  const [streetAddress, setStreetAddress] = useState('Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan')

  // Run backend calculation preview
  useEffect(() => {
    if (items.length === 0) return

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
  }, [items, courier, voucherCode])

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Silakan masuk ke akun Anda terlebih dahulu sebelum menyelesaikan pesanan.')
      navigate('/account')
      return
    }

    if (items.length === 0) {
      alert('Keranjang belanja kosong.')
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
        // Refresh/clear cart
        await fetchCart()
        navigate(`/payment/${res.data.order.order_number}`)
      }
    } catch (err) {
      setError(err.message || 'Gagal memproses checkout. Silakan periksa kembali pesanan Anda.')
    } finally {
      setSubmitting(false)
    }
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
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Checkout Aman Server-Side</span>
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
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    courier === c.id 
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

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-kravo-orange" />
              <span className="text-[11px]">Menghitung harga server...</span>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Produk</span>
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
            disabled={submitting || loading}
            className="w-full py-4 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all disabled:opacity-50"
          >
            {submitting ? 'Memproses Pesanan...' : 'Bayar via Midtrans Snap'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
