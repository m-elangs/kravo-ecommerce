import React, { useState, useEffect } from 'react'
import {
  RefreshCw,
  Search,
  Users,
  Shield,
  Store,
  ShoppingBag,
  Trash2,
  Eye,
  X,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  DollarSign
} from 'lucide-react'
import { adminApi } from '../../api/adminApi'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const ROLE_STYLES = {
  admin:    { bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: Shield, label: 'Administrator' },
  reseller: { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Store, label: 'Mitra Reseller' },
  customer: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: ShoppingBag, label: 'Pelanggan Retail' },
}

export default function UsersListPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [meta, setMeta] = useState(null)
  const [roleCounts, setRoleCounts] = useState({ total: 0, admin: 0, reseller: 0, customer: 0 })
  const [page, setPage] = useState(1)

  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Deleting State
  const [deletingId, setDeletingId] = useState(null)

  const load = async (s = search, r = roleFilter, p = page) => {
    setLoading(true)
    try {
      const res = await adminApi.getUsers({ search: s, role: r || undefined, page: p })
      setUsers(res.data || [])
      setMeta(res.meta || null)
      if (res.role_counts) setRoleCounts(res.role_counts)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page, roleFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load(search, roleFilter, 1)
  }

  const handleOpenDetail = async (user) => {
    setShowDetailModal(true)
    setLoadingDetail(true)
    try {
      const res = await adminApi.getUser(user.id)
      setSelectedUser(res.data || user)
    } catch {
      setSelectedUser(user)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDeleteUser = async (user) => {
    const roleLabel = ROLE_STYLES[user.role]?.label || user.role
    const confirmMessage = `Apakah Anda yakin ingin MENGHAPUS akun:\n\nNama: ${user.name}\nEmail: ${user.email}\nPeran: ${roleLabel}\n\nPerhatian: Tindakan ini permanen dan akan menghapus semua data terkait akun ini.`
    
    if (!window.confirm(confirmMessage)) return

    setDeletingId(user.id)
    try {
      const res = await adminApi.deleteUser(user.id)
      alert(res.message || 'Akun pengguna berhasil dihapus.')
      if (selectedUser?.id === user.id) {
        setShowDetailModal(false)
      }
      load()
    } catch (err) {
      alert(err.message || 'Gagal menghapus pengguna.')
    } finally {
      setDeletingId(null)
    }
  }

  const totalUsers = roleCounts.total || Object.values(roleCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-xs text-slate-500">
            Total statistik seluruh jenis akun terdaftar (Admin, Reseller, Customer), profil data diri lengkap, serta moderasi akun.
          </p>
        </div>
        <button
          onClick={() => load()}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-kravo-orange hover:border-kravo-orange text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-kravo-orange' : ''}`} /> Muat Ulang Data
        </button>
      </div>

      {/* 4 KPI Cards: Mengetahui berapa user dan jenisnya */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total User</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalUsers}</p>
          <p className="text-[11px] text-slate-400">Seluruh akun terdaftar</p>
        </div>

        {/* Administrator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Admin HQ</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600">{roleCounts.admin || 0}</p>
          <p className="text-[11px] text-slate-400">Akses penuh dashboard</p>
        </div>

        {/* Reseller */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Mitra B2B</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-indigo-600">{roleCounts.reseller || 0}</p>
          <p className="text-[11px] text-slate-400">Reseller & distributor</p>
        </div>

        {/* Customer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Customer B2C</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{roleCounts.customer || 0}</p>
          <p className="text-[11px] text-slate-400">Pelanggan e-commerce</p>
        </div>
      </div>

      {/* Filter, Search & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, email, no. telepon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kravo-orange/30"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-kravo-dark hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Cari
            </button>
          </form>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Jenis:</label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">Semua Jenis Akun</option>
              <option value="admin">Administrator (Admin)</option>
              <option value="reseller">Mitra Reseller (B2B)</option>
              <option value="customer">Pelanggan Retail (Customer)</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Memuat data pengguna...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <Users className="w-12 h-12 mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Tidak ada pengguna ditemukan</p>
            <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau filter perannya.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama & Email</th>
                  <th className="py-3 px-4">No. Telepon</th>
                  <th className="py-3 px-4">Jenis Akun (Role)</th>
                  <th className="py-3 px-4">Total Order</th>
                  <th className="py-3 px-4">Total Belanja</th>
                  <th className="py-3 px-4">Status B2B</th>
                  <th className="py-3 px-4">Tgl Daftar</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => {
                  const roleStyle = ROLE_STYLES[u.role] || { bg: 'bg-slate-100 text-slate-700', icon: Users, label: u.role }
                  const RoleIcon = roleStyle.icon

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black uppercase ${
                            u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                            u.role === 'reseller' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {u.name ? u.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[11px] text-slate-400 block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {u.phone || <span className="text-slate-300 italic">Belum diisi</span>}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleStyle.bg}`}>
                          <RoleIcon className="w-3 h-3" /> {roleStyle.label}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {u.orders_count} pesanan
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 font-black text-kravo-orange">
                        {fmt(u.total_spent)}
                      </td>

                      {/* Reseller Status */}
                      <td className="py-3.5 px-4">
                        {u.role === 'reseller' ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.reseller_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            u.reseller_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {u.reseller_status ? u.reseller_status.toUpperCase() : 'BELUM PENGAJUAN'}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {u.created_at}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail Button */}
                          <button
                            onClick={() => handleOpenDetail(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-kravo-dark hover:text-white text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Lihat Data Diri Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" /> Data Diri
                          </button>

                          {/* Delete Account Button */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={deletingId === u.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-600 transition-colors"
                            title="Hapus Akun Pengguna Ini"
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

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500 gap-2">
            <span>Menampilkan halaman {meta.current_page} dari {meta.last_page} (Total {meta.total} pengguna)</span>
            <div className="flex gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg font-bold transition-colors ${
                    page === p ? 'bg-kravo-orange text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DATA DIRI LENGKAP PENGGUNA */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black uppercase ${
                  selectedUser.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                  selectedUser.role === 'reseller' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedUser.name ? selectedUser.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{selectedUser.email}</span>
                    <span className="text-slate-300">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedUser.role === 'admin' ? 'bg-rose-100 text-rose-800' :
                      selectedUser.role === 'reseller' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ROLE_STYLES[selectedUser.role]?.label || selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Memuat detail profil lengkap...</span>
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* 1. Biodata Pribadi */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Users className="w-4 h-4 text-kravo-orange" /> Informasi Akun & Kontak
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nama Lengkap</span>
                      <span className="font-bold text-slate-800 text-sm">{selectedUser.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Alamat Email</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedUser.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nomor Telepon / WhatsApp</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedUser.phone || 'Belum diisi'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tanggal Terdaftar</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {selectedUser.created_at}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Transaksi Pesanan</span>
                      <span className="font-extrabold text-slate-900 mt-0.5 block">{selectedUser.orders_count || 0} kali order</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Belanja Kumulatif</span>
                      <span className="font-black text-kravo-orange text-sm mt-0.5 block">{fmt(selectedUser.total_spent || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Profil Reseller / B2B jika ada */}
                {selectedUser.reseller_profile && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                      <Store className="w-4 h-4 text-indigo-600" /> Data Kemitraan Reseller / Distributor B2B
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200">
                      <div>
                        <span className="text-indigo-900/60 block text-[10px]">Nama Badan Usaha / Toko</span>
                        <span className="font-bold text-slate-800">{selectedUser.reseller_profile.company_name}</span>
                      </div>
                      <div>
                        <span className="text-indigo-900/60 block text-[10px]">Nomor NIB / NPWP</span>
                        <span className="font-mono font-bold text-indigo-700">{selectedUser.reseller_profile.tax_id_or_nib}</span>
                      </div>
                      <div>
                        <span className="text-indigo-900/60 block text-[10px]">Kategori Usaha</span>
                        <span className="font-bold text-slate-800">{selectedUser.reseller_profile.business_type}</span>
                      </div>
                      <div>
                        <span className="text-indigo-900/60 block text-[10px]">Status Kemitraan</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                          selectedUser.reseller_profile.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          selectedUser.reseller_profile.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {selectedUser.reseller_profile.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Alamat Pengiriman Lengkap */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Buku Alamat Pengiriman
                  </h4>
                  {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.addresses.map((addr) => (
                        <div key={addr.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{addr.recipient_name} ({addr.label || 'Utama'})</span>
                            <span className="font-mono text-slate-500 text-[11px]">{addr.phone_number}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{addr.full_address}</p>
                          <p className="text-[10px] text-slate-400">
                            {addr.city}, {addr.province} - {addr.postal_code}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                      Pengguna belum menyimpan alamat pengiriman.
                    </p>
                  )}
                </div>

                {/* 4. Riwayat 5 Pesanan Terakhir */}
                {selectedUser.recent_orders && selectedUser.recent_orders.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-kravo-dark" /> Riwayat Pesanan Terakhir
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {selectedUser.recent_orders.map((o) => (
                        <div key={o.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <span className="font-mono font-bold text-slate-900 text-xs">{o.order_number}</span>
                            <span className="block text-[10px] text-slate-400">{o.created_at}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-900 block">{fmt(o.grand_total)}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-700">
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDeleteUser(selectedUser)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Hapus Akun Ini
              </button>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
