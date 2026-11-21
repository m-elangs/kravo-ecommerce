import React, { useState } from 'react'
import { Store, Check, X, FileText, Eye } from 'lucide-react'

export default function ResellersListPage() {
  const [resellers, setResellers] = useState([
    { id: 1, company: 'CV Snack Barokah Mandiri', owner: 'Haji Ahmad', nib: '9120019283741', type: 'Distributor Regional', doc: 'NIB_CV_Barokah.pdf', status: 'approved' },
    { id: 2, company: 'Toko Cemilan Gaul', owner: 'Dewi Sartika', nib: '9120098471625', type: 'Minimarket / Toko', doc: 'KTP_Dewi.jpg', status: 'pending' },
  ])

  const handleAction = (id, newStatus) => {
    setResellers(resellers.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Verifikasi Mitra Reseller & B2B</h1>
          <p className="text-xs text-slate-500">Persetujuan dokumen legalitas untuk pembukaan akses harga grosir.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Nama Badan Usaha / Toko</th>
              <th className="py-3 px-4">Pemilik / PIC</th>
              <th className="py-3 px-4">NIB / NPWP</th>
              <th className="py-3 px-4">Kategori Usaha</th>
              <th className="py-3 px-4">Dokumen Bisnis</th>
              <th className="py-3 px-4">Status Approval</th>
              <th className="py-3 px-4 text-right">Tindakan Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {resellers.map(r => (
              <tr key={r.id}>
                <td className="py-3.5 px-4 font-bold text-slate-900">{r.company}</td>
                <td className="py-3.5 px-4">{r.owner}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{r.nib}</td>
                <td className="py-3.5 px-4">{r.type}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-kravo-orange font-bold cursor-pointer hover:underline">
                    <FileText className="w-3.5 h-3.5" /> {r.doc}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  {r.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleAction(r.id, 'approved')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Setujui
                      </button>
                      <button 
                        onClick={() => handleAction(r.id, 'rejected')}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Tolak
                      </button>
                    </>
                  )}
                  {r.status === 'approved' && (
                    <span className="text-emerald-700 text-xs font-bold">Akses Grosir Aktif</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
