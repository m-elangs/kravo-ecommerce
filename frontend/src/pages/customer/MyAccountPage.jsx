import React, { useState } from 'react'
import { User, MapPin, Lock, LogOut, CheckCircle2, AlertCircle, ArrowRight, Store } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function MyAccountPage() {
  const { user, login, register, logout, isApprovedReseller } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('budi@example.com')
  const [loginPassword, setLoginPassword] = useState('password123')
  
  // Register State
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    if (regPassword !== regPasswordConfirm) {
      setError('Konfirmasi kata sandi tidak cocok.')
      return
    }
    setLoading(true)
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        password_confirmation: regPasswordConfirm,
      })
      if (res.success) {
        setSuccess('Pendaftaran berhasil!')
      }
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
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
                ? 'Nikmati kemudahan belanja snack retail dan akses kemitraan grosir.' 
                : 'Mulai pengalaman menikmati snack gourmet terbaik hari ini.'}
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 text-slate-500">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(false); setError(''); }}
                  className="text-kravo-orange font-bold hover:underline"
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
              <div>
                <label className="block text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Alamat Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="nama@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Kata Sandi (Minimal 8 Karakter)</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Konfirmasi Kata Sandi</label>
                <input
                  type="password"
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 text-slate-500">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(true); setError(''); }}
                  className="text-kravo-orange font-bold hover:underline"
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
              {isApprovedReseller && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  B2B Verified Reseller ✓
                </span>
              )}
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
            
            <Link to="/wholesale" className="block w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-indigo-700 font-bold transition-colors">
              <Store className="w-3.5 h-3.5 inline mr-1" /> Status Kemitraan Grosir B2B
            </Link>

            <button 
              onClick={logout} 
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 pt-4 border-t border-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Keluar dari Akun
            </button>
          </div>
        </div>

        {/* Account Info Details */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-6">
          <h3 className="font-extrabold text-lg text-kravo-dark">Detail Akun & Kemitraan</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-400 mb-1">Nama Lengkap</label>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-800">{user.name}</div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Alamat Email</label>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-800">{user.email}</div>
            </div>
          </div>

          {user.reseller_profile && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-kravo-orange" /> Informasi Badan Usaha Reseller
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Perusahaan / Toko:</span>
                  <span className="font-bold text-slate-800">{user.reseller_profile.company_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NIB / NPWP:</span>
                  <span className="font-mono font-bold text-slate-800">{user.reseller_profile.tax_id_or_nib}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Status Approval Admin:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    user.reseller_profile.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {user.reseller_profile.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
