import React from 'react'
import { Save, Settings, ShieldAlert } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Pengaturan Perusahaan & Gateway</h1>
        <p className="text-xs text-slate-500">Konfigurasi profil KRAVO, kunci Midtrans Sandbox, dan aturan FEFO.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Identitas Perusahaan KRAVO</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Nama Brand Resmi</label>
            <input type="text" defaultValue="KRAVO" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Tagline</label>
            <input type="text" defaultValue="Good Snacks. Better Moments." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50" />
          </div>
        </div>

        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider pt-4 border-t border-slate-100">Integrasi Midtrans Payment Gateway</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Midtrans Server Key (Sandbox)</label>
            <input type="text" defaultValue="SB-Mid-server-XXXXX" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Midtrans Client Key (Sandbox)</label>
            <input type="text" defaultValue="SB-Mid-client-XXXXX" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono" />
          </div>
        </div>

        <button className="px-6 py-2.5 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-xs font-bold transition-colors shadow-md">
          Simpan Pengaturan
        </button>
      </div>
    </div>
  )
}
