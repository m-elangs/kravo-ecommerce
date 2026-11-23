import React, { useState, useEffect } from 'react'
import { 
  Store, 
  Check, 
  X, 
  FileText, 
  Loader2, 
  Download, 
  Eye, 
  AlertCircle, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  ExternalLink,
  ShieldCheck,
  Search,
  Maximize2
} from 'lucide-react'
import { adminApi } from '../../api/adminApi'

export default function ResellersListPage() {
  const [resellers, setResellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Document Preview Modal State
  const [previewReseller, setPreviewReseller] = useState(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null)
  const [previewMime, setPreviewMime] = useState('')
  const [loadingDoc, setLoadingDoc] = useState(false)
  
  // Reject Modal State
  const [rejectingReseller, setRejectingReseller] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingId, setProcessingId] = useState(null)

  const fetchResellers = (status = statusFilter) => {
    setLoading(true)
    const params = status !== 'all' ? { status } : {}
    adminApi.getResellers(params)
      .then(res => {
        if (res.success && res.data) {
          setResellers(res.data)
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchResellers(statusFilter)
  }, [statusFilter])

  // Open Document Preview Modal & Fetch Blob
  const handleOpenDocPreview = async (reseller) => {
    setPreviewReseller(reseller)
    setPreviewBlobUrl(null)
    setPreviewMime('')

    if (!reseller.document_path) return

    setLoadingDoc(true)
    try {
      const blob = await adminApi.downloadResellerDocument(reseller.id)
      const blobType = blob.type || (reseller.document_path.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
      const url = window.URL.createObjectURL(blob)
      setPreviewBlobUrl(url)
      setPreviewMime(blobType)
    } catch (e) {
      alert('Dokumen gagal dibuka atau berkas fisik tidak ditemukan di server.')
    } finally {
      setLoadingDoc(false)
    }
  }

  const handleCloseDocPreview = () => {
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl)
    }
    setPreviewReseller(null)
    setPreviewBlobUrl(null)
    setPreviewMime('')
  }

  const handleVerify = async (id, status, reason = null) => {
    setProcessingId(id)
    try {
      const res = await adminApi.verifyReseller(id, {
        status,
        rejection_reason: reason,
      })
      if (res.success) {
        alert(`Status kemitraan reseller berhasil diubah menjadi: ${status.toUpperCase()}!`)
        setRejectingReseller(null)
        setRejectionReason('')
        if (previewReseller?.id === id) {
          setPreviewReseller(prev => prev ? { ...prev, status } : null)
        }
        fetchResellers()
      }
    } catch (e) {
      alert(e?.message || 'Gagal memverifikasi reseller.')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredResellers = resellers.filter(r => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      r.company_name?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q) ||
      r.tax_id_or_nib?.toLowerCase().includes(q) ||
      r.business_type?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Verifikasi Mitra Reseller & Distributor B2B
          </h1>
          <p className="text-xs text-slate-500">
            Pemeriksaan berkas legalitas NIB/NPWP dan moderasi hak akses katalog harga grosir.
          </p>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari toko, pemilik, NIB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-kravo-orange w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua ({resellers.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Disetujui
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'rejected' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Ditolak
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
          <span className="text-xs">Memuat permohonan reseller...</span>
        </div>
      ) : filteredResellers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Permohonan Reseller</h3>
          <p className="text-xs text-slate-500">
            {statusFilter === 'all' 
              ? 'Pendaftaran reseller baru akan muncul di sini.' 
              : `Tidak ada permohonan dengan status ${statusFilter.toUpperCase()}.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Nama Usaha / Toko</th>
                  <th className="py-3.5 px-4">Penanggung Jawab</th>
                  <th className="py-3.5 px-4">NIB / NPWP</th>
                  <th className="py-3.5 px-4">Kategori Usaha</th>
                  <th className="py-3.5 px-4">Berkas Dokumen NIB</th>
                  <th className="py-3.5 px-4">Status Kemitraan</th>
                  <th className="py-3.5 px-4 text-right">Tindakan Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredResellers.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{r.company_name}</div>
                      <span className="text-[11px] text-slate-400 font-normal line-clamp-1">{r.business_address || '-'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{r.user?.name || '-'}</div>
                      <div className="text-[11px] text-slate-400">{r.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{r.tax_id_or_nib}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.business_type}</td>
                    
                    {/* Dokumen NIB Column with Live Click to Preview */}
                    <td className="py-3.5 px-4">
                      {r.document_path ? (
                        <button
                          onClick={() => handleOpenDocPreview(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs transition-colors cursor-pointer shadow-sm group"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span>Lihat Dokumen</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum Ada File</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : r.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Tindakan Verifikasi */}
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDocPreview(r)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Lihat Detail Profil & Berkas"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>

                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerify(r.id, 'approved')}
                            disabled={processingId === r.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Setujui
                          </button>
                          <button
                            onClick={() => setRejectingReseller(r)}
                            disabled={processingId === r.id}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </>
                      )}

                      {r.status === 'approved' && (
                        <span className="text-emerald-700 text-xs font-bold">Terverifikasi Aktif ✓</span>
                      )}

                      {r.status === 'rejected' && (
                        <span className="text-rose-600 text-xs font-bold">Ditolak</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL DOCUMENT PREVIEW & VERIFICATION MODAL */}
      {previewReseller && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-kravo-dark text-kravo-orange flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Pratinjau Dokumen NIB & Verifikasi: {previewReseller.company_name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Periksa keaslian dokumen legalitas NIB/KTP sebelum menyetujui kemitraan B2B.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewBlobUrl && (
                  <button
                    onClick={() => window.open(previewBlobUrl, '_blank')}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-kravo-orange hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1.5"
                    title="Buka Dokumen di Tab Baru"
                  >
                    <ExternalLink className="w-4 h-4" /> Buka Tab Baru
                  </button>
                )}
                <button
                  onClick={handleCloseDocPreview}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Left Document Viewer + Right Reseller Details */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Left Column: Live Document Viewer (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-auto min-h-[350px] lg:min-h-[520px]">
                {loadingDoc ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-kravo-orange" />
                    <span className="text-xs">Mengunduh & memuat dokumen NIB pemohon...</span>
                  </div>
                ) : !previewReseller.document_path ? (
                  <div className="text-center space-y-2 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto text-slate-600" />
                    <p className="text-sm font-bold text-slate-300">Pemohon Belum Mengunggah Dokumen</p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Reseller ini belum mengunggah file NIB / KTP pada saat pengajuan kemitraan.
                    </p>
                  </div>
                ) : previewBlobUrl ? (
                  previewMime.includes('pdf') || previewReseller.document_path.endsWith('.pdf') ? (
                    <iframe
                      src={previewBlobUrl}
                      className="w-full h-[520px] rounded-2xl bg-white shadow-lg border-0"
                      title="Pratinjau PDF NIB Reseller"
                    />
                  ) : (
                    <img
                      src={previewBlobUrl}
                      alt="Dokumen NIB Reseller"
                      className="max-h-[520px] max-w-full object-contain rounded-2xl shadow-xl bg-white p-2"
                    />
                  )
                ) : (
                  <div className="text-center text-rose-400 text-xs">
                    Gagal menampilkan dokumen.
                  </div>
                )}
              </div>

              {/* Right Column: Reseller Legal Details (4 cols) */}
              <div className="lg:col-span-4 p-6 bg-white overflow-y-auto space-y-5 border-l border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-kravo-orange block">
                    Informasi Entitas Usaha
                  </span>
                  <h4 className="text-xl font-black text-slate-900 leading-tight">
                    {previewReseller.company_name}
                  </h4>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    previewReseller.status === 'approved' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : previewReseller.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {previewReseller.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 text-xs divide-y divide-slate-100 font-medium">
                  <div className="pt-2">
                    <span className="text-slate-400 block text-[11px]">Nomor NIB / NPWP</span>
                    <span className="font-mono font-extrabold text-slate-800 text-sm">
                      {previewReseller.tax_id_or_nib}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block text-[11px]">Kategori Usaha Ritel</span>
                    <span className="font-bold text-slate-800">{previewReseller.business_type}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block text-[11px]">Alamat Fisik Kantor / Gudang</span>
                    <p className="text-slate-700 leading-relaxed mt-0.5">{previewReseller.business_address || '-'}</p>
                  </div>

                  <div className="pt-2 space-y-1.5">
                    <span className="text-slate-400 block text-[11px]">Kontak Penanggung Jawab</span>
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{previewReseller.user?.name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{previewReseller.user?.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{previewReseller.user?.phone || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Approve / Reject within modal */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">Tindakan Moderasi:</span>
                  
                  {previewReseller.status === 'pending' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleVerify(previewReseller.id, 'approved')}
                        disabled={processingId === previewReseller.id}
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Setujui Mitra
                      </button>

                      <button
                        onClick={() => {
                          const r = previewReseller
                          handleCloseDocPreview()
                          setRejectingReseller(r)
                        }}
                        disabled={processingId === previewReseller.id}
                        className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> Tolak
                      </button>
                    </div>
                  ) : previewReseller.status === 'approved' ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Reseller telah aktif & terverifikasi resmi.</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <X className="w-4 h-4 text-rose-600" />
                      <span>Permohonan reseller ditolak.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak Permohonan dengan Alasan */}
      {rejectingReseller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-slate-900">Alasan Penolakan Permohonan</h3>
            </div>
            
            <p className="text-xs text-slate-500">
              Berikan alasan penolakan untuk toko <strong className="text-slate-800">{rejectingReseller.company_name}</strong> agar pemohon dapat memperbaiki dokumen.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Dokumen NIB buram, tidak terbaca, atau nomor NPWP tidak cocok..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-500 text-xs text-slate-800 resize-none font-medium"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setRejectingReseller(null); setRejectionReason(''); }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    alert('Harap tuliskan alasan penolakan.')
                    return
                  }
                  handleVerify(rejectingReseller.id, 'rejected', rejectionReason.trim())
                }}
                disabled={processingId === rejectingReseller.id}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
