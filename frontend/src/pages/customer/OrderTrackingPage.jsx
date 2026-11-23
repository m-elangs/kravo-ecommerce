import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Search, PackageCheck, Truck, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { orderApi } from '../../api/orderApi'

export default function OrderTrackingPage() {
  const { orderNumber } = useParams()
  const [orderQuery, setOrderQuery] = useState(orderNumber || '')
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (targetOrderNo) => {
    const no = targetOrderNo || orderQuery
    if (!no) return

    setLoading(true)
    setError('')
    try {
      const res = await orderApi.trackOrder(no.trim())
      if (res.success && res.data) {
        setTrackingData(res.data)
      }
    } catch (err) {
      setError(err.message || 'Nomor pesanan tidak ditemukan. Periksa kembali nomor invoice Anda.')
      setTrackingData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderNumber) {
      handleTrack(orderNumber)
    }
  }, [orderNumber])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider">Live Status Ekspedisi</span>
        <h1 className="text-3xl font-black text-kravo-dark">Lacak Pengiriman Snack</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Masukkan nomor pesanan (contoh: <code>KRV-202611...</code>) untuk memantau status alokasi FEFO dan pengiriman.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="flex gap-2 pt-4">
          <input
            type="text"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Masukkan nomor pesanan..."
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-kravo-creamBorder text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-kravo-orange shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs sm:text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lacak'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2 max-w-xl mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Stepper View */}
      {trackingData && (
        <div className="bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-kravo-creamBorder gap-2">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nomor Pesanan Terverifikasi</div>
              <div className="font-mono font-black text-lg text-kravo-dark">{trackingData.order_number}</div>
              <span className="text-[11px] text-slate-500 font-medium">
                Segmen: <strong className="capitalize">{trackingData.order_type?.replace('_', ' ')}</strong> | Total {trackingData.total_items} item snack
              </span>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${trackingData.status === 'delivered'
                ? 'bg-emerald-100 text-emerald-800'
                : trackingData.status === 'shipped' || trackingData.status === 'processing'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-800'
                }`}>
                {trackingData.status?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-kravo-dark">Pembayaran</div>
              <div className="text-[10px] text-slate-400 font-medium">Terverifikasi Midtrans</div>
            </div>

            <div className="space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${['processing', 'shipped', 'delivered'].includes(trackingData.status) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                <PackageCheck className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-kravo-dark">Alokasi Batch FEFO</div>
              <div className="text-[10px] text-slate-400 font-medium">Dapur Produksi KRAVO</div>
            </div>

            <div className="space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${['shipped', 'delivered'].includes(trackingData.status) ? 'bg-kravo-orange text-white animate-bounce' : 'bg-slate-100 text-slate-400'
                }`}>
                <Truck className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-kravo-orange">Dalam Pengiriman</div>
              <div className="text-[10px] text-slate-400 font-medium">
                {trackingData.shipment?.tracking_number
                  ? `Resi: ${trackingData.shipment.tracking_number}`
                  : `Kurir: ${trackingData.shipment?.courier_name || 'JNE'}`}
              </div>
            </div>

            <div className="space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${trackingData.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-slate-400">Tiba di Tujuan</div>
              <div className="text-[10px] text-slate-400 font-medium">Estimasi 1-2 Hari</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
