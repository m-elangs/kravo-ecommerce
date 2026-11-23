import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ShieldCheck, Truck, RefreshCw, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Footer() {
  const { isReseller } = useAuth()
  return (
    <footer className="bg-kravo-dark text-kravo-cream mt-auto border-t border-kravo-darkMuted">
      {/* Brand Value Pillars */}
      <div className="border-b border-kravo-darkMuted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-kravo-orange/20 text-kravo-orange flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Bahan Alami</h4>
              <p className="text-xs text-kravo-cream/70">Tanpa pengawet buatan berbahaya</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-kravo-orange/20 text-kravo-orange flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Standar FEFO & Halal</h4>
              <p className="text-xs text-kravo-cream/70">Selalu batch produksi paling segar</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-kravo-orange/20 text-kravo-orange flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Pengiriman Cepat</h4>
              <p className="text-xs text-kravo-cream/70">Packing bubble wrap tebal aman</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-kravo-orange/20 text-kravo-orange flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Garansi Kerenyahan</h4>
              <p className="text-xs text-kravo-cream/70">Snack mlempem kami ganti 100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-kravo-orange text-white flex items-center justify-center font-black text-xl">
              K
            </div>
            <span className="text-2xl font-black tracking-tight text-white">KRAVO</span>
          </div>
          <p className="text-sm text-kravo-cream/80 max-w-sm leading-relaxed">
            KRAVO adalah perusahaan snack kemasan modern yang memproduksi keripik kentang gourmet, cassava chips, cookies cokelat, dan snack krispi istimewa. <em>Good Snacks. Better Moments.</em>
          </p>
          <div className="flex items-center gap-3 pt-2 text-kravo-cream/80">
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-kravo-orange hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-kravo-orange hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-kravo-orange hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Belanja */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Katalog Produk</h4>
          <ul className="space-y-2.5 text-sm text-kravo-cream/70">
            <li><Link to="/products?category=potato-chips" className="hover:text-kravo-orange transition-colors">Potato Gourmet Chips</Link></li>
            <li><Link to="/products?category=cassava-chips" className="hover:text-kravo-orange transition-colors">Cassava Crispy Crunch</Link></li>
            <li><Link to="/products?category=chocolate-cookies" className="hover:text-kravo-orange transition-colors">Fudge Chocolate Cookies</Link></li>
            <li><Link to="/products?category=cheese-crackers" className="hover:text-kravo-orange transition-colors">Golden Cheese Crackers</Link></li>
            <li><Link to="/products?category=bundles" className="hover:text-kravo-orange transition-colors">Party Bundles Pack</Link></li>
          </ul>
        </div>

        {/* B2B & Kemitraan - hanya untuk Reseller */}
        {isReseller && (
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Kemitraan B2B</h4>
            <ul className="space-y-2.5 text-sm text-kravo-cream/70">
              <li><Link to="/wholesale" className="hover:text-kravo-orange transition-colors">Daftar Jadi Reseller</Link></li>
              <li><Link to="/wholesale#benefits" className="hover:text-kravo-orange transition-colors">Keuntungan & Margin</Link></li>
              <li><Link to="/wholesale#moq" className="hover:text-kravo-orange transition-colors">Aturan MOQ Grosir</Link></li>
              <li><Link to="/order-tracking" className="hover:text-kravo-orange transition-colors">Lacak Pesanan Grosir</Link></li>
              <li><Link to="/admin" className="text-kravo-orange/90 font-medium hover:underline">Portal Staff Admin</Link></li>
            </ul>
          </div>
        )}

        {/* Hubungi Kami */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Kontak & Gudang</h4>
          <ul className="space-y-3 text-sm text-kravo-cream/70">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-kravo-orange flex-shrink-0 mt-0.5" />
              <span>KRAVO Central Kitchen & Warehouse, Jakarta Barat</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-kravo-orange flex-shrink-0" />
              <span>+62 812-3456-7890</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-kravo-orange flex-shrink-0" />
              <span>support@kravo.id</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-kravo-darkMuted/60 py-6 text-center text-xs text-kravo-cream/60">
        &copy; {new Date().getFullYear()} KRAVO Indonesia (PT Kravo Boga Nusantara). Hak Cipta Dilindungi Undang-Undang.
      </div>
    </footer>
  )
}
