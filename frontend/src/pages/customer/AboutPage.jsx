import React from 'react'
import { Sparkles, ShieldCheck, Heart, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-widest">Kisah Kami</span>
        <h1 className="text-4xl sm:text-5xl font-black text-kravo-dark tracking-tight">Good Snacks. Better Moments.</h1>
        <p className="text-slate-600 leading-relaxed text-base">
          KRAVO lahir dari obsesi menciptakan camilan modern yang memadukan cita rasa lokal autentik dengan kualitas standar dunia. Kami percaya camilan bukan sekadar pengisi perut, melainkan teman momen terbaik Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-kravo-orange/15 text-kravo-orange flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-kravo-dark">Rasa Gourmet Autentik</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Dari racikan Black Truffle asli, keju cheddar matang, hingga cabai ghost pepper pilihan tanpa perisa kimia sintetik berlebih.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-kravo-dark">FEFO Food Safety Standard</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Sistem rotasi inventaris modern berbasis *First Expired, First Out* memastikan produk yang sampai di tangan Anda selalu batch yang paling segar dari oven.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-kravo-dark">Kemitraan Petani Lokal</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            100% singkong dan kentang kami dipanen langsung oleh mitra petani binaan lokal di dataran tinggi Jawa Barat dan Dieng.
          </p>
        </div>
      </div>
    </div>
  )
}
