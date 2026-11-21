import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw, Tag, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ code:'', type:'percentage', value:'', min_purchase:'', max_discount:'', usage_limit:'', valid_from:'', valid_until:'', is_active: true })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axiosClient.get('/admin/vouchers')
      setVouchers(data.data || [])
    } catch { setVouchers([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      await axiosClient.post('/admin/vouchers', { ...form, is_active: form.is_active ? 1 : 0 })
      setShowForm(false)
      setForm({ code:'', type:'percentage', value:'', min_purchase:'', max_discount:'', usage_limit:'', valid_from:'', valid_until:'', is_active: true })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan voucher')
    } finally { setSaving(false) }
  }

  const toggleActive = async (v) => {
    try {
      await axiosClient.put(`/admin/vouchers/${v.id}`, { is_active: !v.is_active })
      load()
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus voucher ini?')) return
    try { await axiosClient.delete(`/admin/vouchers/${id}`); load() } catch {}
  }

  const InputField = ({ label, ...props }) => (
    <div>
      <label className="text-xs font-bold text-slate-600 block mb-1">{label}</label>
      <input {...props} className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kravo-orange/30" />
    </div>
  )

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Voucher</h1>
          <p className="text-xs text-slate-500">Kelola kode diskon dan promo KRAVO.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load()} className="p-2 text-slate-400 hover:text-kravo-orange rounded-xl"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 rounded-xl bg-kravo-orange text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
            <Plus className="w-4 h-4" /> Buat Voucher
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-slate-900 mb-4">Buat Voucher Baru</h2>
          {error && <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-xl mb-4">{error}</p>}
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
            <InputField label="Kode Voucher *" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} required placeholder="KRAVOFRESH" />
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tipe Diskon *</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal Tetap (Rp)</option>
              </select>
            </div>
            <InputField label={`Nilai Diskon ${form.type === 'percentage' ? '(%)' : '(Rp)'} *`} type="number" value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} required min="0" />
            <InputField label="Min. Pembelian (Rp)" type="number" value={form.min_purchase} onChange={e => setForm(f => ({...f, min_purchase: e.target.value}))} min="0" />
            <InputField label="Maks. Diskon (Rp)" type="number" value={form.max_discount} onChange={e => setForm(f => ({...f, max_discount: e.target.value}))} min="0" />
            <InputField label="Batas Pemakaian" type="number" value={form.usage_limit} onChange={e => setForm(f => ({...f, usage_limit: e.target.value}))} min="1" />
            <InputField label="Berlaku Mulai" type="date" value={form.valid_from} onChange={e => setForm(f => ({...f, valid_from: e.target.value}))} />
            <InputField label="Berlaku Hingga" type="date" value={form.valid_until} onChange={e => setForm(f => ({...f, valid_until: e.target.value}))} />
            <div className="col-span-2 flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Batal</button>
              <button type="submit" disabled={saving} className="px-6 py-2 text-xs font-bold bg-kravo-orange text-white rounded-xl disabled:opacity-60">
                {saving ? 'Menyimpan...' : 'Simpan Voucher'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" /></div>
        ) : vouchers.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400"><Tag className="w-10 h-10 mb-2" /><p className="text-sm">Belum ada voucher</p></div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Nilai</th>
                <th className="py-3 px-4">Min. Pembelian</th>
                <th className="py-3 px-4">Pemakaian</th>
                <th className="py-3 px-4">Masa Berlaku</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {vouchers.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black text-slate-900">{v.code}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      {v.type === 'percentage' ? '%' : 'Rp'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-kravo-orange">
                    {v.type === 'percentage' ? `${v.value}%` : fmt(v.value)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{v.min_purchase ? fmt(v.min_purchase) : '-'}</td>
                  <td className="py-3.5 px-4">{v.used_count} / {v.usage_limit ?? '∞'}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-[10px]">
                    {v.valid_from ?? '—'} → {v.valid_until ?? '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <button onClick={() => toggleActive(v)} className="flex items-center gap-1 text-xs font-bold">
                      {v.is_active
                        ? <><ToggleRight className="w-5 h-5 text-emerald-500" /> Aktif</>
                        : <><ToggleLeft className="w-5 h-5 text-slate-400" /> Nonaktif</>
                      }
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => handleDelete(v.id)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
