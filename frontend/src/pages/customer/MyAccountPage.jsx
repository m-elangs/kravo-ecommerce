import React from 'react'
import { User, MapPin, Lock, Bell, LogOut } from 'lucide-react'

export default function MyAccountPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Pengaturan</span>
        <h1 className="text-3xl font-black text-kravo-dark">Akun Saya</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-kravo-creamBorder">
            <div className="w-12 h-12 rounded-2xl bg-kravo-dark text-white font-black text-lg flex items-center justify-center">
              BS
            </div>
            <div>
              <h3 className="font-bold text-kravo-dark text-base">Budi Santoso</h3>
              <span className="text-xs text-slate-500">Member Retail</span>
            </div>
          </div>

          <div className="space-y-1 text-sm font-semibold text-slate-600">
            <button className="w-full text-left px-3 py-2 rounded-xl bg-kravo-dark text-white flex items-center gap-2">
              <User className="w-4 h-4" /> Informasi Pribadi
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Buku Alamat
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Ganti Kata Sandi
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 pt-4">
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-6">
          <h3 className="font-extrabold text-lg text-kravo-dark">Informasi Pribadi</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap</label>
              <input type="text" defaultValue="Budi Santoso" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Email</label>
              <input type="email" defaultValue="budi@example.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nomor WhatsApp</label>
              <input type="tel" defaultValue="081234567890" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50" />
            </div>
          </div>

          <button className="px-6 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-xs shadow-md">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  )
}
