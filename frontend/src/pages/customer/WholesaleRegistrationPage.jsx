import React, { useState, useEffect } from 'react'
import { Store, Upload, CheckCircle2, ShieldCheck, ArrowRight, FileText, AlertCircle, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { resellerApi } from '../../api/resellerApi'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function WholesaleRegistrationPage() {
  const { user, isReseller, isAdmin } = useAuth()

  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('Minimarket / Toko Kelontong Modern')
  const [taxIdOrNib, setTaxIdOrNib] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [documentFile, setDocumentFile] = useState(null)

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [fileError, setFileError] = useState('')
  const [currentStatus, setCurrentStatus] = useState(null)

  useEffect(() => {
    if (user) {
      resellerApi.getStatus()
        .then(res => {
          if (res.success && res.data?.status !== 'unregistered') {
            setCurrentStatus(res.data)
            const p = res.data.profile
            if (p) {
              if (p.company_name) setCompanyName(p.company_name)
              if (p.business_type) setBusinessType(p.business_type)
              if (p.tax_id_or_nib) setTaxIdOrNib(p.tax_id_or_nib)
              if (p.business_address) setBusinessAddress(p.business_address)
            }

            // Hanya tampilkan submitted view jika status sudah APPROVED,
            // ATAU jika status pending dan DOKUMEN SUDAH DIUNGGAH.
            if (res.data.status === 'approved' || (res.data.status === 'pending' && p?.document_path)) {
              setSubmitted(true)
            } else {
              setSubmitted(false)
            }
          }
        })
        .catch(() => { })
    }
  }, [user])

  const handleFileChange = (e) => {
    setFileError('')
    const file = e.target.files?.[0]
    if (!file) {
      setDocumentFile(null)
      return
    }

    // Validasi Ukuran File (Maksimal 5 MB)
    const maxSizeBytes = 5 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setFileError('Ukuran file terlalu besar! Maksimal ukuran dokumen adalah 5 MB.')
      setDocumentFile(null)
      e.target.value = ''
      return
    }

    // Validasi Format File (PDF, PNG, JPG, JPEG)
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setFileError('Format file tidak didukung! Harap unggah dokumen berformat PDF, JPG, atau PNG.')
      setDocumentFile(null)
      e.target.value = ''
      return
    }

    setDocumentFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFileError('')

    if (!user) {
      setError('Silakan login terlebih dahulu untuk mengajukan kemitraan reseller.')
      return
    }

    // Validasi Nama Perusahaan
    if (companyName.trim().length < 3) {
      setError('Nama entitas bisnis / toko minimal 3 karakter.')
      return
    }

    // Validasi NIB / NPWP
    const cleanNib = taxIdOrNib.replace(/[^0-9a-zA-Z]/g, '')
    if (cleanNib.length < 10) {
      setError('Nomor NIB atau NPWP minimal 10 karakter / digit angka.')
      return
    }

    // Validasi Alamat
    if (businessAddress.trim().length < 10) {
      setError('Alamat fisik kantor / toko minimal 10 karakter.')
      return
    }

    // Validasi Dokumen: jika belum pernah upload sebelumnya, file wajib dipilih
    const hasPreviousDoc = currentStatus?.profile?.document_path
    if (!documentFile && !hasPreviousDoc) {
      setFileError('Dokumen verifikasi (NIB / KTP) wajib diunggah untuk mengajukan kemitraan reseller.')
      setError('Harap lengkapi dan unggah dokumen NIB / KTP usaha Anda.')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('company_name', companyName.trim())
    formData.append('business_type', businessType)
    formData.append('tax_id_or_nib', cleanNib)
    formData.append('business_address', businessAddress.trim())
    if (documentFile) {
      formData.append('document', documentFile)
    }

    try {
      const res = await resellerApi.register(formData)
      if (res.success) {
        setSubmitted(true)
        if (res.data) {
          setCurrentStatus(prev => ({ ...(prev || {}), status: 'pending', profile: res.data }))
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal mengirimkan permohonan kemitraan reseller.')
    } finally {
      setLoading(false)
    }
  }

  const isApproved = currentStatus?.status === 'approved'
  const isPendingWithDoc = currentStatus?.status === 'pending' && currentStatus?.profile?.document_path
  const isPendingNoDoc = currentStatus?.status === 'pending' && !currentStatus?.profile?.document_path

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider">Kemitraan Bisnis KRAVO B2B</span>
        <h1 className="text-4xl font-black text-kravo-dark">Pendaftaran Reseller & Distributor</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Dapatkan akses ke Tiered Pricing volume besar, Minimum Order Quantity (MOQ) terjangkau, faktur resmi, dan rotasi batch FEFO terjaga.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-kravo-creamBorder shadow-xl text-center space-y-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isApproved ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {isApproved ? 'Kemitraan Terverifikasi Aktif' : 'Permohonan Dokumen Terkirim'}
            </span>
            <h3 className="text-2xl font-black text-kravo-dark mt-1">
              Status: {isApproved ? 'Approved (Mitra Resmi KRAVO)' : 'Pending Verification Admin'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
              {isApproved 
                ? 'Akun Anda telah disetujui. Harga grosir B2B dan form pesanan volume besar kini aktif otomatis di katalog.'
                : 'Tim verifikasi KRAVO HQ sedang meninjau dokumen NIB dan identitas usaha Anda (Maksimal 1x24 jam kerja).'
              }
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 max-w-md mx-auto text-left space-y-1">
            <div className="font-bold text-slate-900">
              {isApproved ? 'Hak Akses Mitra B2B:' : 'Peraturan Bisnis Selama Status Pending:'}
            </div>
            {isApproved ? (
              <>
                <p>• Akses katalog harga grosir pabrik.</p>
                <p>• Prioritas alokasi batch FEFO tanggal produksi teranyar.</p>
                <p>• Layanan ekspedisi kargo resmi.</p>
              </>
            ) : (
              <>
                <p>• Akun Anda tetap dapat berbelanja dengan harga retail biasa.</p>
                <p>• Segera setelah disetujui, harga grosir B2B dan form bulk order akan aktif otomatis.</p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kravo-dark text-white text-xs font-bold hover:bg-kravo-orange transition-colors"
            >
              {isApproved ? 'Buka Katalog Grosir' : 'Kembali ke Katalog Snack'} <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-kravo-orange hover:border-kravo-orange text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Perbarui Berkas / Data Usaha
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 rounded-3xl border border-kravo-creamBorder shadow-xl space-y-8">
          
          {/* Banner jika user belum login */}
          {!user && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm block text-amber-950 mb-0.5">Belum memiliki akun KRAVO?</span>
                <span className="text-amber-800">Daftar langsung akun mitra reseller baru atau login jika sudah memiliki akun.</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to="/account?mode=register&type=reseller" className="px-4 py-2.5 bg-kravo-dark text-white rounded-xl font-bold hover:bg-kravo-orange transition-colors shadow-sm">
                  Daftar Reseller Sekarang
                </Link>
                <Link to="/account" className="px-4 py-2.5 bg-white border border-amber-300 text-slate-800 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Masuk
                </Link>
              </div>
            </div>
          )}

          {/* Banner jika akun reseller baru dibuat tapi belum upload dokumen NIB */}
          {isPendingNoDoc && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-kravo-orange flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 text-sm">Langkah Terakhir: Unggah Dokumen Verifikasi (NIB / KTP)</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Akun Anda sudah terdaftar sebagai calon mitra reseller. Silakan pilih dan unggah dokumen NIB atau KTP Anda pada bagian <strong>2. Unggah Dokumen Verifikasi Bisnis</strong> di bawah agar admin dapat memverifikasi toko Anda.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Company Profile */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-kravo-dark flex items-center gap-2">
              <Store className="w-5 h-5 text-kravo-orange" /> 1. Informasi Usaha / Toko
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">
                  Nama Entitas Bisnis / Toko <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Contoh: Toko Snack Barokah / CV Maju Rasa"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Minimal 3 karakter</span>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  Nomor Induk Berusaha (NIB) / NPWP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={taxIdOrNib}
                  onChange={(e) => setTaxIdOrNib(e.target.value)}
                  required
                  placeholder="13 Digit NIB / NPWP"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">10 - 20 digit angka legalitas</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1">Jenis Usaha Ritel</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange cursor-pointer"
                >
                  <option value="Minimarket / Toko Kelontong Modern">Minimarket / Toko Kelontong Modern</option>
                  <option value="Distributor Regional Kargo">Distributor Regional Kargo</option>
                  <option value="Agen Snack Rumahan / Online Shop">Agen Snack Rumahan / Online Shop</option>
                  <option value="Kafe & Resto (Snack Counter)">Kafe & Resto (Snack Counter)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1">
                  Alamat Fisik Kantor / Toko / Gudang <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  required
                  placeholder="Alamat lengkap lokasi toko atau gudang penerimaan kargo..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange resize-none"
                ></textarea>
                <span className="text-[10px] text-slate-400 mt-1 block">Minimal 10 karakter</span>
              </div>
            </div>
          </div>

          {/* Step 2: Upload Documents */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-black text-kravo-dark flex items-center gap-2">
              <Upload className="w-5 h-5 text-kravo-orange" /> 2. Unggah Dokumen Verifikasi Bisnis <span className="text-rose-500">*</span>
            </h3>

            <div className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-2 transition-colors ${
              fileError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 hover:border-kravo-orange bg-slate-50/50'
            }`}>
              <FileText className={`w-8 h-8 mx-auto ${fileError ? 'text-rose-500' : 'text-slate-400'}`} />
              <div className="text-xs font-bold text-slate-700">Pilih Dokumen NIB / KTP Penanggung Jawab</div>
              <p className="text-[11px] text-slate-400">Format yang didukung: PDF, PNG, JPG (Maks. 5 MB)</p>
              
              <input
                type="file"
                onChange={handleFileChange}
                className="text-xs text-slate-500 pt-2 block mx-auto cursor-pointer"
                accept=".pdf,.png,.jpg,.jpeg"
              />

              {fileError && (
                <p className="text-xs font-bold text-rose-600 pt-2 flex items-center justify-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> {fileError}
                </p>
              )}

              {documentFile && !fileError && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{documentFile.name} ({(documentFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}

              {currentStatus?.profile?.document_path && !documentFile && (
                <p className="text-[11px] text-slate-500 pt-1">
                  ✓ Dokumen sebelumnya telah tersimpan. Pilih file baru di atas jika ingin menggantinya.
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-xs sm:text-sm shadow-lg shadow-kravo-orange/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Mengirimkan Permohonan...' : 'Kirimkan Berkas Pendaftaran B2B'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  )
}
