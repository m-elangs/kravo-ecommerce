import React, { useState, useEffect } from 'react'
import { Plus, ShieldCheck, AlertTriangle, Clock, Loader2, Check, Edit2, Calendar, X, Sparkles } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

const formatCleanDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const cleanStr = String(dateStr).split('T')[0]
    const d = new Date(cleanStr)
    if (isNaN(d.getTime())) return String(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return String(dateStr)
  }
}

const getExpiryBadge = (expStr) => {
  if (!expStr) return { text: '-', className: 'bg-slate-100 text-slate-600' }
  try {
    const cleanStr = String(expStr).split('T')[0]
    const expDate = new Date(cleanStr)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    expDate.setHours(0, 0, 0, 0)

    const diffMs = expDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return {
        text: 'Expired',
        className: 'bg-rose-100 text-rose-800 border border-rose-200',
        detail: `Lewat ${Math.abs(diffDays)} hari`,
      }
    }
    if (diffDays <= 30) {
      return {
        text: `${diffDays} hari lagi`,
        className: 'bg-amber-100 text-amber-800 border border-amber-200 font-bold',
        detail: 'Segera Expired',
      }
    }
    const months = Math.floor(diffDays / 30)
    return {
      text: `${months} bulan lagi`,
      className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      detail: `${diffDays} hari tersisa`,
    }
  } catch {
    return { text: '-', className: 'bg-slate-100 text-slate-600' }
  }
}

