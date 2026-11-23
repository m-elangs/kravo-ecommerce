import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Send,
  Eye,
  Check,
  User,
  HelpCircle,
  CornerDownRight
} from 'lucide-react'
import { adminApi } from '../../api/adminApi'

const STATUS_CONFIG = {
  pending: {
    label: 'Menunggu Respon',
    bg: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  in_progress: {
    label: 'Sedang Ditangani',
    bg: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
  },
  resolved: {
    label: 'Selesai Dijawab',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
}

export default function SupportMessagesPage() {
  const [messages, setMessages] = useState([])
  const [counts, setCounts] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  // Detail Modal
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [editStatus, setEditStatus] = useState('pending')
  const [adminNotes, setAdminNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = async (st = statusFilter, s = search, p = page) => {
    setLoading(true)
    try {
      const res = await adminApi.getSupportMessages({
        status: st,
        search: s,
        page: p,
      })
      const list = res.data || []
      setMessages(list)
      if (res.counts) setCounts(res.counts)
      if (res.meta) setMeta(res.meta)
    } catch (err) {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [statusFilter, page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load(statusFilter, search, 1)
  }

  const openDetail = (m) => {
    setSelectedMessage(m)
    setEditStatus(m.status || 'pending')
    setAdminNotes(m.admin_notes || '')
  }

  const handleSaveStatus = async () => {
    if (!selectedMessage) return
    setUpdating(true)
    try {
      await adminApi.updateSupportStatus(selectedMessage.id, {
        status: editStatus,
        admin_notes: adminNotes,
      })
      alert('Status tiket layanan bantuan berhasil diperbarui!')
      setSelectedMessage(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal memperbarui status tiket.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pesan bantuan ini? Data yang dihapus tidak dapat dipulihkan.')) return
    try {
      await adminApi.deleteSupportMessage(id)
      alert('Pesan berhasil dihapus.')
      if (selectedMessage?.id === id) setSelectedMessage(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal menghapus pesan.')
    }
  }

  const formatWaLink = (phone, name, subject) => {
    if (!phone) return null
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) clean = '62' + clean.slice(1)
    const text = encodeURIComponent(`Halo Kak ${name}, terima kasih telah menghubungi Layanan Bantuan KRAVO terkait "${subject || 'Pertanyaan Anda'}". Kami siap membantu: `)
    return `https://wa.me/${clean}?text=${text}`
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Layanan Bantuan & Tiket Pelanggan</h1>
          <p className="text-xs text-slate-500">Kelola pesan masuk, pertanyaan kemitraan reseller, keluhan pesanan, dan saran dari formulir bantuan.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-kravo-orange transition-colors"
            title="Segarkan data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-kravo-orange' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pesan</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.total}</div>
          <span className="text-[10px] text-slate-400">Semua riwayat bantuan masuk</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-1 bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu Respon</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700">{counts.pending}</div>
          <span className="text-[10px] text-amber-600 font-semibold">Perlu segera dibalas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-1 bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sedang Ditangani</span>
            <CornerDownRight className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700">{counts.in_progress}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Proses koordinasi tim</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-1 bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Telah Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{counts.resolved}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Masalah terselesaikan</span>
        </div>
      </div>

      {/* Filter Tabs & Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Semua Tiket' },
            { id: 'pending', label: 'Menunggu' },
            { id: 'in_progress', label: 'Diproses' },
            { id: 'resolved', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-kravo-dark text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, email, hp, atau pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-kravo-orange/30 font-semibold"
          />
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-kravo-orange" />
            <span className="text-xs font-bold">Memuat pesan layanan bantuan...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
            <HelpCircle className="w-12 h-12 stroke-[1.2]" />
            <span className="text-sm font-bold text-slate-600">Belum ada pesan layanan bantuan</span>
            <span className="text-xs">Pesan dari formulir "Hubungi Tim KRAVO" di halaman pelanggan akan tampil di sini.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tanggal Masuk</th>
                  <th className="py-3 px-4">Pengirim</th>
                  <th className="py-3 px-4">Topik & Isi Pesan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {messages.map((m) => {
                  const cfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.pending
                  const dateStr = new Date(m.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <span className="block font-semibold text-slate-800">{dateStr}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Tiket #{m.id}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{m.name}</span>
                            <span className="text-[11px] text-slate-500 block">{m.email}</span>
                            {m.phone && <span className="text-[10px] text-slate-400 block font-mono">{m.phone}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 mb-1 inline-block">
                          {m.subject || 'Pertanyaan Umum'}
                        </span>
                        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                          {m.message}
                        </p>
                        {m.admin_notes && (
                          <span className="text-[10px] text-kravo-orange font-semibold block mt-1">
                            Catatan: {m.admin_notes}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {cfg.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetail(m)}
                            className="px-2.5 py-1.5 rounded-lg bg-kravo-dark hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                            title="Buka & Balas Pesan"
                          >
                            <Eye className="w-3.5 h-3.5" /> Buka
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Pesan"
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

      {/* Detail & Response Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-kravo-orange flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Tiket Layanan Bantuan #{selectedMessage.id}</h3>
                  <span className="text-[11px] text-slate-400">
                    Masuk pada {new Date(selectedMessage.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pengirim Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{selectedMessage.name}</span>
                  <span className="text-xs text-slate-500 block">{selectedMessage.email}</span>
                  {selectedMessage.phone && (
                    <span className="text-xs text-slate-600 font-mono block mt-0.5">{selectedMessage.phone}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedMessage.phone && (
                    <a
                      href={formatWaLink(selectedMessage.phone, selectedMessage.name, selectedMessage.subject)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Balas WhatsApp
                    </a>
                  )}
                  <a
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent('Tanggapan Bantuan KRAVO: ' + (selectedMessage.subject || 'Pesan Anda'))}`}
                    className="px-3 py-1.5 rounded-xl bg-kravo-dark hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> Kirim Email
                  </a>
                </div>
              </div>
            </div>

            {/* Isi Pesan */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Topik: {selectedMessage.subject || 'Umum'}
                </span>
              </div>
              <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedMessage.message}
              </div>
            </div>

            {/* Status Update & Admin Notes */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Penanganan Tiket</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="pending">⏳ Menunggu Respon (Pending)</option>
                  <option value="in_progress">🔄 Sedang Ditangani / Koordinasi Tim (In Progress)</option>
                  <option value="resolved">✅ Selesai Dijawab / Solved (Resolved)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Internal Admin (Opsional)</label>
                <textarea
                  rows={3}
                  placeholder="Catatan tindak lanjut tim admin (cth: Sudah dihubungi via WA, konfirmasi resi kurir telah dikirim)..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDelete(selectedMessage.id)}
                className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Tiket
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-kravo-orange hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Simpan Status Tiket
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
