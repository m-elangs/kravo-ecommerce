import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, Heart, User, Search, Store, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-kravo-cream/90 backdrop-blur-md border-b border-kravo-creamBorder transition-all">
      {/* Announcement Bar */}
      <div className="bg-kravo-dark text-kravo-cream text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-kravo-orange animate-pulse"></span>
        <span>Gratis Ongkir Khusus Pembelian Snack Bundle Minggu Ini! Gunakan Kode: <strong>KRAVOFRESH</strong></span>
        <span className="hidden md:inline text-kravo-cream/60">|</span>
        <Link to="/wholesale" className="hidden md:flex items-center gap-1 text-kravo-orange hover:underline">
          <Store className="w-3.5 h-3.5" /> B2B Reseller Portal <ArrowRight className="w-3 h-3" />
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
          <NavLink to="/" className={({ isActive }) => isActive ? "text-kravo-orange" : "hover:text-kravo-orange transition-colors"}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? "text-kravo-orange" : "hover:text-kravo-orange transition-colors"}>Katalog Snack</NavLink>
          <NavLink to="/categories" className={({ isActive }) => isActive ? "text-kravo-orange" : "hover:text-kravo-orange transition-colors"}>Kategori</NavLink>
          <NavLink to="/wholesale" className={({ isActive }) => isActive ? "text-kravo-orange" : "hover:text-kravo-orange transition-colors"}>Grosir / Reseller</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "text-kravo-orange" : "hover:text-kravo-orange transition-colors"}>Tentang KRAVO</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "text-kravo-orange" : "hover:text-kravo-orange transition-colors"}>Kontak</NavLink>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <Link to="/search" className="p-2.5 rounded-full hover:bg-white/80 text-kravo-dark transition-colors" title="Cari Produk">
            <Search className="w-5 h-5" />
          </Link>

          {/* Wishlist */}
          <Link to="/wishlist" className="p-2.5 rounded-full hover:bg-white/80 text-kravo-dark relative transition-colors" title="Wishlist">
            <Heart className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-kravo-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-2 bg-kravo-dark hover:bg-kravo-darkMuted text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm">
            <ShoppingBag className="w-4 h-4 text-kravo-orange" />
            <span className="hidden sm:inline">Keranjang</span>
            <span className="bg-kravo-orange text-white text-xs px-2 py-0.5 rounded-full font-bold">0</span>
          </Link>

          {/* User Account / Login */}
          <Link to="/account" className="p-2.5 rounded-full bg-white text-kravo-dark border border-kravo-creamBorder hover:border-kravo-orange transition-colors" title="Akun Saya">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
