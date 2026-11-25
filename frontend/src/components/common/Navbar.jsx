import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Heart, User, Search, Store, ArrowRight, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'

export default function Navbar() {
  const { user, logout, isAdmin, isReseller, isApprovedReseller } = useAuth()
  const { totalCount } = useCart()
  const { wishlistCount } = useWishlist()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full max-w-full bg-kravo-cream/95 backdrop-blur-md border-b border-kravo-creamBorder transition-all">
      {/* Announcement Bar */}
      <div className="bg-kravo-dark text-kravo-cream text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-kravo-orange animate-pulse shrink-0"></span>
        <span className="leading-snug truncate sm:whitespace-normal">
          Snack Kemasan Gourmet Premium KRAVO — Jaminan Renyah & Batch FEFO Segar!
        </span>
        {isReseller && (
          <>
            <span className="hidden md:inline text-kravo-cream/60 shrink-0">|</span>
            <Link to="/wholesale" className="hidden md:flex items-center gap-1 text-kravo-orange hover:underline shrink-0">
              <Store className="w-3.5 h-3.5" /> Portal Kemitraan Reseller B2B <ArrowRight className="w-3 h-3" />
            </Link>
          </>
        )}
      </div>

      {/* Main Navbar (Full-width Rounded Pill: Logo Left, Links Center, Icons Right) */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-2">
        <div className="w-full px-3 sm:px-5 h-12 sm:h-14 rounded-full bg-white/90 border border-kravo-creamBorder shadow-sm flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Hamburger (Mobile/Tablet) + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-kravo-dark hover:bg-kravo-cream transition-colors shrink-0"
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-kravo-dark text-kravo-orange flex items-center justify-center font-black text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform">
                K
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black tracking-tight text-kravo-dark leading-none block">KRAVO</span>
                <span className="text-[8px] sm:text-[9px] block font-bold text-kravo-orange tracking-widest uppercase">Modern Snacks</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links (Laptop / Desktop - Centered) */}
          <nav className="hidden lg:flex items-center justify-center gap-2 xl:gap-5 text-xs xl:text-sm font-semibold text-kravo-dark whitespace-nowrap min-w-0">
            <NavLink to="/" className={({ isActive }) => isActive ? "px-3 py-1.5 rounded-full bg-kravo-orange/10 text-kravo-orange font-bold" : "px-2.5 py-1.5 rounded-full hover:bg-kravo-cream hover:text-kravo-orange transition-colors"}>Home</NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? "px-3 py-1.5 rounded-full bg-kravo-orange/10 text-kravo-orange font-bold" : "px-2.5 py-1.5 rounded-full hover:bg-kravo-cream hover:text-kravo-orange transition-colors"}>Katalog Snack</NavLink>
            <NavLink to="/categories" className={({ isActive }) => isActive ? "px-3 py-1.5 rounded-full bg-kravo-orange/10 text-kravo-orange font-bold" : "px-2.5 py-1.5 rounded-full hover:bg-kravo-cream hover:text-kravo-orange transition-colors"}>Kategori</NavLink>
            {isReseller && (
              <NavLink to="/wholesale" className={({ isActive }) => isActive ? "px-3 py-1.5 rounded-full bg-kravo-orange/10 text-kravo-orange font-bold" : "px-2.5 py-1.5 rounded-full hover:bg-kravo-cream hover:text-kravo-orange transition-colors"}>
                Grosir / Reseller {isApprovedReseller && <span className="ml-1 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">B2B Aktif</span>}
              </NavLink>
            )}
            <NavLink to="/order-tracking" className={({ isActive }) => isActive ? "px-3 py-1.5 rounded-full bg-kravo-orange/10 text-kravo-orange font-bold" : "px-2.5 py-1.5 rounded-full hover:bg-kravo-cream hover:text-kravo-orange transition-colors"}>Lacak Pesanan</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? "px-3 py-1.5 rounded-full bg-kravo-orange/10 text-kravo-orange font-bold" : "px-2.5 py-1.5 rounded-full hover:bg-kravo-cream hover:text-kravo-orange transition-colors"}>Tentang</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "px-3 py-1.5 rounded-full bg-kravo-orange/10 text-kravo-orange font-bold" : "px-2.5 py-1.5 rounded-full hover:bg-kravo-cream hover:text-kravo-orange transition-colors"}>Kontak</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 font-extrabold hover:bg-rose-100 transition-colors">
                Portal Admin HQ
              </NavLink>
            )}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link to="/search" className="p-2 rounded-full hover:bg-kravo-cream text-kravo-dark transition-colors" title="Cari Produk">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <Link to="/wishlist" className="p-2 rounded-full hover:bg-kravo-cream text-kravo-dark relative transition-colors" title="Wishlist">
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.05rem] h-[1.05rem] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart with Dynamic Counter */}
            <Link to="/cart" className="flex items-center gap-1.5 bg-kravo-dark hover:bg-kravo-darkMuted text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold transition-all shadow-sm">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-kravo-orange shrink-0" />
              <span className="hidden sm:inline">Keranjang</span>
              <span className="bg-kravo-orange text-white text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none">{totalCount}</span>
            </Link>

            {/* User Account / Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:pr-2.5 rounded-full bg-kravo-cream/60 border border-kravo-creamBorder hover:border-kravo-orange text-xs font-bold text-kravo-dark transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-kravo-orange text-white flex items-center justify-center font-black">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[5rem] truncate">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs font-semibold">
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
              <Link to="/account" className="p-2 rounded-full bg-kravo-cream/60 text-kravo-dark border border-kravo-creamBorder hover:border-kravo-orange transition-colors" title="Masuk / Daftar">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-kravo-creamBorder bg-kravo-cream/98 backdrop-blur-md shadow-xl">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1 text-sm font-semibold text-kravo-dark">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3.5 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-kravo-dark text-white font-bold' : 'hover:bg-white/70'}`}>Home</NavLink>
            <NavLink to="/products" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3.5 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-kravo-dark text-white font-bold' : 'hover:bg-white/70'}`}>Katalog Snack</NavLink>
            <NavLink to="/categories" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3.5 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-kravo-dark text-white font-bold' : 'hover:bg-white/70'}`}>Kategori</NavLink>
            <NavLink to="/wishlist" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `sm:hidden px-3.5 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-kravo-dark text-white font-bold' : 'hover:bg-white/70'}`}>Wishlist</NavLink>
            {isReseller && (
              <NavLink to="/wholesale" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-between ${isActive ? 'bg-kravo-dark text-white font-bold' : 'hover:bg-white/70'}`}>
                <span>Grosir / Reseller</span>
                {isApprovedReseller && <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">B2B Aktif</span>}
              </NavLink>
            )}
            <NavLink to="/order-tracking" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3.5 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-kravo-dark text-white font-bold' : 'hover:bg-white/70'}`}>Lacak Pesanan</NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3.5 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-kravo-dark text-white font-bold' : 'hover:bg-white/70'}`}>Tentang</NavLink>
            <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3.5 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-kravo-dark text-white font-bold' : 'hover:bg-white/70'}`}>Kontak</NavLink>
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-extrabold mt-1">
                Portal Admin HQ
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
