import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight, Loader2, ShoppingBag } from 'lucide-react'
import { orderApi } from '../../api/orderApi'
import { useAuth } from '../../contexts/AuthContext'

export default function MyOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(true)
      orderApi.getOrders()
        .then(res => {
          if (res.success && res.data) {
            setOrders(res.data)
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [user])

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Silakan Masuk Terlebih Dahulu</h2>
        <Link to="/account" className="inline-block px-6 py-2.5 rounded-xl bg-kravo-orange text-white text-xs font-bold">
          Halaman Login
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Riwayat Transaksi Resmi</span>
        <h1 className="text-3xl font-black text-kravo-dark">Pesanan Saya</h1>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs">Memuat riwayat pesanan...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-kravo-creamBorder text-center space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Riwayat Pesanan</h3>
          <p className="text-xs text-slate-500">Anda belum pernah melakukan checkout pesanan.</p>
          <Link to="/products" className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-kravo-orange text-white text-xs font-bold">
            Mulai Belanja Snack
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-kravo-dark">{o.order_number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    o.order_type === 'b2b_wholesale' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {o.order_type === 'b2b_wholesale' ? 'B2B Wholesale' : 'B2C Retail'}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit uppercase ${
                  o.status === 'paid' || o.status === 'delivered' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : o.status === 'processing' || o.status === 'shipped'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {o.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">
                    Total ({o.items?.length || 0} varian snack)
                  </div>
                  <div className="text-xl font-black text-kravo-dark mt-0.5">
                    Rp {Number(o.grand_total).toLocaleString('id-ID')}
                  </div>
                  {o.shipment?.tracking_number && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      Resi: <strong className="font-mono text-slate-800">{o.shipment.tracking_number}</strong> ({o.shipment.courier_name})
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/order-tracking/${o.order_number}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold transition-colors"
                  >
                    Lacak Pesanan <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {o.status === 'pending_payment' && (
                    <Link
                      to={`/payment/${o.order_number}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      Bayar Sekarang
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
