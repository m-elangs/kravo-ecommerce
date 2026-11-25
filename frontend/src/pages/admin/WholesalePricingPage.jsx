import React, { useState, useEffect } from 'react'
import { Plus, BadgePercent, Edit2, Trash2, Loader2, Save, X, AlertCircle } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

export default function WholesalePricingPage() {
  const [tiers, setTiers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingTier, setEditingTier] = useState(null)
  const [form, setForm] = useState({
    product_variant_id: '',
    min_quantity: 10,
    unit_price: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

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

  const fetchProducts = () => {
    adminApi.getProducts({ per_page: 100 })
      .then(res => {
        if (res.data) setProducts(res.data)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchTiers()
    fetchProducts()
  }, [])

  const openAddModal = () => {
    setEditingTier(null)
    const firstVariantId = products.flatMap(p => p.variants || [])[0]?.id || ''
    setForm({
      product_variant_id: firstVariantId,
      min_quantity: 10,
      unit_price: '',
    })
    setError(null)
    setShowModal(true)
  }

  const openEditTierModal = (tier) => {
    setEditingTier(tier)
    setForm({
      product_variant_id: tier.product_variant_id,
      min_quantity: tier.min_quantity,
      unit_price: tier.unit_price,
    })
    setError(null)
    setShowModal(true)
  }

  const handleSaveTier = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (editingTier) {
        await adminApi.updateTier(editingTier.id, {
          unit_price: parseFloat(form.unit_price),
          min_quantity: parseInt(form.min_quantity),
        })
        alert('Harga grosir berhasil diperbarui!')
      } else {
        await adminApi.createTier({
          product_variant_id: form.product_variant_id,
          min_quantity: parseInt(form.min_quantity),
          unit_price: parseFloat(form.unit_price),
        })
        alert('Tier harga grosir baru berhasil ditambahkan!')
      }
      setShowModal(false)
      fetchTiers()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan tier grosir.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTier = async (tierId) => {
    if (!window.confirm('Hapus aturan tier harga grosir ini?')) return
    try {
      await adminApi.deleteTier(tierId)
      alert('Tier harga grosir berhasil dihapus.')
      fetchTiers()
    } catch (e) {
      alert(e.message || 'Gagal menghapus tier.')
    }
  }

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

  const allVariants = products.flatMap(p =>
    (p.variants || []).map(v => ({ ...v, product_name: p.name }))
  )

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Wholesale Pricing & MOQ Matrix</h1>
          <p className="text-xs text-slate-500">Konfigurasi batas Minimum Order Quantity dan jenjang harga grosir B2B.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Tier Grosir
        </button>
      </div>

      {/* Modal Add / Edit Wholesale Price */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingTier ? 'Edit Harga Grosir' : 'Tambah Tier Harga Grosir Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveTier} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Pilih Produk Varian *</label>
                <select
                  disabled={!!editingTier}
                  value={form.product_variant_id}
                  onChange={(e) => setForm({ ...form, product_variant_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none disabled:opacity-60 text-slate-800 font-bold"
                  required
                >
                  <option value="">Pilih Varian Produk</option>
                  {allVariants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.product_name} - {v.name} ({v.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Minimal Kuantitas (Min Qty) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="10"
                      value={form.min_quantity}
                      onChange={(e) => setForm({ ...form, min_quantity: e.target.value })}
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-bold">pcs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Harga Satuan Grosir (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="18000"
                    value={form.unit_price}
                    onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-emerald-400 rounded-xl font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-kravo-orange hover:bg-orange-600 text-white rounded-xl shadow-md transition-colors disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Harga Grosir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs">Memuat tabel aturan harga grosir...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Produk Varian</th>
                <th className="py-3 px-4">Harga Dasar Retail</th>
                <th className="py-3 px-4">Minimal Kuantitas (Min Qty)</th>
                <th className="py-3 px-4">Harga Satuan Grosir</th>
                <th className="py-3 px-4">Diskon Grosir</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tiers.map(t => {
                const variant = t.product_variant
                const product = variant?.product

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{product?.name}</div>
                      <span className="text-[11px] text-slate-400 font-normal">{variant?.name} ({variant?.sku})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">
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
                        Hemat {t.discount_percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditTierModal(t)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Edit Harga Grosir"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Grosir
                        </button>
                        <button
                          onClick={() => handleUpdateMoq(variant?.id, variant?.minimum_order_quantity || 50)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Ubah MOQ Varian"
                        >
                          MOQ: {variant?.minimum_order_quantity || 50}
                        </button>
                        <button
                          onClick={() => handleDeleteTier(t.id)}
                          className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
