import React, { useState, useEffect } from 'react'
import { Plus, ShieldCheck, AlertTriangle, Clock, Loader2, Check } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

export default function BatchesPage() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // New batch form
  const [variantId, setVariantId] = useState(1)
  const [batchNumber, setBatchNumber] = useState('KB-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900 + 100))
  const [mfd, setMfd] = useState(new Date().toISOString().split('T')[0])
  const [exp, setExp] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [quantity, setQuantity] = useState(500)
  const [notes, setNotes] = useState('Dapur Produksi Oven Batch 1')
  const [submitting, setSubmitting] = useState(false)

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

  useEffect(() => {
    fetchBatches()
  }, [])

  const handleCreateBatch = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await adminApi.createBatch({
        product_variant_id: variantId,
        batch_number: batchNumber,
        manufacturing_date: mfd,
        expiry_date: exp,
        quantity: parseInt(quantity),
        notes,
      })
      if (res.success) {
        alert('Batch produksi makanan baru berhasil didaftarkan ke sistem FEFO!')
        setShowModal(false)
        fetchBatches()
      }
    } catch (err) {
      alert(err.message || 'Gagal menambahkan batch.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Food Batch Tracking & FEFO Engine</h1>
          <p className="text-xs text-slate-500">Pelacakan tanggal produksi, kedaluwarsa, dan rotasi First Expired, First Out.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Catat Batch Produksi Baru
        </button>
      </div>

      {/* Modal Add Batch */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Pendaftaran Batch Makanan Baru</h3>
              <p className="text-xs text-slate-500">Input tanggal kedaluwarsa untuk menentukan urutan prioritas FEFO otomatis.</p>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Varian Produk</label>
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  <option value={1}>KRAVO Gourmet Truffle Cassava (100g)</option>
                  <option value={2}>KRAVO Golden Cheddar Crackers (100g)</option>
                  <option value={3}>KRAVO Dark Fudge Brownie Cookies (100g)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Nomor Batch Unik</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Kuantitas Produksi (pcs)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required min={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
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
                  <label className="block text-slate-600 mb-1">Tgl Kedaluwarsa (Exp)</label>
                  <input
                    type="date"
                    value={exp}
                    onChange={(e) => setExp(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
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
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold transition-colors shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs">Memuat batch inventaris FEFO...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Nomor Batch</th>
                <th className="py-3 px-4">Varian Snack</th>
                <th className="py-3 px-4">Tgl Manufaktur</th>
                <th className="py-3 px-4">Tgl Kedaluwarsa</th>
                <th className="py-3 px-4">Sisa Kuantitas</th>
                <th className="py-3 px-4">Status Keamanan Pangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {batches.map(b => (
                <tr key={b.id}>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{b.batch_number}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {b.product_variant?.product?.name} ({b.product_variant?.name})
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{b.manufacturing_date}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{b.expiry_date}</td>
                  <td className="py-3.5 px-4 font-black">{b.current_quantity} pcs</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                      {b.status.toUpperCase()} (FEFO READY)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
