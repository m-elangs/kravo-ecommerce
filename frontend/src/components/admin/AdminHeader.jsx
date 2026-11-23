import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  Bell,
  ShieldCheck,
  ChevronDown,
  ShoppingBag,
  MessageSquare,
  Package,
  User,
  Settings,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  // Notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Pesanan Baru Masuk',
      desc: 'Pesanan snack retail baru saja terbayar & siap dikemas.',
      time: '5 menit yang lalu',
      icon: ShoppingBag,
      color: 'bg-emerald-100 text-emerald-600',
      path: '/admin/orders'
    },
    {
      id: 2,
      title: 'Pesan Layanan Bantuan',
      desc: 'Pertanyaan baru seputar kemitraan reseller diterima.',
      time: '25 menit yang lalu',
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
      path: '/admin/support'
    },
    {
      id: 3,
      title: 'Pengingat FEFO Gudang',
      desc: 'Batch singkong siap rotasi stok untuk pengiriman berikutnya.',
      time: '1 jam yang lalu',
      icon: Package,
      color: 'bg-amber-100 text-amber-600',
      path: '/admin/batches'
    }
  ])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = () => {
    setUnreadCount(0)
  }

  const handleLogout = async () => {
    setShowProfileMenu(false)
    await logout()
    navigate('/account')
  }

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Right: FEFO Alert pill, Notifications & Admin Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* FEFO Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>FEFO Engine: Active</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfileMenu(false)
            }}
            className="p-2.5 rounded-full text-slate-600 hover:bg-slate-100 relative transition-colors cursor-pointer"
            title="Pemberitahuan"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white"></span>
              </>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Pemberitahuan Sistem</h4>
                  <span className="text-[11px] text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} pemberitahuan baru` : 'Semua telah dibaca'}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-kravo-orange hover:underline cursor-pointer"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false)
                        navigate(n.path)
                      }}
                      className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-slate-900 block">{n.title}</span>
                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {n.time}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  to="/admin/orders"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-kravo-orange hover:underline block"
                >
                  Lihat Semua Pesanan & Aktivitas →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Dropdown Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200 hover:bg-slate-50 p-1.5 rounded-2xl transition-colors cursor-pointer text-left"
            title="Menu Akun Administrator"
          >
            <div className="w-9 h-9 rounded-full bg-kravo-dark text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
              AD
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-800 leading-tight">
                {user?.name || 'Admin KRAVO HQ'}
              </span>
              <span className="block text-[11px] text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Operations & Sales
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-kravo-orange' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
              {/* Header Info */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-kravo-dark text-white font-bold text-sm flex items-center justify-center shrink-0">
                  AD
                </div>
                <div className="min-w-0">
                  <span className="font-black text-xs text-slate-900 block truncate">
                    {user?.name || 'Admin KRAVO HQ'}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {user?.email || 'admin@kravo.id'}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-1">
                    Aktif Terotentikasi
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 text-xs font-semibold text-slate-700 space-y-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-kravo-orange transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Pengaturan Sistem</span>
                </Link>

                <Link
                  to="/admin/users"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-kravo-orange transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Manajemen Semua Pengguna</span>
                </Link>

                <Link
                  to="/admin/support"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-kravo-orange transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Layanan Bantuan Pelanggan</span>
                </Link>

                <Link
                  to="/"
                  target="_blank"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-kravo-orange transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Lihat Toko Pelanggan</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Baru</span>
                </Link>
              </div>

              {/* Logout Option */}
              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
