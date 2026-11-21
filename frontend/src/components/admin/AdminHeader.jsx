import React from 'react'
import { Menu, Bell, Search, ShieldCheck, ChevronDown } from 'lucide-react'

export default function AdminHeader({ onMenuClick }) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pesanan, SKU snack, nomor batch, reseller..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-kravo-orange focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right: FEFO Alert pill, Notifications & Admin Avatar */}
      <div className="flex items-center gap-4">
        {/* FEFO Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>FEFO Engine: Active</span>
        </div>

        {/* Notifications */}
        <button className="p-2.5 rounded-full text-slate-600 hover:bg-slate-100 relative transition-colors" title="Pemberitahuan">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-kravo-dark text-white font-bold text-sm flex items-center justify-center">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-slate-800 leading-tight">Admin KRAVO</span>
            <span className="block text-[11px] text-slate-500">Operations & Sales</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  )
}
