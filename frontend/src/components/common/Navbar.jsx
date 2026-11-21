import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, User, Search, Store, ArrowRight, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

export default function Navbar() {
  const { user, logout, isAdmin, isApprovedReseller } = useAuth()
  const { totalCount } = useCart()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-kravo-cream/90 backdrop-blur-md border-b border-kravo-creamBorder transition-all">
      {/* Announcement Bar */}
      <div className="bg-kravo-dark text-kravo-cream text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-kravo-orange animate-pulse"></span>
        <span>Snack Kemasan Gourmet Premium KRAVO — Jaminan Renyah & Batch FEFO Segar!</span>
        <span className="hidden md:inline text-kravo-cream/60">|</span>
        <Link to="/wholesale" className="hidden md:flex items-center gap-1 text-kravo-orange hover:underline">
          <Store className="w-3.5 h-3.5" /> Portal Kemitraan Reseller B2B <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-kravo-dark text-kravo-orange flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
            K
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-kravo-dark">KRAVO</span>
            <span className="text-[10px] block font-bold text-kravo-orange tracking-widest uppercase -mt-1">Modern Snacks</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-kravo-dark">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-kravo-orange font-bold" : "hover:text-kravo-orange transition-colors"}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? "text-kravo-orange font-bold" : "hover:text-kravo-orange transition-colors"}>Katalog Snack</NavLink>
          <NavLink to="/categories" className={({ isActive }) => isActive ? "text-kravo-orange font-bold" : "hover:text-kravo-orange transition-colors"}>Kategori</NavLink>
          <NavLink to="/wholesale" className={({ isActive }) => isActive ? "text-kravo-orange font-bold" : "hover:text-kravo-orange transition-colors"}>
            Grosir / Reseller {isApprovedReseller && <span className="ml-1 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">B2B Aktif</span>}
          </NavLink>
          <NavLink to="/order-tracking" className={({ isActive }) => isActive ? "text-kravo-orange font-bold" : "hover:text-kravo-orange transition-colors"}>Lacak Pesanan</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "text-kravo-orange font-bold" : "hover:text-kravo-orange transition-colors"}>Tentang</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "text-kravo-orange font-bold" : "hover:text-kravo-orange transition-colors"}>Kontak</NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="text-rose-600 font-extrabold hover:underline">
              Portal Admin HQ
            </NavLink>
          )}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <Link to="/search" className="p-2.5 rounded-full hover:bg-white/80 text-kravo-dark transition-colors" title="Cari Produk">
            <Search className="w-5 h-5" />
          </Link>

          <Link to="/wishlist" className="p-2.5 rounded-full hover:bg-white/80 text-kravo-dark relative transition-colors" title="Wishlist">
            <Heart className="w-5 h-5" />
          </Link>

          {/* Cart with Dynamic Counter */}
          <Link to="/cart" className="flex items-center gap-2 bg-kravo-dark hover:bg-kravo-darkMuted text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm">
            <ShoppingBag className="w-4 h-4 text-kravo-orange" />
            <span className="hidden sm:inline">Keranjang</span>
            <span className="bg-kravo-orange text-white text-xs px-2 py-0.5 rounded-full font-bold">{totalCount}</span>
          </Link>

          {/* User Account / Dropdown */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white border border-kravo-creamBorder hover:border-kravo-orange text-xs font-bold text-kravo-dark transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-kravo-orange text-white flex items-center justify-center font-black">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[5rem] truncate">{user.name}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs font-semibold">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="block font-bold text-slate-800 truncate">{user.name}</span>
                    <span className="block text-[10px] text-slate-400 capitalize">{user.role?.display_name || 'Member'}</span>
                  </div>
                  <Link to="/account" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Akun Saya</Link>
                  <Link to="/account/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Riwayat Pesanan</Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-slate-50 text-rose-600 font-bold">Dashboard Admin</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    <LogOut className="w-3.5 h-3.5" /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/account" className="p-2.5 rounded-full bg-white text-kravo-dark border border-kravo-creamBorder hover:border-kravo-orange transition-colors" title="Masuk / Daftar">
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
