import React, { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import {
  Clock,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  Building2,
  Sparkles
} from 'lucide-react'
import { orderApi } from '../../api/orderApi'

const PAYMENT_METHODS = [
  { id: 'qris_midtrans', name: 'QRIS Real-Time (GoPay, OVO, Dana, ShopeePay)', icon: QrCode },
  { id: 'bca_va', name: 'BCA Virtual Account (VA 8992019482)', icon: Building2 },
  { id: 'mandiri_bill', name: 'Mandiri Bill Payment (Perusahaan 70012)', icon: Building2 },
  { id: 'bni_va', name: 'BNI Virtual Account (VA 9882019482)', icon: Building2 },
  { id: 'credit_card', name: 'Kartu Kredit / Debit Online (Midtrans 3DS)', icon: CreditCard },
]

export default function PaymentPendingPage() {
  const { orderNumber } = useParams()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [paidSuccess, setPaidSuccess] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('qris_midtrans')

  const fetchOrder = () => {
    if (!orderNumber) return
    setLoading(true)
    orderApi.getOrder(orderNumber)
      .then(res => {
        if (res.success && res.data) {
          setOrder(res.data)
          if (res.data.status === 'paid' || res.data.status === 'processing' || res.data.status === 'shipped' || res.data.status === 'delivered') {
            setPaidSuccess(true)
          }
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (searchParams.get('status') === 'success') {
      setPaidSuccess(true)
    }
    fetchOrder()
  }, [orderNumber])

  // Direct Database Payment Confirmation for Sandbox
  const handleConfirmPayment = async () => {
    if (!order) return
    setSimulating(true)
    try {
      const res = await orderApi.confirmPayment(order.order_number, {
        payment_type: selectedMethod,
        transaction_id: 'TRX-MID-' + Math.floor(Math.random() * 9000000 + 1000000),
      })

      if (res && res.success !== false) {
        setPaidSuccess(true)
        alert('Pembayaran Midtrans Sandbox Berhasil! Status pesanan kini PAID & diproses.')
        fetchOrder()
      } else {
        alert(res?.message || 'Gagal memverifikasi pembayaran.')
      }
    } catch (e) {
      alert(e?.message || 'Gagal memverifikasi pembayaran.')
    } finally {
      setSimulating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
        <span className="text-xs">Memuat status pesanan & tagihan...</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-kravo-creamBorder shadow-xl space-y-6">
        {paidSuccess || (order && order.status !== 'pending_payment') ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Pembayaran Diterima & Lunas</span>
              <h1 className="text-2xl sm:text-3xl font-black text-kravo-dark mt-1">Pesanan Anda Sedang Diproses</h1>
              <p className="text-xs text-slate-500 mt-2">
                Nomor Pesanan: <strong className="text-kravo-dark font-mono font-bold">{orderNumber}</strong>
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Status Pesanan:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                  {order?.status || 'PAID'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Pembayaran:</span>
                <span className="font-bold text-slate-900">Rp {Number(order?.grand_total || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Metode Pembayaran:</span>
                <span className="font-bold uppercase text-indigo-700">{order?.payment?.payment_type || 'Midtrans Sandbox'}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Nomor Transaksi:</span>
                <span className="font-mono text-slate-700">{order?.payment?.transaction_id || ('TRX-' + orderNumber)}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 text-left space-y-1 font-medium">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Alokasi Batch FEFO Terkunci:
              </div>
              <p>Stok segar telah diamankan langsung dari dapur produksi KRAVO. Petugas gudang sedang menyiapkan pengemasan pesanan Anda.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to={`/order-tracking/${orderNumber}`}
                className="flex-1 py-3.5 px-6 rounded-xl bg-kravo-dark hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                Lacak Pengiriman Pesanan <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/account/orders"
                className="flex-1 py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                Lihat Riwayat Pesanan
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Menunggu Pembayaran</span>
              <h1 className="text-2xl sm:text-3xl font-black text-kravo-dark mt-1">Selesaikan Tagihan Anda</h1>
              <p className="text-xs text-slate-500 mt-2">
                Nomor Pesanan: <strong className="text-kravo-dark font-mono font-bold">{orderNumber}</strong>
              </p>
            </div>

            {/* Bill Box */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Total Tagihan:</span>
                <span>Batas Waktu: 23 jam 59 menit</span>
              </div>
              <div className="text-2xl font-black text-kravo-dark">
                Rp {order ? Number(order.grand_total).toLocaleString('id-ID') : '0'}
              </div>
              <p className="text-[11px] text-slate-500">
                Metode Pembayaran: Midtrans Snap Sandbox (BCA/Mandiri/BNI/BRI VA, QRIS, GoPay, Kartu Kredit).
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="text-left space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Pilih Saluran Pembayaran Sandbox:</label>
              <div className="space-y-1.5">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon
                  const isSelected = selectedMethod === m.id

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-kravo-orange bg-kravo-orange/5 ring-2 ring-kravo-orange/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-kravo-orange text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{m.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Midtrans Snap Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleConfirmPayment}
                disabled={simulating}
                className="w-full py-4 px-6 rounded-xl bg-kravo-orange hover:bg-orange-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {simulating ? 'Memverifikasi ke Database...' : 'Bayar Sekarang (Konfirmasi Pembayaran Midtrans)'}
              </button>

              <Link
                to={`/order-tracking/${orderNumber}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-kravo-orange pt-2"
              >
                Lihat Status di Halaman Tracking <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
