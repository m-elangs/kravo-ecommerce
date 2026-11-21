import React, { useState, useEffect } from 'react'
import { Store, Upload, CheckCircle2, ShieldCheck, ArrowRight, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { resellerApi } from '../../api/resellerApi'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function WholesaleRegistrationPage() {
  const { user } = useAuth()
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('Minimarket / Toko Kelontong Modern')
  const [taxIdOrNib, setTaxIdOrNib] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [documentFile, setDocumentFile] = useState(null)

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [currentStatus, setCurrentStatus] = useState(null)

  useEffect(() => {
    if (user) {
      resellerApi.getStatus()
        .then(res => {
          if (res.success && res.data?.status !== 'unregistered') {
            setCurrentStatus(res.data)
            if (res.data.status === 'pending' || res.data.status === 'approved') {
              setSubmitted(true)
            }
          }
        })
        .catch(() => {})
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Silakan login terlebih dahulu untuk mengajukan kemitraan reseller.')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('company_name', companyName)
    formData.append('business_type', businessType)
    formData.append('tax_id_or_nib', taxIdOrNib)
    formData.append('business_address', businessAddress)
    if (documentFile) {
      formData.append('document', documentFile)
    }

    try {
      const res = await resellerApi.register(formData)
      if (res.success) {
        setSubmitted(true)
      }
    } catch (err) {
      setError(err.message || 'Gagal mengirimkan permohonan kemitraan reseller.')
    } finally {
      setLoading(false)
    }
  }

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
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Permohonan Terkirim</span>
            <h3 className="text-2xl font-black text-kravo-dark mt-1">Status: Pending Verification Admin</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
              Tim verifikasi KRAVO HQ sedang meninjau dokumen NIB dan identitas usaha Anda (Maksimal 1x24 jam kerja).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 max-w-md mx-auto text-left space-y-1">
            <div className="font-bold text-slate-900">Peraturan Bisnis Selama Status Pending:</div>
            <p>• Akun Anda tetap dapat berbelanja dengan harga retail biasa.</p>
            <p>• Segera setelah disetujui, harga grosir B2B dan form bulk order akan aktif otomatis.</p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kravo-dark text-white text-xs font-bold hover:bg-kravo-orange transition-colors"
          >
            Kembali ke Katalog Snack <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 rounded-3xl border border-kravo-creamBorder shadow-xl space-y-8">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
                <label className="block text-slate-600 mb-1">Nama Entitas Bisnis / Toko</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required 
                  placeholder="Contoh: Toko Snack Barokah / CV Maju Rasa" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange" 
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Nomor Induk Berusaha (NIB) / NPWP</label>
                <input 
                  type="text" 
                  value={taxIdOrNib}
                  onChange={(e) => setTaxIdOrNib(e.target.value)}
                  required 
                  placeholder="13 Digit NIB / NPWP" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1">Jenis Usaha Ritel</label>
                <select 
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                >
                  <option value="Minimarket / Toko Kelontong Modern">Minimarket / Toko Kelontong Modern</option>
                  <option value="Reseller Online (Shopee / Tokopedia / TikTok)">Reseller Online (Shopee / Tokopedia / TikTok)</option>
                  <option value="Distributor Regional Kargo">Distributor Regional Kargo</option>
                  <option value="Kafe & Resto (Snack Counter)">Kafe & Resto (Snack Counter)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1">Alamat Fisik Kantor / Toko</label>
                <textarea
                  rows="3"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  required
                  placeholder="Alamat lengkap lokasi toko atau gudang penerimaan kargo..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                ></textarea>
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
              <div className="text-xs font-bold text-slate-700">Pilih Dokumen NIB / KTP Penanggung Jawab</div>
              <p className="text-[11px] text-slate-400">Format yang didukung: PDF, PNG, JPG (Maks. 5 MB)</p>
              <input 
                type="file" 
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 pt-2" 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-xs sm:text-sm shadow-lg shadow-kravo-orange/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Mengirimkan Permohonan...' : 'Kirimkan Berkas Pendaftaran B2B'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  )
}