export default function BatchesPage() {
  const [batches, setBatches] = useState([])
  const [variantsList, setVariantsList] = useState([])
  const [loading, setLoading] = useState(true)

  // New batch modal
  const [showModal, setShowModal] = useState(false)
  const [variantId, setVariantId] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [mfd, setMfd] = useState(new Date().toISOString().split('T')[0])
  const [exp, setExp] = useState(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [quantity, setQuantity] = useState(100)
  const [notes, setNotes] = useState('Dapur Produksi Oven Batch Utama')
  const [submitting, setSubmitting] = useState(false)

  // Edit batch modal
  const [editBatch, setEditBatch] = useState(null)
  const [editExp, setEditExp] = useState('')
  const [editMfd, setEditMfd] = useState('')
  const [editStatus, setEditStatus] = useState('active')
  const [editNotes, setEditNotes] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const fetchBatches = () => {
    setLoading(true)
    adminApi.getBatches()
      .then(res => {
        if (res.success && res.data) {
          setBatches(res.data)
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  const loadVariants = () => {
    adminApi.getProducts({ per_page: 50 })
      .then(res => {
        const list = res.data || []
        const flat = []
        list.forEach(p => {
          p.variants?.forEach(v => {
            flat.push({
              id: v.id,
              name: `${p.name} - ${v.name} (${v.weight_grams}g)`,
              sku: v.sku,
            })
          })
        })
        setVariantsList(flat)
        if (flat.length > 0 && !variantId) {
          setVariantId(flat[0].id)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchBatches()
    loadVariants()
  }, [])

  const openCreateModal = () => {
    setBatchNumber('KB-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9000 + 1000))
    setMfd(new Date().toISOString().split('T')[0])
    setExp(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    setQuantity(100)
    setNotes('Dapur Produksi Oven Batch Utama')
    setShowModal(true)
  }

  const handleCreateBatch = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await adminApi.createBatch({
        product_variant_id: variantId || (variantsList[0]?.id || 1),
        batch_number: batchNumber,
        manufacturing_date: mfd,
        expiry_date: exp,
        quantity: parseInt(quantity),
        notes,
      })
      if (res.success) {
        alert('✓ Batch produksi makanan baru berhasil didaftarkan ke sistem FEFO!\n✓ Stok bertambah dan pergerakan stok masuk (Stock In) telah otomatis dicatat.')
        setShowModal(false)
        fetchBatches()
      }
    } catch (err) {
      alert(err.message || 'Gagal menambahkan batch.')
    } finally {
      setSubmitting(false)
    }
  }

  // Open Edit Modal for Expiry Date
  const openEditModal = (batch) => {
    setEditBatch(batch)
    const rawExp = batch.expiry_date ? String(batch.expiry_date).split('T')[0] : ''
    const rawMfd = batch.manufacturing_date ? String(batch.manufacturing_date).split('T')[0] : ''
    setEditExp(rawExp)
    setEditMfd(rawMfd)
    setEditStatus(batch.status || 'active')
    setEditNotes(batch.notes || '')
  }

  const handleSaveBatchEdit = async (e) => {
    e.preventDefault()
    if (!editBatch) return
    setSavingEdit(true)

    try {
      const res = await adminApi.updateBatch(editBatch.id, {
        expiry_date: editExp,
        manufacturing_date: editMfd || null,
        status: editStatus,
        notes: editNotes || null,
      })
      if (res.success) {
        alert(`✓ Data tanggal kedaluwarsa batch #${editBatch.batch_number} berhasil diperbarui!`)
        setEditBatch(null)
        fetchBatches()
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal memperbarui tanggal batch.')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Food Batch Tracking & FEFO Engine</h1>
          <p className="text-xs text-slate-500">
            Pelacakan tanggal produksi, masa simpan kedaluwarsa, dan rotasi otomatis <strong>First Expired, First Out (FEFO)</strong>.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Catat Batch Produksi Baru
        </button>
      </div>

      {/* MODAL: EDIT TANGGAL KEDALUWARSA & DETAIL BATCH */}
      {editBatch && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-kravo-orange" />
                  Edit Tanggal Kedaluwarsa & Batch
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Nomor Batch: <strong className="text-slate-800">#{editBatch.batch_number}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditBatch(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Info Snippet */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500">
                Produk: <strong className="text-slate-900">{editBatch.product_variant?.product?.name} ({editBatch.product_variant?.name})</strong>
              </div>
              <div className="text-slate-500">
                Sisa Stok Batch: <strong className="text-emerald-700">{editBatch.current_quantity} pcs</strong>
              </div>
            </div>

            <form onSubmit={handleSaveBatchEdit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tanggal Manufaktur */}
                <div>
                  <label className="block text-slate-700 mb-1">Tgl Manufaktur (Produksi / Oven)</label>
                  <input
                    type="date"
                    value={editMfd}
                    onChange={(e) => setEditMfd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange font-bold text-slate-800"
                  />
                </div>

                {/* Tanggal Kedaluwarsa */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700">Tgl Kedaluwarsa (Exp) *</label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          const base = editMfd ? new Date(editMfd) : new Date()
                          base.setMonth(base.getMonth() + 6)
                          setEditExp(base.toISOString().split('T')[0])
                        }}
                        className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 cursor-pointer"
                      >
                        +6 Bln
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const base = editMfd ? new Date(editMfd) : new Date()
                          base.setFullYear(base.getFullYear() + 1)
                          setEditExp(base.toISOString().split('T')[0])
                        }}
                        className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 cursor-pointer"
                      >
                        +1 Thn
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    required
                    value={editExp}
                    onChange={(e) => setEditExp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-kravo-orange font-bold text-slate-900 ring-2 ring-kravo-orange/10"
                  />
                </div>
              </div>

              {/* Status Pangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Status Keamanan Pangan</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-slate-800"
                  >
                    <option value="active">ACTIVE (FEFO Ready)</option>
                    <option value="exhausted">EXHAUSTED (Habis Terjual)</option>
                    <option value="expired">EXPIRED (Kedaluwarsa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Catatan / Shift Produksi</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Contoh: Batch oven pagi, kemasan baru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditBatch(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold transition-colors shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan Tanggal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BATCH */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Pendaftaran Batch Makanan Baru</h3>
              <p className="text-xs text-slate-500">
                Input tanggal produksi & kedaluwarsa untuk rotasi algoritma FEFO dan pencatatan stok masuk otomatis.
              </p>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Pilih Varian Produk Snack *</label>
                {variantsList.length > 0 ? (
                  <select
                    value={variantId}
                    onChange={(e) => setVariantId(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-slate-800"
                  >
                    {variantsList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.sku})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={variantId}
                    onChange={(e) => setVariantId(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    <option value={1}>KRAVO Gourmet Truffle Cassava (100g)</option>
                    <option value={2}>KRAVO Golden Cheddar Crackers (100g)</option>
                    <option value={3}>KRAVO Dark Fudge Brownie Cookies (100g)</option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Nomor Batch Unik</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Kuantitas Produksi (pcs)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    min={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Tgl Manufaktur (Oven)</label>
                  <input
                    type="date"
                    value={mfd}
                    onChange={(e) => setMfd(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600">Tgl Kedaluwarsa (Exp)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(mfd)
                        d.setMonth(d.getMonth() + 6)
                        setExp(d.toISOString().split('T')[0])
                      }}
                      className="text-[10px] text-amber-700 font-bold underline"
                    >
                      +6 Bln
                    </button>
                  </div>
                  <input
                    type="date"
                    value={exp}
                    onChange={(e) => setExp(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Catatan Batch / Shift Dapur</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Table List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs font-bold">Memuat batch inventaris FEFO...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nomor Batch</th>
                <th className="py-3 px-4">Varian Snack</th>
                <th className="py-3 px-4">Tgl Manufaktur</th>
                <th className="py-3 px-4">Tgl Kedaluwarsa</th>
                <th className="py-3 px-4">Sisa Kuantitas</th>
                <th className="py-3 px-4">Status Keamanan Pangan</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada batch produksi makanan yang terdaftar.
                  </td>
                </tr>
              ) : (
                batches.map((b) => {
                  const expBadge = getExpiryBadge(b.expiry_date)
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[11px]">
                        #{b.batch_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {b.product_variant?.product?.name || 'Snack KRAVO'}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          {b.product_variant?.name} ({b.product_variant?.weight_grams}g)
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatCleanDate(b.manufacturing_date)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{formatCleanDate(b.expiry_date)}</span>
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${expBadge.className}`}>
                            {expBadge.text}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {b.current_quantity} pcs
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {b.status ? b.status.toUpperCase() : 'ACTIVE'} (FEFO READY)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(b)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          title="Edit Tanggal Kedaluwarsa & Detail Batch"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-kravo-orange" />
                          <span>Edit Tgl Exp</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
