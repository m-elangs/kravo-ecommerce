import React, { useState, useEffect } from 'react'
import { Store, Check, X, FileText, Loader2 } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

export default function ResellersListPage() {
  const [resellers, setResellers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchResellers = () => {
    setLoading(true)
    adminApi.getResellers()
      .then(res => {
        if (res.success && res.data) {
          setResellers(res.data)
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchResellers()
  }, [])

  const handleVerify = async (id, status) => {
    let rejectionReason = null
    if (status === 'rejected') {
      rejectionReason = prompt('Masukkan alasan penolakan permohonan kemitraan:')
      if (!rejectionReason) return
    }

    try {
      const res = await adminApi.verifyReseller(id, {
        status,
        rejection_reason: rejectionReason,
      })
      if (res.success) {
        alert(`Status reseller berhasil diubah menjadi ${status.toUpperCase()}!`)
        fetchResellers()
      }
    } catch (e) {
      alert('Gagal memverifikasi reseller.')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Verifikasi Mitra Reseller & Distributor B2B</h1>
          <p className="text-xs text-slate-500">Pemeriksaan legalitas NIB/NPWP untuk pembukaan akses katalog harga grosir.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs">Memuat permohonan reseller...</span>
        </div>
      ) : resellers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Permohonan Reseller</h3>
          <p className="text-xs text-slate-500">Pendaftaran reseller baru akan muncul di sini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Nama Usaha / Toko</th>
                <th className="py-3 px-4">Penanggung Jawab</th>
                <th className="py-3 px-4">NIB / NPWP</th>
                <th className="py-3 px-4">Kategori Usaha</th>
                <th className="py-3 px-4">Status Kemitraan</th>
                <th className="py-3 px-4 text-right">Tindakan Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {resellers.map(r => (
                <tr key={r.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.company_name}</td>
                  <td className="py-3.5 px-4">{r.user?.name || '-'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{r.tax_id_or_nib}</td>
                  <td className="py-3.5 px-4">{r.business_type}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {r.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleVerify(r.id, 'approved')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" /> Setujui B2B
                        </button>
                        <button
                          onClick={() => handleVerify(r.id, 'rejected')}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <X className="w-3 h-3" /> Tolak
                        </button>
                      </>
                    ) : (
                      <span className="text-emerald-700 text-xs font-bold">Terverifikasi Aktif ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
