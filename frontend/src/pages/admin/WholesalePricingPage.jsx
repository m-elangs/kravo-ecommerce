import React, { useState, useEffect } from 'react'
import { Plus, BadgePercent, Edit2, Loader2, Save } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

export default function WholesalePricingPage() {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTiers = () => {
    setLoading(true)
    adminApi.getWholesalePricing()
      .then(res => {
        if (res.success && res.data) {
          setTiers(res.data)
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTiers()
  }, [])

  const handleUpdateMoq = async (variantId, currentMoq) => {
    const newMoq = prompt(`Ubah Minimum Order Quantity (MOQ) saat ini (${currentMoq} pcs):`, currentMoq)
    if (!newMoq || isNaN(newMoq)) return

    try {
      const res = await adminApi.updateMoq(variantId, parseInt(newMoq))
      if (res.success) {
        alert('MOQ varian berhasil diperbarui!')
        fetchTiers()
      }
    } catch (e) {
      alert('Gagal mengubah MOQ.')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Wholesale Pricing & MOQ Matrix</h1>
          <p className="text-xs text-slate-500">Konfigurasi batas Minimum Order Quantity dan jenjang harga grosir B2B.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs">Memuat tabel aturan harga grosir...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Produk Varian</th>
                <th className="py-3 px-4">Harga Dasar Retail</th>
                <th className="py-3 px-4">Minimal Kuantitas (Min Qty)</th>
                <th className="py-3 px-4">Harga Satuan Grosir (Unit Price)</th>
                <th className="py-3 px-4">Diskon Grosir</th>
                <th className="py-3 px-4 text-right">Kelola MOQ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tiers.map(t => {
                const variant = t.product_variant
                const product = variant?.product

                return (
                  <tr key={t.id}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {product?.name} ({variant?.name})
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      Rp {Number(variant?.retail_price || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-800">
                      &ge; {t.min_quantity} pcs
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-700">
                      Rp {Number(t.unit_price).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Diskon {t.discount_percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleUpdateMoq(variant?.id, variant?.minimum_order_quantity || 50)}
                        className="px-3 py-1 bg-slate-100 hover:bg-kravo-orange hover:text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Ubah MOQ ({variant?.minimum_order_quantity || 50} pcs)
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
