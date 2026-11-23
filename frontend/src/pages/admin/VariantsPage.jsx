import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw, Component, Edit2, Trash2, X, AlertCircle, PackageCheck, Layers } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function VariantsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingVariant, setEditingVariant] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Form State
  const initialForm = {
    name: '',
    sku: '',
    retail_price: '',
    wholesale_price: '',
    weight_grams: 100,
    minimum_order_quantity: 1,
    initial_stock: 100,
    is_active: true,
  }
  const [form, setForm] = useState(initialForm)

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getProducts({ per_page: 100 })
      const prods = res.data || []
      setProducts(prods)
      if (prods.length > 0 && !selectedProductId) {
        setSelectedProductId(prods[0].id)
      }
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const allVariants = products.flatMap(p =>
    (p.variants || []).map(v => ({ ...v, product_id: p.id, product_name: p.name, category: p.category }))
  )

  const openCreateModal = () => {
    setEditingVariant(null)
    const randomSku = 'KRV-VAR-' + Math.floor(Math.random() * 9000 + 1000)
    setForm({
      name: '',
      sku: randomSku,
      retail_price: '24500',
      wholesale_price: '18000',
      weight_grams: 100,
      minimum_order_quantity: 10,
      initial_stock: 100,
      is_active: true,
    })
    if (products.length > 0) {
      setSelectedProductId(products[0].id)
    }
    setError(null)
    setShowModal(true)
  }

  const openEditModal = (v) => {
    setEditingVariant(v)
    setSelectedProductId(v.product_id)
    const currentWholesale = v.price_tiers?.[0]?.unit_price || v.priceTiers?.[0]?.unit_price || ''
    setForm({
      name: v.name || '',
      sku: v.sku || '',
      retail_price: v.retail_price || '',
      wholesale_price: currentWholesale,
      weight_grams: v.weight_grams || 100,
      minimum_order_quantity: v.minimum_order_quantity || 1,
      initial_stock: v.inventory?.available_stock ?? 0,
      is_active: v.is_active !== false,
    })
    setError(null)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!selectedProductId) {
      setError('Silakan pilih produk induk.')
      setSaving(false)
      return
    }

    try {
      const payload = {
        name: form.name,
        sku: form.sku.toUpperCase(),
        retail_price: parseFloat(form.retail_price),
        wholesale_price: form.wholesale_price ? parseFloat(form.wholesale_price) : null,
        weight_grams: parseInt(form.weight_grams),
        minimum_order_quantity: parseInt(form.minimum_order_quantity) || 1,
        is_active: form.is_active,
      }

      if (editingVariant) {
        await adminApi.updateVariant(editingVariant.id, {
          ...payload,
          stock: parseInt(form.initial_stock) >= 0 ? parseInt(form.initial_stock) : 0,
        })
        alert(`Varian ${form.name} (Harga Grosir, MOQ & Stok Gudang) berhasil diperbarui!`)
      } else {
        await adminApi.createVariant(selectedProductId, {
          ...payload,
          initial_stock: parseInt(form.initial_stock) || 100,
        })
        alert(`Varian ${form.name} berhasil ditambahkan ke produk!`)
      }

      setShowModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan varian.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteVariant = async (v) => {
    if (!window.confirm(`Hapus varian "${v.name}" (${v.sku}) dari produk "${v.product_name}"?`)) return
    try {
      await adminApi.deleteVariant(v.id)
      alert(`Varian ${v.name} berhasil dihapus.`)
      load()
    } catch (err) {
      alert(err.message || 'Gagal menghapus varian.')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manajemen Varian Kemasan & SKU</h1>
          <p className="text-xs text-slate-500">
            Daftar seluruh ukuran kemasan, SKU barcode, gramasi, harga per varian, MOQ B2B, dan stok gudang. Total: <span className="font-bold text-kravo-orange">{allVariants.length} Varian</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-kravo-orange transition-colors cursor-pointer"
            title="Segarkan data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-kravo-orange' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-kravo-orange/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Varian Baru
          </button>
        </div>
      </div>

      {/* Modal Add / Edit Variant */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingVariant ? `Edit Varian: ${editingVariant.name}` : 'Tambah Varian Baru ke Produk'}
                </h3>
                <p className="text-xs text-slate-400">Atur harga jual, gramasi berat, MOQ B2B, dan stok gudang.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Induk Produk *</label>
                <select
                  required
                  disabled={!!editingVariant}
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none disabled:opacity-60"
                >
                  <option value="">Pilih Produk Induk</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category?.name || 'Snack'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Nama Varian / Ukuran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 100g Regular Pouch"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">SKU Barcode Unik *</label>
                  <input
                    type="text"
                    required
                    placeholder="KRV-TRF-100"
                    value={form.sku}
                    onChange={(e) => setForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Harga Retail Eceran (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="24500"
                    value={form.retail_price}
                    onChange={(e) => setForm(f => ({ ...f, retail_price: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Berat Bersih (gram) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100"
                    value={form.weight_grams}
                    onChange={(e) => setForm(f => ({ ...f, weight_grams: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Highlight Box: MOQ B2B, Harga Grosir & Stok Gudang */}
              <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-kravo-dark font-bold text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-kravo-orange" />
                    <span>Pengaturan Grosir & Persediaan Gudang:</span>
                  </div>
                  {form.retail_price && form.wholesale_price && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Hemat {Math.max(0, Math.round(((parseFloat(form.retail_price) - parseFloat(form.wholesale_price)) / parseFloat(form.retail_price)) * 100))}% dari Retail
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      MOQ B2B (Grosir) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="10"
                        value={form.minimum_order_quantity}
                        onChange={(e) => setForm(f => ({ ...f, minimum_order_quantity: e.target.value }))}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-orange-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-kravo-orange/30 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-bold">pcs</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
                      Min. kuantitas beli.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Harga Grosir Satuan (Rp) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="18000"
                        value={form.wholesale_price}
                        onChange={(e) => setForm(f => ({ ...f, wholesale_price: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-emerald-400 rounded-xl font-black text-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-400/30 focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
                      Harga khusus reseller B2B.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Stok Gudang (Ready) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="100"
                        value={form.initial_stock}
                        onChange={(e) => setForm(f => ({ ...f, initial_stock: e.target.value }))}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-orange-300 rounded-xl font-extrabold text-kravo-orange focus:bg-white focus:ring-2 focus:ring-kravo-orange/30 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-bold">pcs</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
                      Unit fisik siap kirim.
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-xs font-bold bg-kravo-orange hover:bg-orange-600 text-white rounded-xl shadow-md disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : editingVariant ? 'Simpan Perubahan' : 'Tambahkan Varian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Memuat daftar varian produk...</span>
          </div>
        ) : allVariants.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <Component className="w-12 h-12 mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Belum ada varian produk</p>
            <p className="text-xs text-slate-400 mt-1">Klik tombol "Tambah Varian Baru" di atas untuk mendaftarkan varian kemasan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Produk Induk</th>
                  <th className="py-3 px-4">Nama Varian</th>
                  <th className="py-3 px-4">Berat Bersih</th>
                  <th className="py-3 px-4">Harga Retail</th>
                  <th className="py-3 px-4">MOQ B2B</th>
                  <th className="py-3 px-4">Harga Grosir</th>
                  <th className="py-3 px-4">Stok Gudang</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allVariants.map((v) => {
                  const stock = v.inventory?.available_stock ?? 0
                  const isLow = stock < 50

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[11px]">
                        {v.sku}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-bold">
                        {v.product_name}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {v.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {v.weight_grams} gram
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-kravo-dark">
                        {fmt(v.retail_price)}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => openEditModal(v)}
                          className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-kravo-orange rounded-lg transition-colors cursor-pointer"
                          title="Klik untuk ubah MOQ B2B / Stok"
                        >
                          <span className="font-bold text-xs">{v.minimum_order_quantity || 1} pcs</span>
                          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        {v.price_tiers?.[0]?.unit_price || v.priceTiers?.[0]?.unit_price ? (
                          <div className="flex items-center gap-1.5">
                            <span>{fmt(v.price_tiers?.[0]?.unit_price || v.priceTiers?.[0]?.unit_price)}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">B2B</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEditModal(v)}
                            className="text-slate-400 hover:text-emerald-700 underline text-[11px] font-semibold cursor-pointer"
                          >
                            + Set Grosir
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => openEditModal(v)}
                          className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            isLow ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                          title="Klik untuk ubah Stok Gudang / MOQ"
                        >
                          <span>{stock} pcs {isLow ? '(Menipis)' : ''}</span>
                          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(v)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-kravo-orange hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Varian, MOQ & Stok Gudang"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVariant(v)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Varian"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
