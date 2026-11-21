import React, { useState } from 'react'
import { Store, Upload, CheckCircle2, ShieldCheck, ArrowRight, FileText } from 'lucide-react'

export default function WholesaleRegistrationPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider">Kemitraan Bisnis</span>
        <h1 className="text-4xl font-black text-kravo-dark">Pendaftaran Reseller & Distributor KRAVO</h1>
        <p className="text-sm text-slate-600">
          Bergabunglah dengan jaringan ritel grosir kami. Dapatkan akses ke katalog Tiered Pricing, Minimum Order Quantity (MOQ) terukur, dan prioritas batch produksi FEFO.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-emerald-950">Aplikasi Pendaftaran Diterima!</h3>
          <p className="text-sm text-emerald-800 max-w-lg mx-auto">
            Dokumen Anda sedang dalam proses verifikasi tim KRAVO HQ (Maksimal 1x24 jam). Akun Anda saat ini berstatus <strong>Pending Verification</strong>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 rounded-3xl border border-kravo-creamBorder shadow-xl space-y-8">
          {/* Step 1: Company Profile */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-kravo-dark flex items-center gap-2">
              <Store className="w-5 h-5 text-kravo-orange" /> 1. Informasi Usaha / Toko
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Usaha / Toko</label>
                <input type="text" required placeholder="Contoh: Toko Snack Barokah / CV Maju Rasa" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nomor Induk Berusaha (NIB) / NPWP</label>
                <input type="text" required placeholder="13 Digit NIB / NPWP" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Jenis Usaha</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none">
                  <option>Minimarket / Toko Kelontong Modern</option>
                  <option>Reseller Online (Shopee/Tokopedia/TikTok Shop)</option>
                  <option>Distributor Regional Kargo</option>
                  <option>Kafe & Resto (Snack Counter)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Perkiraan Volume Pembelian Bulanan</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none">
                  <option>50 - 200 pcs / bulan</option>
                  <option>200 - 500 pcs / bulan</option>
                  <option>&gt; 500 pcs / bulan (Distributor)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Upload Documents */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-black text-kravo-dark flex items-center gap-2">
              <Upload className="w-5 h-5 text-kravo-orange" /> 2. Unggah Dokumen Verifikasi Bisnis
            </h3>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2 hover:border-kravo-orange transition-colors">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">Tarik atau Pilih Dokumen NIB / KTP Pemilik</div>
              <p className="text-[11px] text-slate-400">Format yang didukung: PDF, PNG, JPG (Maks. 5 MB)</p>
              <input type="file" className="text-xs text-slate-500 pt-2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm shadow-lg shadow-kravo-orange/30 transition-all flex items-center justify-center gap-2"
          >
            Kirimkan Berkas Pendaftaran B2B <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  )
}
