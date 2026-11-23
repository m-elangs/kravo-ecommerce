import React, { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, AlertCircle, Loader2, Clock, Sparkles } from 'lucide-react'
import { contactApi } from '../../api/contactApi'
import { useAuth } from '../../contexts/AuthContext'

export default function ContactPage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Pertanyaan Seputar Produk & Rasa',
    message: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || ''
      }))
    }
  }, [user])

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError('Silakan masukkan nama lengkap Anda.')
      return
    }

    if (!form.email.trim()) {
      setError('Silakan masukkan alamat email Anda.')
      return
    }

    if (!validateEmail(form.email)) {
      setError('Format email tidak valid. Harap gunakan format yang benar (contoh: budi@gmail.com).')
      return
    }

    if (!form.message.trim() || form.message.trim().length < 5) {
      setError('Pesan terlalu singkat. Tuliskan minimal 5 karakter.')
      return
    }

    setSubmitting(true)
    try {
      await contactApi.sendMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject || null,
        message: form.message.trim()
      })
      setSuccess(true)
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        subject: 'Pertanyaan Seputar Produk & Rasa',
        message: ''
      })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal mengirimkan pesan. Silakan coba sesaat lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Layanan Bantuan</span>
        <h1 className="text-4xl font-black text-kravo-dark">Hubungi Tim KRAVO</h1>
        <p className="text-sm text-slate-600">
          Punya pertanyaan seputar rasa, stok kemitraan grosir, kendala pesanan, atau saran? Tim kami siap merespons Anda dalam 1x24 jam.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Contact Form Card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-kravo-dark">Kirimkan Pesan</h3>
              <span className="text-xs text-slate-400">Pesan akan langsung masuk ke portal layanan bantuan admin.</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-kravo-orange flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          {success ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">Pesan Anda Berhasil Terkirim!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Terima kasih telah menghubungi KRAVO. Tim layanan pelanggan kami akan segera membaca pesan Anda dan membalas melalui email / WhatsApp.
                </p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-xl bg-kravo-dark hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md"
              >
                Kirim Pesan Lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-kravo-orange/30 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-kravo-orange/30 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Wajib menyertakan tanda @ (cth: budi@gmail.com)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-kravo-orange/30 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topik Pesan</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-kravo-orange/30 text-xs font-medium cursor-pointer"
                >
                  <option value="Pertanyaan Seputar Produk & Rasa">Pertanyaan Seputar Produk & Rasa Snack</option>
                  <option value="Kemitraan Reseller & Harga Grosir B2B">Kemitraan Reseller & Harga Grosir B2B</option>
                  <option value="Status Pesanan & Pengiriman">Status Pesanan & Pengiriman Paket</option>
                  <option value="Kendala Pembayaran / Midtrans">Kendala Pembayaran / Midtrans</option>
                  <option value="Saran, Masukan & Kritik">Saran, Masukan & Kritik Pelanggan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan / Masukan *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan pertanyaan, keluhan, atau masukan Anda secara rinci..."
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-kravo-orange/30 text-xs font-normal"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 rounded-xl bg-kravo-dark hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sedang Mengirim Pesan...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Kirim Pesan Sekarang
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Info Card */}
        <div className="space-y-6">
          <div className="bg-kravo-dark text-white p-8 sm:p-10 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-kravo-orange/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-2 text-kravo-orange text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-4 h-4" /> Customer Care
            </div>

            <h3 className="text-2xl font-black text-kravo-cream">Kantor Pusat & Gudang</h3>
            <p className="text-xs text-kravo-cream/70 leading-relaxed">
              KRAVO Modern Snacks berkomitmen melayani kebutuhan camilan retail dan suplai kemitraan grosir di seluruh Indonesia.
            </p>

            <div className="space-y-4 text-xs text-kravo-cream/90 pt-2 border-t border-white/10">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-kravo-orange flex-shrink-0 mt-0.5" />
                <span>PT Kravo Boga Nusantara, Kawasan Industri Modern Daan Mogot Kav. 22, Jakarta Barat, 11840</span>
              </div>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 hover:text-kravo-orange transition-colors"
              >
                <Phone className="w-5 h-5 text-kravo-orange flex-shrink-0" />
                <span>+62 812-3456-7890 (Hotline & WhatsApp)</span>
              </a>
              <a
                href="mailto:support@kravo.id"
                className="flex items-center gap-3 hover:text-kravo-orange transition-colors"
              >
                <Mail className="w-5 h-5 text-kravo-orange flex-shrink-0" />
                <span>support@kravo.id / wholesale@kravo.id</span>
              </a>
              <div className="flex items-center gap-3 text-kravo-cream/60">
                <Clock className="w-5 h-5 text-kravo-orange flex-shrink-0" />
                <span>Jam Operasional: Senin - Sabtu, 08.00 - 17.00 WIB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
