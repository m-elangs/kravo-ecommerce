import React, { useState, useEffect } from 'react'
import { User, MapPin, Lock, LogOut, CheckCircle2, AlertCircle, ArrowRight, Store, ShieldCheck, Clock, Building2, Briefcase, Home, Edit3, X, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../api/authApi'
import { Link, useSearchParams } from 'react-router-dom'

export default function MyAccountPage() {
  const { user, login, register, logout, updateUser, isReseller, isApprovedReseller } = useAuth()
  const [searchParams] = useSearchParams()

  const initialRegisterMode = searchParams.get('mode') === 'register' || searchParams.get('type') === 'reseller'
  const [isLoginMode, setIsLoginMode] = useState(!initialRegisterMode)

  // Login State
  const [loginEmail, setLoginEmail] = useState('customer@kravo.id')
  const [loginPassword, setLoginPassword] = useState('password123')

  // Register State
  const [accountType, setAccountType] = useState(searchParams.get('type') === 'reseller' ? 'reseller' : 'customer')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')

  // Register Home Address Fields (Opsional saat daftar)
  const [regStreetAddress, setRegStreetAddress] = useState('')
  const [regCity, setRegCity] = useState('')
  const [regProvince, setRegProvince] = useState('')
  const [regPostalCode, setRegPostalCode] = useState('')

  // Reseller Extra Business Fields
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('Minimarket / Toko Kelontong Modern')
  const [taxIdOrNib, setTaxIdOrNib] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Address Editing State
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressSuccess, setAddressSuccess] = useState('')
  const [addressError, setAddressError] = useState('')

  const primaryAddress = user?.addresses?.find(a => a.is_primary) || user?.addresses?.[0] || null

  const [addressForm, setAddressForm] = useState({
    recipient_name: '',
    phone_number: '',
    street_address: '',
    city: '',
    province: '',
    postal_code: '',
  })

  // Synchronize address form when user loads
  useEffect(() => {
    if (user) {
      const addr = user.addresses?.find(a => a.is_primary) || user.addresses?.[0]
      setAddressForm({
        recipient_name: addr?.recipient_name || user.name || '',
        phone_number: addr?.phone_number || user.phone || '',
        street_address: addr?.street_address || '',
        city: addr?.city || '',
        province: addr?.province || '',
        postal_code: addr?.postal_code || '',
      })
    }
  }, [user])

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setAddressError('')
    setAddressSuccess('')

    if (!addressForm.street_address.trim() || addressForm.street_address.trim().length < 5) {
      setAddressError('Alamat jalan / rumah minimal 5 karakter.')
      return
    }
    if (!addressForm.city.trim()) {
      setAddressError('Kota / Kabupaten wajib diisi.')
      return
    }
    if (!addressForm.province.trim()) {
      setAddressError('Provinsi wajib diisi.')
      return
    }
    if (!addressForm.postal_code.trim()) {
      setAddressError('Kode pos wajib diisi.')
      return
    }

    setAddressLoading(true)
    try {
      const res = await authApi.updateAddress(addressForm)
      if (res.success && res.data?.user) {
        if (updateUser) updateUser(res.data.user)
        setAddressSuccess('Data diri alamat rumah berhasil disimpan!')
        setIsEditingAddress(false)
      }
    } catch (err) {
      setAddressError(err.response?.data?.message || err.message || 'Gagal menyimpan alamat rumah.')
    } finally {
      setAddressLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('type') === 'reseller') {
      setIsLoginMode(false)
      setAccountType('reseller')
    }
  }, [searchParams])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await login(loginEmail, loginPassword)
      if (res.success) {
        setSuccess('Login berhasil!')
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email dan password.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (regName.trim().length < 3) {
      setError('Nama lengkap minimal 3 karakter.')
      return
    }

    const cleanPhone = regPhone.replace(/[\s\-]/g, '')
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,12}$/
    if (!phoneRegex.test(cleanPhone)) {
      setError('Nomor HP tidak valid. Gunakan format nomor Indonesia (contoh: 081234567890).')
      return
    }

    if (regPassword.length < 8) {
      setError('Kata sandi minimal 8 karakter.')
      return
    }

    if (regPassword !== regPasswordConfirm) {
      setError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    if (accountType === 'reseller') {
      if (companyName.trim().length < 3) {
        setError('Nama entitas usaha / toko minimal 3 karakter.')
        return
      }
      const cleanNib = taxIdOrNib.replace(/[^0-9a-zA-Z]/g, '')
      if (cleanNib.length < 10) {
        setError('Nomor NIB atau NPWP minimal 10 karakter / digit angka.')
        return
      }
      if (businessAddress.trim().length < 10) {
        setError('Alamat fisik toko / kantor minimal 10 karakter.')
        return
      }
    }

    setLoading(true)
    try {
      const payload = {
        name: regName.trim(),
        email: regEmail.trim(),
        phone: cleanPhone,
        password: regPassword,
        password_confirmation: regPasswordConfirm,
        account_type: accountType,
        street_address: regStreetAddress.trim() || undefined,
        city: regCity.trim() || undefined,
        province: regProvince.trim() || undefined,
        postal_code: regPostalCode.trim() || undefined,
      }

      if (accountType === 'reseller') {
        payload.company_name = companyName.trim()
        payload.business_type = businessType
        payload.tax_id_or_nib = taxIdOrNib.replace(/[^0-9a-zA-Z]/g, '')
        payload.business_address = businessAddress.trim()
      }

      const res = await register(payload)

      if (res.success) {
        setSuccess(
          accountType === 'reseller'
            ? 'Pendaftaran Akun Mitra Reseller berhasil! Permohonan sedang ditinjau tim admin KRAVO HQ.'
            : 'Pendaftaran berhasil! Selamat datang di KRAVO.'
        )
      }
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 transition-all">
        <div className="bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-kravo-dark text-kravo-orange flex items-center justify-center font-black text-2xl mx-auto">
              K
            </div>
            <h1 className="text-2xl font-black text-kravo-dark">
              {isLoginMode ? 'Masuk ke Akun KRAVO' : 'Daftar Akun Baru'}
            </h1>
            <p className="text-xs text-slate-500">
              {isLoginMode
                ? 'Nikmati kemudahan belanja snack retail.'
                : 'Daftar akun belanja snack KRAVO Anda.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {isLoginMode ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Kata Sandi</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange font-bold text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 text-slate-500">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(false); setError(''); }}
                  className="text-kravo-orange font-bold hover:underline cursor-pointer"
                >
                  Daftar di sini
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <span className="font-bold block text-slate-700">Akun Demo Siap Pakai:</span>
                <div>Admin: <code>admin@kravo.id</code> / <code>password123</code></div>
                <div>Reseller: <code>reseller@kravo.id</code> / <code>password123</code></div>
                <div>Customer: <code>customer@kravo.id</code> / <code>password123</code></div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold">
              {/* Pilihan Tipe Akun: Customer vs Reseller */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold text-xs">Pilih Jenis Akun *</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setAccountType('customer')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      accountType === 'customer'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-4 h-4 text-kravo-orange" />
                    <span>Pelanggan Retail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('reseller')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      accountType === 'reseller'
                        ? 'bg-kravo-dark text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Store className="w-4 h-4 text-kravo-orange" />
                    <span>Mitra Reseller B2B</span>
                  </button>
                </div>
              </div>

              {/* Banner Fasilitas Reseller jika mode reseller */}
              {accountType === 'reseller' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Store className="w-4 h-4 text-kravo-orange" />
                    <span>Fasilitas Kemitraan Reseller KRAVO:</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Akses harga grosir pabrik, Tiered Pricing volume besar, dan prioritas batch FEFO. Akun akan ditinjau admin dalam 1x24 jam.
                  </p>
                </div>
              )}

              {/* Data Pribadi Akun */}
              <div>
                <label className="block text-slate-600 mb-1">
                  {accountType === 'reseller' ? 'Nama Penanggung Jawab / Pemilik Usaha *' : 'Nama Lengkap *'}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Alamat Email *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Nomor WhatsApp / HP *</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    placeholder="081234567890"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                  />
                </div>
              </div>

              {/* Field Tambahan Khusus Reseller */}
              {accountType === 'reseller' && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-black uppercase tracking-wider text-kravo-orange block">
                    Informasi Entitas Usaha / Toko B2B
                  </span>

                  <div>
                    <label className="block text-slate-600 mb-1">Nama Usaha / Toko *</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required={accountType === 'reseller'}
                      placeholder="Contoh: Toko Snack Barokah / CV Maju Rasa"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Jenis Usaha Ritel</label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange text-slate-800 cursor-pointer"
                      >
                        <option value="Minimarket / Toko Kelontong Modern">Minimarket / Toko Kelontong Modern</option>
                        <option value="Distributor Regional Kargo">Distributor Regional Kargo</option>
                        <option value="Agen Snack Rumahan / Online Shop">Agen Snack Rumahan / Online Shop</option>
                        <option value="Kafe / Restoran / Horeka">Kafe / Restoran / Horeka</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Nomor Induk Berusaha (NIB) / NPWP</label>
                      <input
                        type="text"
                        value={taxIdOrNib}
                        onChange={(e) => setTaxIdOrNib(e.target.value)}
                        placeholder="13 Digit NIB / NPWP"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Alamat Fisik Kantor / Toko / Gudang *</label>
                    <textarea
                      rows={2}
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      required={accountType === 'reseller'}
                      placeholder="Alamat lengkap lokasi pengiriman kargo atau gerai fisik..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange text-slate-800 resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Kata Sandi (Min. 8 Karakter) *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Konfirmasi Kata Sandi *</label>
                  <input
                    type="password"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 bg-kravo-orange hover:bg-kravo-orangeHover text-white shadow-kravo-orange/30"
              >
                {loading
                  ? 'Mendaftarkan...'
                  : accountType === 'reseller'
                  ? 'Kirim Pendaftaran Reseller B2B'
                  : 'Daftar Akun Retail'}{' '}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 text-slate-500">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(true); setError(''); }}
                  className="text-kravo-orange font-bold hover:underline cursor-pointer"
                >
                  Masuk di sini
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  // Authenticated Profile View
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Profil Pelanggan</span>
        <h1 className="text-3xl font-black text-kravo-dark">Akun Saya</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-kravo-creamBorder">
            <div className="w-12 h-12 rounded-2xl bg-kravo-dark text-kravo-orange font-black text-lg flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-kravo-dark text-base">{user.name}</h3>
              <span className="text-xs text-slate-500 block capitalize">{user.role?.display_name || 'Member'}</span>
              {isReseller && isApprovedReseller ? (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  B2B Verified Reseller ✓
                </span>
              ) : isReseller ? (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Verifikasi Pending ⏳
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-1 text-xs font-semibold text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 block text-[10px]">Email:</span>
              <span className="font-bold text-slate-800">{user.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 block text-[10px]">Telepon / WA:</span>
              <span className="font-bold text-slate-800">{user.phone || '-'}</span>
            </div>

            <Link to="/account/orders" className="block w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              Riwayat Transaksi Pesanan
            </Link>

            {isReseller && (
              <Link to="/wholesale" className="block w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-indigo-700 font-bold transition-colors">
                <Store className="w-3.5 h-3.5 inline mr-1" /> Status Kemitraan Grosir B2B
              </Link>
            )}

            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 pt-4 border-t border-slate-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Keluar dari Akun
            </button>
          </div>
        </div>

        {/* Account Info Details */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-xl text-kravo-dark">
                {isReseller ? 'Detail Akun & Kemitraan Reseller B2B' : 'Detail Akun Saya'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isReseller
                  ? 'Informasi penanggung jawab usaha dan profil kemitraan grosir Anda.'
                  : 'Informasi profil dan data diri alamat rumah Anda untuk pengiriman snack.'}
              </p>
            </div>
            {primaryAddress && !isEditingAddress && (
              <button
                type="button"
                onClick={() => { setIsEditingAddress(true); setAddressSuccess(''); setAddressError(''); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-kravo-orange/30 text-kravo-orange hover:bg-orange-50 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Alamat Rumah</span>
              </button>
            )}
          </div>

          {addressSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{addressSuccess}</span>
            </div>
          )}

          {addressError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{addressError}</span>
            </div>
          )}

          {/* Section 1: Data Pribadi */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Data Pribadi
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">
                  {isReseller ? 'Nama Penanggung Jawab' : 'Nama Lengkap'}
                </label>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800 font-bold">{user.name}</div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Alamat Email</label>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800">{user.email}</div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Nomor WhatsApp / HP</label>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800 font-mono">{user.phone || '-'}</div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tipe Akun</label>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    isReseller ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {isReseller ? 'Mitra Reseller B2B' : 'Pelanggan Retail'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Data Diri Alamat Rumah */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-kravo-orange flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">
                    {isReseller ? 'Data Diri Alamat Rumah (Tempat Tinggal Pemilik)' : 'Data Diri Alamat Rumah'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Alamat tempat tinggal untuk pengiriman pesanan atau korespondensi resmi.
                  </p>
                </div>
              </div>
            </div>

            {isEditingAddress ? (
              /* Address Edit Form */
              <form onSubmit={handleSaveAddress} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Form Data Diri Alamat Rumah</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Nama Penerima *</label>
                    <input
                      type="text"
                      value={addressForm.recipient_name}
                      onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                      required
                      placeholder="Nama lengkap penerima"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Nomor WhatsApp / HP Penerima *</label>
                    <input
                      type="text"
                      value={addressForm.phone_number}
                      onChange={(e) => setAddressForm({ ...addressForm, phone_number: e.target.value })}
                      required
                      placeholder="081234567890"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Alamat Jalan / Nomor Rumah / RT RW *</label>
                  <textarea
                    rows={2}
                    value={addressForm.street_address}
                    onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                    required
                    placeholder="Contoh: Jl. Senopati No. 45, RT 02/RW 03, Kel. Senayan, Kec. Kebayoran Baru"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-kravo-orange text-slate-800 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Kota / Kabupaten *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                      placeholder="Contoh: Jakarta Selatan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Provinsi *</label>
                    <input
                      type="text"
                      value={addressForm.province}
                      onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                      required
                      placeholder="Contoh: DKI Jakarta"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Kode Pos *</label>
                    <input
                      type="text"
                      value={addressForm.postal_code}
                      onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                      required
                      placeholder="Contoh: 12190"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-kravo-orange text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={addressLoading}
                    className="px-5 py-2 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold shadow-sm cursor-pointer transition-all disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {addressLoading ? 'Menyimpan...' : 'Simpan Alamat Rumah'}
                  </button>
                </div>
              </form>
            ) : primaryAddress ? (
              /* Display Saved Address */
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-kravo-orange/30 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-xs">
                      {primaryAddress.recipient_name || user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({primaryAddress.phone_number || user.phone || '-'})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Rumah Utama
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {primaryAddress.street_address}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-1">
                  <MapPin className="w-3.5 h-3.5 text-kravo-orange shrink-0" />
                  <span>
                    {[primaryAddress.city, primaryAddress.province, primaryAddress.postal_code].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            ) : (
              /* Empty Address State */
              <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-800">Alamat Rumah Belum Ditambahkan</h5>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5">
                    Lengkapi alamat rumah Anda sekarang agar proses belanja, checkout, dan pengiriman snack langsung terisi otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsEditingAddress(true); setAddressSuccess(''); setAddressError(''); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Alamat Rumah Sekarang</span>
                </button>
              </div>
            )}
          </div>

          {/* Reseller Profile Status Card - only for reseller role */}
          {isReseller && user.reseller_profile && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-kravo-orange" /> Informasi Kemitraan Agen & Reseller
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${user.reseller_profile.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : user.reseller_profile.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                  }`}>
                  {user.reseller_profile.status.toUpperCase()}
                </span>
              </div>

              {user.reseller_profile.status === 'pending' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-normal">
                    Permohonan kemitraan Anda <strong>sedang ditinjau oleh Admin KRAVO HQ</strong>. Setelah diverifikasi, akun Anda otomatis dapat membeli dengan <strong>Harga Grosir Bertingkat</strong> sesuai syarat MOQ.
                  </p>
                </div>
              )}

              {user.reseller_profile.status === 'approved' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-normal">
                    Selamat! Akun Anda telah <strong>terverifikasi resmi</strong> sebagai Agen/Reseller B2B KRAVO. Diskon grosir otomatis aktif saat Anda membeli snack memenuhi ketentuan MOQ (Minimum Order Quantity).
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs font-normal">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Perusahaan / Toko:</span>
                  <span className="font-bold text-slate-800">{user.reseller_profile.company_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Jenis Usaha:</span>
                  <span className="font-bold text-slate-800">{user.reseller_profile.business_type || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NIB / NPWP:</span>
                  <span className="font-mono font-bold text-slate-800">{user.reseller_profile.tax_id_or_nib || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Alamat Fisik Toko / Gudang Kargo:</span>
                  <span className="font-medium text-slate-800">{user.reseller_profile.business_address || '-'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
