import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, CreditCard, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react'

export default function PaymentPendingPage() {
  const { orderNumber } = useParams()

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-kravo-creamBorder shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Menunggu Pembayaran</span>
          <h1 className="text-2xl sm:text-3xl font-black text-kravo-dark mt-1">Selesaikan Pembayaran Anda</h1>
          <p className="text-sm text-slate-500 mt-2">
            Nomor Pesanan: <strong className="text-kravo-dark font-bold">{orderNumber || 'ORD-202611-0089'}</strong>
          </p>
        </div>

        {/* Bill Box */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Total Tagihan:</span>
            <span>Batas Waktu: 23 jam 58 menit</span>
          </div>
          <div className="text-2xl font-black text-kravo-dark">Rp 83.000</div>
          <p className="text-[11px] text-slate-500">
            Termasuk Pajak dan Biaya Ekspedisi Pengiriman Makanan Segar.
          </p>
        </div>

        {/* Midtrans Snap Button Simulator */}
        <div className="space-y-3">
          <button 
            onClick={() => alert('Memicu Midtrans Snap Sandbox Modal (VA / QRIS / GoPay)...')}
            className="w-full py-4 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all"
          >
            <CreditCard className="w-4 h-4" /> Buka Midtrans Snap Payment
          </button>

          <Link
            to={`/order-tracking/${orderNumber || 'ORD-202611-0089'}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-kravo-orange pt-2"
          >
            Cek Status Pembayaran di Halaman Tracking <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
