import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertTriangle, Boxes, ArrowUpDown, Edit3, ArrowRightLeft, X, CheckCircle2, Info, Search, Sliders, Check, ShieldCheck } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('stock')
  const [lowOnly, setLowOnly] = useState(false)
  const [search, setSearch] = useState('')

  // Edit Stock Modal State
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({
    available_stock: 0,
    reserved_stock: 0,
    low_stock_threshold: 20,
  })
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  // Quick Release Reserved Modal State
  const [releaseItem, setReleaseItem] = useState(null)
  const [releaseAmount, setReleaseAmount] = useState(0)
  const [releasing, setReleasing] = useState(false)
  const [releaseError, setReleaseError] = useState('')

  // Global Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const loadStock = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getInventory({
        low_stock: lowOnly ? 1 : undefined,
        search: search || undefined,
      })
      const list = res.data?.data || res.data || []
      setInventory(Array.isArray(list) ? list : [])
    } catch {
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  const loadMovements = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getStockMovements()
      const list = res.data?.data || res.data || []
      setMovements(Array.isArray(list) ? list : [])
    } catch {
      setMovements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    tab === 'stock' ? loadStock() : loadMovements()
  }, [tab, lowOnly])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadStock()
  }

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditItem(item)
    setEditForm({
      available_stock: item.quantity_available,
      reserved_stock: item.quantity_reserved,
      low_stock_threshold: item.reorder_point,
    })
    setModalError('')
  }

  // Save Stock Edit
  const handleSaveStock = async (e) => {
    e.preventDefault()
    if (!editItem) return
    setSaving(true)
    setModalError('')

    try {
      const res = await adminApi.updateInventory(editItem.id, {
        available_stock: parseInt(editForm.available_stock) || 0,
        reserved_stock: parseInt(editForm.reserved_stock) || 0,
        low_stock_threshold: parseInt(editForm.low_stock_threshold) || 0,
      })

      if (res.success) {
        showToast(res.message || 'Stok inventaris berhasil diperbarui!')
        setEditItem(null)
        loadStock()
      } else {
        setModalError(res.message || 'Gagal menyimpan stok.')
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Gagal memperbarui stok.')
    } finally {
      setSaving(false)
    }
  }

  // Open Quick Release Reserved Modal
  const openReleaseModal = (item) => {
    setReleaseItem(item)
    setReleaseAmount(item.quantity_reserved)
    setReleaseError('')
  }

  // Execute Release Reserved to Available
  const handleExecuteRelease = async (e) => {
    e.preventDefault()
    if (!releaseItem) return
    setReleasing(true)
    setReleaseError('')

    const amount = parseInt(releaseAmount)
    if (!amount || amount <= 0) {
      setReleaseError('Jumlah pcs yang dipindahkan harus lebih dari 0.')
      setReleasing(false)
      return
    }

    try {
      const res = await adminApi.releaseReservedStock(releaseItem.id, { amount })
      if (res.success) {
        showToast(res.message || 'Stok reserved berhasil dialihkan ke stok tersedia!')
        setReleaseItem(null)
        loadStock()
      } else {
        setReleaseError(res.message || 'Gagal memindahkan stok.')
      }
    } catch (err) {
      setReleaseError(err.response?.data?.message || err.message || 'Gagal memindahkan stok.')
    } finally {
      setReleasing(false)
    }
  }

  const TAB_CLS = (t) =>
    `px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
      tab === t ? 'bg-kravo-dark text-white' : 'text-slate-500 hover:bg-slate-100'
    }`

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Inventaris Gudang KRAVO</h1>
          <p className="text-xs text-slate-500">
            Kelola stok fisik siap jual, stok reserved cadangan pesanan, dan ambang batas Reorder Point.
          </p>
        </div>
        <button
          onClick={() => (tab === 'stock' ? loadStock() : loadMovements())}
          className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-kravo-orange rounded-xl shadow-sm transition-colors flex items-center gap-2 text-xs font-bold self-start sm:self-auto cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Reorder Point Educational Callout Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block text-blue-950">Panduan Istilah Stok Gudang:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-blue-800 leading-relaxed pt-1">
            <div className="bg-white/60 p-2.5 rounded-xl border border-blue-100">
              <strong className="text-blue-950 block mb-0.5">1. Stok Tersedia (Available):</strong>
              Jumlah fisik di rak gudang yang aktif dan siap dibeli oleh customer retail atau reseller grosir di website.
            </div>
            <div className="bg-white/60 p-2.5 rounded-xl border border-blue-100">
              <strong className="text-blue-950 block mb-0.5">2. Stok Reserved:</strong>
              Stok yang sedang dikunci untuk pesanan pelanggan (menunggu pembayaran / packing). Anda dapat memindahkannya kembali ke stok tersedia kapan saja.
            </div>
            <div className="bg-white/60 p-2.5 rounded-xl border border-blue-100">
              <strong className="text-blue-950 block mb-0.5">3. Reorder Point:</strong>
              Ambang batas minimum stok aman. Jika <strong>Stok Tersedia ≤ Reorder Point</strong>, sistem otomatis menandai status menjadi <strong>Low Stock</strong> sebagai sinyal memasak / produksi batch baru.
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <button className={TAB_CLS('stock')} onClick={() => setTab('stock')}>
            Stok Varian ({inventory.length})
          </button>
          <button className={TAB_CLS('movements')} onClick={() => setTab('movements')}>
            Riwayat Pergerakan
          </button>
        </div>

        {tab === 'stock' && (
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Cari produk / SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-kravo-orange w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <input
                type="checkbox"
                checked={lowOnly}
                onChange={(e) => setLowOnly(e.target.checked)}
                className="accent-kravo-orange cursor-pointer"
              />
              <span>Hanya Stok Rendah</span>
            </label>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'stock' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Produk & Varian</th>
                  <th className="py-3 px-4 text-emerald-800">Stok Tersedia</th>
                  <th className="py-3 px-4 text-amber-800">Stok Reserved</th>
                  <th className="py-3 px-4 text-blue-800">Reorder Point</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada data inventaris yang cocok.
                    </td>
                  </tr>
                ) : (
                  inventory.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[11px]">
                        {i.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{i.product_name}</div>
                        <div className="text-slate-400 text-[10px]">{i.variant_name}</div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        {i.quantity_available} pcs
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-600">
                        <div className="flex items-center gap-1.5">
                          <span>{i.quantity_reserved} pcs</span>
                          {i.quantity_reserved > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Ada stok reserved" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        {i.reorder_point} pcs
                      </td>
                      <td className="py-3.5 px-4">
                        {i.is_low_stock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3" /> Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Tombol Edit Stok */}
                          <button
                            type="button"
                            onClick={() => openEditModal(i)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                            title="Edit Stok & Reorder Point"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-kravo-orange" />
                            <span>Edit Stok</span>
                          </button>

                          {/* Tombol Pindah Reserved ke Tersedia */}
                          {i.quantity_reserved > 0 && (
                            <button
                              type="button"
                              onClick={() => openReleaseModal(i)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                              title="Pindahkan stok reserved ke stok siap jual"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span>Pindah ke Tersedia</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Produk & Varian</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Tipe Pergerakan</th>
                  <th className="py-3 px-4">Jumlah (Qty)</th>
                  <th className="py-3 px-4">Referensi</th>
                  <th className="py-3 px-4">Keterangan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Belum ada riwayat pergerakan stok tercatat.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {m.created_at}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{m.product_name}</span>
                        <span className="text-slate-400 text-[10px]">{m.variant}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        {m.batch_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.type === 'in'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.type === 'in' ? '▲ STOK MASUK' : '▼ STOK KELUAR'}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 font-black ${
                          m.type === 'in' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {m.type === 'in' ? '+' : '-'}{m.quantity} pcs
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                        {m.reference}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">{m.notes ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: EDIT STOK & REORDER POINT */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-kravo-orange block">
                  Penyesuaian Inventaris Fisik
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {editItem.product_name}
                </h3>
                <p className="text-xs text-slate-500">
                  {editItem.variant_name} • SKU: <code className="font-mono">{editItem.sku}</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {modalError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveStock} className="space-y-4 text-xs font-semibold">
              {/* Stok Tersedia */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Stok Tersedia (Available Stock) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={editForm.available_stock}
                    onChange={(e) =>
                      setEditForm({ ...editForm, available_stock: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange font-bold text-slate-900 text-sm"
                  />
                  <span className="absolute right-3.5 top-3 text-slate-400 text-xs">pcs</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Stok fisik di rak gudang yang aktif dan siap dijual kepada pembeli retail maupun reseller.
                </p>
              </div>

              {/* Stok Reserved */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">
                    Stok Reserved (Cadangan Pesanan) *
                  </label>
                  {parseInt(editForm.reserved_stock) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const res = parseInt(editForm.reserved_stock) || 0
                        setEditForm({
                          ...editForm,
                          available_stock: (parseInt(editForm.available_stock) || 0) + res,
                          reserved_stock: 0,
                        })
                      }}
                      className="text-[11px] text-amber-600 hover:text-amber-700 underline font-bold cursor-pointer"
                    >
                      Pindahkan Semua ke Tersedia
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={editForm.reserved_stock}
                    onChange={(e) =>
                      setEditForm({ ...editForm, reserved_stock: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange font-bold text-slate-900 text-sm"
                  />
                  <span className="absolute right-3.5 top-3 text-slate-400 text-xs">pcs</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Stok yang ditahan untuk pesanan aktif (menunggu bayar atau packing).
                </p>
              </div>

              {/* Reorder Point */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Reorder Point (Ambang Batas Peringatan Minimum) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={editForm.low_stock_threshold}
                    onChange={(e) =>
                      setEditForm({ ...editForm, low_stock_threshold: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange font-bold text-slate-900 text-sm"
                  />
                  <span className="absolute right-3.5 top-3 text-slate-400 text-xs">pcs</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Jika <strong>Stok Tersedia ≤ Reorder Point</strong>, status otomatis berubah menjadi <strong>Low Stock</strong> untuk mengingatkan tim produksi memasak batch baru.
                </p>
              </div>

              {/* Live Status Calculation Preview */}
              <div className="p-3.5 rounded-xl bg-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Total Stok Fisik Gudang:</span>
                <span className="font-bold text-slate-900">
                  {(parseInt(editForm.available_stock) || 0) + (parseInt(editForm.reserved_stock) || 0)} pcs
                </span>
              </div>

              <div className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Prediksi Status:</span>
                {(parseInt(editForm.available_stock) || 0) <= (parseInt(editForm.low_stock_threshold) || 0) ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px]">
                    ⚠️ Low Stock (Perlu Produksi Ulang)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                    ✓ Stok Aman
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold transition-all shadow-md shadow-kravo-orange/30 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK RELEASE RESERVED TO AVAILABLE */}
      {releaseItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Pindahkan Stok Reserved</h3>
                  <p className="text-[11px] text-slate-500">{releaseItem.product_name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReleaseItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {releaseError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {releaseError}
              </div>
            )}

            <form onSubmit={handleExecuteRelease} className="space-y-4 text-xs font-semibold">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <span className="font-bold block">Status Stok Saat Ini:</span>
                <div className="flex justify-between text-[11px]">
                  <span>Stok Reserved:</span>
                  <strong className="text-amber-800">{releaseItem.quantity_reserved} pcs</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Stok Tersedia Saat Ini:</span>
                  <strong className="text-emerald-800">{releaseItem.quantity_available} pcs</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Jumlah pcs yang ingin dipindahkan ke Stok Tersedia:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={releaseItem.quantity_reserved}
                    value={releaseAmount}
                    onChange={(e) => setReleaseAmount(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 font-bold text-slate-900 text-base"
                  />
                  <span className="absolute right-3.5 top-3 text-slate-400 text-xs">pcs</span>
                </div>
                <div className="flex justify-end gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setReleaseAmount(releaseItem.quantity_reserved)}
                    className="text-[10px] text-amber-600 hover:underline font-bold cursor-pointer"
                  >
                    Pindahkan Semua ({releaseItem.quantity_reserved} pcs)
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
                Setelah dipindahkan, <strong>{releaseAmount || 0} pcs</strong> akan langsung aktif dan bisa dibeli kembali oleh customer maupun reseller di etalase web.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReleaseItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={releasing}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {releasing ? 'Memindahkan...' : 'Pindahkan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
