import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw, Tag, Trash2, ToggleLeft, ToggleRight, X, Check, AlertCircle, Percent, DollarSign, Calendar, Ticket } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

// InputField didefinisikan di LUAR komponen utama agar tidak di-remount setiap ketikan (mencegah kehilangan fokus & delay per huruf)
function InputField({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-700 block mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kravo-orange/30 font-semibold text-slate-800 transition-colors"
      />
    </div>
  )
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const initialForm = {
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  }
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/admin/vouchers')
      setVouchers(res?.data || res || [])
    } catch {
      setVouchers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleOpenCreate = () => {
    setForm(initialForm)
    setError(null)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!form.code.trim()) {
      setError('Kode voucher wajib diisi.')
      setSaving(false)
      return
    }

    if (!form.value || parseFloat(form.value) <= 0) {
      setError('Nilai diskon harus lebih besar dari 0.')
      setSaving(false)
      return
    }

    // Bersihkan nilai kosong agar tidak gagal validasi di backend
    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim() || undefined,
      type: form.type,
      value: parseFloat(form.value),
      min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : null,
      max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      is_active: form.is_active ? 1 : 0
    }

    try {
      await axiosClient.post('/admin/vouchers', payload)
      setShowForm(false)
      setForm(initialForm)
      alert('Voucher promo berhasil dibuat!')
      load()
    } catch (err) {
      const msg = err?.message || (err?.errors ? Object.values(err.errors).flat().join(', ') : 'Gagal menyimpan voucher promo.')
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (v) => {
    try {
      await axiosClient.put(`/admin/vouchers/${v.id}`, { is_active: !v.is_active })
      load()
    } catch (err) {
      alert(err?.message || 'Gagal mengubah status voucher.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus voucher promo ini?')) return
    try {
      await axiosClient.delete(`/admin/vouchers/${id}`)
      load()
    } catch (err) {
      alert(err?.message || 'Gagal menghapus voucher.')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manajemen Voucher & Promo</h1>
          <p className="text-xs text-slate-500">Kelola kode diskon belanja pelanggan dan kemitraan KRAVO.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            disabled={loading}
            className="p-2.5 text-slate-400 hover:text-kravo-orange rounded-xl bg-white border border-slate-200 transition-colors"
            title="Segarkan data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-kravo-orange' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-kravo-orange/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Voucher Baru
          </button>
        </div>
      </div>

      {/* Form Buat Voucher */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-kravo-orange flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-base">Buat Kode Voucher Baru</h2>
                <span className="text-[11px] text-slate-400">Atur kode promo, besaran potongan, dan syarat belanja.</span>
              </div>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Kode Voucher *"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                required
                placeholder="Contoh: NOFMFMFMF / DISKON15"
              />

              <InputField
                label="Nama / Judul Promo (Opsional)"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Contoh: Promo Spesial Weekend (default: Promo KODE)"
              />

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tipe Diskon *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kravo-orange/30 font-semibold text-slate-800"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal Tetap (Rp)</option>
                </select>
              </div>

              <InputField
                label={`Nilai Diskon ${form.type === 'percentage' ? '(%)' : '(Rp)'} *`}
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                required
                min="0"
                step="any"
                placeholder={form.type === 'percentage' ? 'Contoh: 15' : 'Contoh: 10000'}
              />

              <InputField
                label="Min. Pembelian Belanja (Rp)"
                type="number"
                value={form.min_purchase}
                onChange={(e) => setForm((f) => ({ ...f, min_purchase: e.target.value }))}
                min="0"
                step="any"
                placeholder="Contoh: 20000 (Opsional)"
              />

              <InputField
                label="Maks. Nominal Diskon (Rp)"
                type="number"
                value={form.max_discount}
                onChange={(e) => setForm((f) => ({ ...f, max_discount: e.target.value }))}
                min="0"
                step="any"
                placeholder="Contoh: 5000 (Opsional)"
              />

              <InputField
                label="Batas Kuota Pemakaian"
                type="number"
                value={form.usage_limit}
                onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
                min="1"
                placeholder="Contoh: 10 kali (Opsional)"
              />

              <InputField
                label="Berlaku Mulai"
                type="date"
                value={form.valid_from}
                onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))}
              />

              <InputField
                label="Berlaku Hingga"
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs font-black bg-kravo-orange hover:bg-orange-600 text-white rounded-xl shadow-md transition-all disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Simpan Voucher
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-kravo-orange" />
            <span className="text-xs font-bold">Memuat daftar voucher...</span>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-slate-400 gap-2">
            <Tag className="w-12 h-12 stroke-[1.2]" />
            <span className="text-sm font-bold text-slate-600">Belum ada voucher promo</span>
            <span className="text-xs">Klik "Buat Voucher Baru" untuk membuat kode diskon pertama.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Kode Voucher</th>
                  <th className="py-3.5 px-4">Tipe</th>
                  <th className="py-3.5 px-4">Nilai Potongan</th>
                  <th className="py-3.5 px-4">Min. Pembelian</th>
                  <th className="py-3.5 px-4">Pemakaian</th>
                  <th className="py-3.5 px-4">Masa Berlaku</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {v.code}
                      </span>
                      {v.name && v.name !== `Promo ${v.code}` && (
                        <span className="block text-[11px] text-slate-400 font-normal mt-0.5">{v.name}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.type === 'percentage' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {v.type === 'percentage' ? 'Persentase (%)' : 'Nominal (Rp)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-kravo-orange">
                      {v.type === 'percentage' ? `${v.value}%` : fmt(v.value)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {v.min_purchase ? fmt(v.min_purchase) : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{v.used_count ?? 0}</span>
                      <span className="text-slate-400"> / {v.usage_limit ?? '∞'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {v.valid_from ?? '—'} <span className="text-slate-300">→</span> {v.valid_until ?? '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleActive(v)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          v.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Klik untuk mengubah status aktif"
                      >
                        {v.is_active ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" /> Aktif
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-slate-400" /> Nonaktif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Voucher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
