import React, { useState, useEffect } from 'react'
import { Eye, Printer, Filter, Truck, Check, Loader2 } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

export default function OrdersListPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [showResiModal, setShowResiModal] = useState(false)

  const fetchOrders = () => {
    setLoading(true)
    adminApi.getOrders()
      .then(res => {
        if (res.success && res.data) {
          setOrders(res.data)
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await adminApi.updateOrderStatus(id, status)
      if (res.success) {
        alert('Status pesanan berhasil diperbarui!')
        fetchOrders()
      }
    } catch (e) {
      alert('Gagal memperbarui status.')
    }
  }

  const handleSaveResi = async (e) => {
    e.preventDefault()
    if (!selectedOrder || !trackingNumber) return

    try {
      const res = await adminApi.updateShipment(selectedOrder.id, {
        tracking_number: trackingNumber,
        shipping_status: 'in_transit',
      })
      if (res.success) {
        alert('Nomor resi pengiriman berhasil disimpan dan pesanan ditandai sebagai SHIPPED!')
        setShowResiModal(false)
        fetchOrders()
      }
    } catch (e) {
      alert('Gagal menyimpan resi.')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Pesanan & Logistik</h1>
          <p className="text-xs text-slate-500">Pemrosesan pesanan masuk, alokasi gudang, dan pembaruan nomor resi.</p>
        </div>
      </div>

      {/* Resi Modal */}
      {showResiModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Input Nomor Resi Kurir</h3>
            <p className="text-xs text-slate-500">
              Pesanan: <strong className="font-mono">{selectedOrder.order_number}</strong> ({selectedOrder.shipment?.courier_name || 'JNE'})
            </p>

            <form onSubmit={handleSaveResi} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Nomor Resi Resmi</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                  placeholder="Contoh: JNE-9948201948 / IDH-KRG-88192"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm uppercase focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResiModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold transition-colors shadow-md"
                >
                  Simpan & Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs">Memuat daftar pesanan...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Segmen</th>
                <th className="py-3 px-4">Total Biaya</th>
                <th className="py-3 px-4">Resi Kurir</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi & Logistik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.order_number}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{o.user?.name || 'Customer'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.order_type === 'b2b_wholesale' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                      }`}>{o.order_type === 'b2b_wholesale' ? 'B2B Wholesale' : 'B2C Retail'}</span>
                  </td>
                  <td className="py-3.5 px-4 font-black">Rp {Number(o.grand_total).toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    {o.shipment?.tracking_number || <span className="text-slate-400 font-normal italic">Belum Input</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 font-bold text-[10px] uppercase text-slate-800 focus:outline-none"
                    >
                      <option value="pending_payment">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => { setSelectedOrder(o); setTrackingNumber(o.shipment?.tracking_number || ''); setShowResiModal(true); }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-kravo-orange hover:text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" /> Resi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
