import React, { useState } from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminHeader from '../components/admin/AdminHeader'
import { useAuth } from '../contexts/AuthContext'
import { ShieldAlert, Loader2, ArrowLeft, LogOut } from 'lucide-react'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading, isAdmin, logout } = useAuth()

  // 1. Tampilkan loader saat state auth masih diverifikasi dari token
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
        <span className="text-xs font-semibold">Memverifikasi hak akses Admin...</span>
      </div>
    )
  }

  // 2. Jika belum login, redirect ke halaman login
  if (!user) {
    return <Navigate to="/account" replace />
  }

  // 3. Jika sudah login tetapi role BUKAN admin, tolak akses dan tampilkan peringatan 403
  if (!isAdmin) {
    const roleDisplayName = user.role?.display_name || user.role?.name || 'Customer'
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black text-rose-600 uppercase tracking-wider">Akses Terbatas (403 Forbidden)</span>
            <h2 className="text-2xl font-black text-slate-900">Bukan Administrator</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dashboard Admin KRAVO HQ hanya dapat diakses oleh akun dengan peran <strong>Administrator</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1">
            <div className="text-slate-400 text-[10px] font-bold">Akun Anda Saat Ini:</div>
            <div className="font-bold text-slate-800">{user.name} ({user.email})</div>
            <div className="inline-block px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              Peran: {roleDisplayName}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              to="/"
              className="flex-1 py-2.5 px-4 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-kravo-orange/20"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Toko
            </Link>
            <Link
              to="/account"
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              Ganti Akun
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 4. Pengguna terotentikasi sebagai Admin resmi
  return (
    <div className="h-[100dvh] w-full max-w-full overflow-hidden flex flex-col bg-slate-50 text-slate-800">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar for Desktop & Drawer for Mobile/Tablet */}
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-5">
            <div className="w-full min-w-0">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
