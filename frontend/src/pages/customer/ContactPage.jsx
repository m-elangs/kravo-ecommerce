import React from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider">Layanan Bantuan</span>
        <h1 className="text-4xl font-black text-kravo-dark">Hubungi Tim KRAVO</h1>
        <p className="text-sm text-slate-600">
          Punya pertanyaan seputar rasa, stok kemitraan grosir, atau saran? Kami siap mendengarkan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-6">
          <h3 className="text-xl font-black text-kravo-dark">Kirimkan Pesan</h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Anda</label>
              <input type="text" placeholder="Nama lengkap" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
              <input type="email" placeholder="nama@email.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Pesan / Masukan</label>
              <textarea rows="4" placeholder="Tuliskan pesan Anda..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"></textarea>
            </div>
            <button className="w-full py-3 px-6 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors">
              <Send className="w-4 h-4" /> Kirim Pesan
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-kravo-dark text-white p-8 rounded-3xl space-y-6 shadow-xl">
            <h3 className="text-xl font-black text-kravo-cream">Kantor Pusat & Gudang</h3>
            <div className="space-y-4 text-sm text-kravo-cream/80">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-kravo-orange flex-shrink-0 mt-0.5" />
                <span>PT Kravo Boga Nusantara, Kawasan Industri Modern Daan Mogot Kav. 22, Jakarta Barat, 11840</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-kravo-orange flex-shrink-0" />
                <span>+62 812-3456-7890 (Hotline & WhatsApp)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-kravo-orange flex-shrink-0" />
                <span>support@kravo.id / wholesale@kravo.id</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
