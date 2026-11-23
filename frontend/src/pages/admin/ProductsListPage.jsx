import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, RefreshCw, Package, X, Check, AlertCircle, Upload, Camera, Image, Sparkles } from 'lucide-react'
import { adminApi } from '../../api/adminApi'
import axiosClient from '../../api/axiosClient'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function ProductsListPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  // Modal State
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Quick Photo Modal State
  const [quickPhotoProduct, setQuickPhotoProduct] = useState(null)
  const [quickPhotoFile, setQuickPhotoFile] = useState(null)
  const [quickPhotoPreview, setQuickPhotoPreview] = useState(null)
  const [quickPhotoUrl, setQuickPhotoUrl] = useState('')
  const [quickPhotoSaving, setQuickPhotoSaving] = useState(false)

  // Form State
  const initialForm = {
    name: '',
    category_id: '',
    tagline: '',
    description: '',
    ingredients: '',
    storage_instructions: '',
    is_active: true,
    image_file: null,
    image_preview: null,
    image_url: '',
    manufacturing_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    variants: [
      { name: '100g Original', sku: '', retail_price: '', weight_grams: 100, moq: 1, initial_stock: 100 }
    ]
  }
  const [form, setForm] = useState(initialForm)

  const load = async (s = search, p = page) => {
    setLoading(true)
    try {
      const res = await adminApi.getProducts({ search: s, page: p, per_page: 20 })
      setProducts(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await adminApi.getCategories()
      // axiosClient interceptor sudah unwrap response.data → res = { success, data }
      let cats = res.data || res || []
      // Jika masih bukan array (bisa terjadi jika response format beda), coba unwrap lagi
      if (cats && !Array.isArray(cats) && cats.data) {
        cats = cats.data
      }
      if (!Array.isArray(cats)) cats = []
      setCategories(cats)
      if (cats.length > 0 && !form.category_id) {
        setForm(f => ({ ...f, category_id: cats[0].id }))
      }
    } catch (err) {
      console.error('[Admin] Gagal memuat kategori dari /admin/categories:', err)
      // Fallback: coba dari public API /categories
      try {
        const { default: axiosClient } = await import('../../api/axiosClient')
        const fallback = await axiosClient.get('/categories')
        let cats = fallback.data || fallback || []
        if (cats && !Array.isArray(cats) && cats.data) cats = cats.data
        if (!Array.isArray(cats)) cats = []
        setCategories(cats)
        if (cats.length > 0) {
          setForm(f => ({ ...f, category_id: cats[0].id }))
        }
      } catch (err2) {
        console.error('[Admin] Fallback /categories juga gagal:', err2)
        setCategories([])
      }
    }
  }

  useEffect(() => {
    load()
    loadCategories()
  }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load(search, 1)
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm({
      ...initialForm,
      category_id: categories.length > 0 ? categories[0].id : '',
      image_file: null,
      image_preview: null,
      image_url: '',
      manufacturing_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      variants: [{
        name: '100g Regular',
        sku: 'KRV-SNK-' + Math.floor(Math.random() * 9000 + 1000),
        retail_price: '24500',
        weight_grams: 100,
        moq: 1,
        initial_stock: 100
      }]
    })
    setError(null)
    setShowForm(true)
    // Re-fetch categories jika kosong
    if (categories.length === 0) {
      loadCategories()
    }
  }

  const openEditModal = (p) => {
    setEditingProduct(p)
    const existingImg = p.image_url || p.primary_image?.image_url || ''
    setForm({
      name: p.name || '',
      category_id: p.category_id || (categories.length > 0 ? categories[0].id : ''),
      tagline: p.tagline || '',
      description: p.description || '',
      ingredients: p.ingredients || '',
      storage_instructions: p.storage_instructions || '',
      is_active: !!p.is_active,
      image_file: null,
      image_preview: existingImg || null,
      image_url: existingImg,
      variants: (p.variants || []).map(v => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        retail_price: v.retail_price,
        weight_grams: v.weight_grams,
        moq: v.minimum_order_quantity || 1,
      }))
    })
    setError(null)
    setShowForm(true)
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran berkas foto maksimal 5MB.')
        return
      }
      setForm(f => ({
        ...f,
        image_file: file,
        image_preview: URL.createObjectURL(file),
      }))
    }
  }

  const handleRemoveImage = () => {
    setForm(f => ({
      ...f,
      image_file: null,
      image_preview: null,
      image_url: ''
    }))
  }

  const addVariant = () => {
    setForm(f => ({
      ...f,
      variants: [
        ...f.variants,
        {
          name: '',
          sku: 'KRV-VAR-' + Math.floor(Math.random() * 9000 + 1000),
          retail_price: '',
          weight_grams: 100,
          moq: 1,
          initial_stock: 100
        }
      ]
    }))
  }

  const removeVariant = (index) => {
    if (form.variants.length <= 1) {
      alert('Produk harus memiliki minimal 1 varian.')
      return
    }
    setForm(f => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index)
    }))
  }

  const updateVariant = (index, field, value) => {
    setForm(f => {
      const updated = [...f.variants]
      updated[index][field] = value
      return { ...f, variants: updated }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!form.name.trim()) {
      setError('Nama produk wajib diisi.')
      setSaving(false)
      return
    }

    if (!form.category_id) {
      setError('Silakan pilih kategori produk.')
      setSaving(false)
      return
    }

    try {
      let savedProductId = null

      if (editingProduct) {
        savedProductId = editingProduct.id
        await adminApi.updateProduct(editingProduct.id, {
          name: form.name,
          category_id: parseInt(form.category_id),
          tagline: form.tagline,
          description: form.description,
          ingredients: form.ingredients,
          storage_instructions: form.storage_instructions,
          is_active: form.is_active,
          image_url: form.image_url,
        })
      } else {
        const payload = {
          name: form.name,
          category_id: parseInt(form.category_id),
          tagline: form.tagline,
          description: form.description,
          ingredients: form.ingredients,
          storage_instructions: form.storage_instructions,
          image_url: form.image_url,
          manufacturing_date: form.manufacturing_date,
          expiry_date: form.expiry_date,
          variants: form.variants.map(v => ({
            name: v.name || 'Original',
            sku: v.sku.toUpperCase(),
            retail_price: parseFloat(v.retail_price) || 0,
            weight_grams: parseInt(v.weight_grams) || 100,
            moq: parseInt(v.moq) || 1,
            initial_stock: parseInt(v.initial_stock) || 100,
            manufacturing_date: form.manufacturing_date,
            expiry_date: form.expiry_date,
          }))
        }
        const createRes = await adminApi.createProduct(payload)
        savedProductId = createRes.data?.id || createRes.id
      }

      // If user selected an image file, upload it to the product
      if (form.image_file && savedProductId) {
        const fd = new FormData()
        fd.append('image', form.image_file)
        await adminApi.uploadProductImage(savedProductId, fd)
      }

      if (editingProduct) {
        alert('Data dan foto produk berhasil diperbarui!')
      } else {
        alert(`Produk snack "${form.name}" berhasil ditambahkan!\n\n✓ Stok awal otomatis tercatat sebagai "Tipe Pergerakan Masuk" di Riwayat Stok Gudang.\n✓ Batch awal makanan berhasil didaftarkan ke sistem FEFO (Exp: ${form.expiry_date}).`)
      }
      setShowForm(false)
      load()
    } catch (err) {
      let msg = err.response?.data?.message || err.message || 'Gagal menyimpan produk.'
      if (msg.includes('Unauthenticated') || err.response?.status === 401) {
        msg = 'Sesi Administrator belum aktif (Unauthenticated). Silakan klik tombol "1-Klik Login Admin" di bagian atas halaman lalu coba simpan kembali produk Anda.'
      }
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Hapus produk "${p.name}" beserta seluruh varian dan stoknya?`)) return
    try {
      const res = await adminApi.deleteProduct(p.id)
      alert(res.message || `Produk ${p.name} berhasil dihapus.`)
      load()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menghapus produk.'
      alert(msg)
    }
  }

  // Quick Photo Modal Handler
  const openQuickPhotoModal = (p) => {
    setQuickPhotoProduct(p)
    const existing = p.image_url || p.primary_image?.image_url || ''
    setQuickPhotoPreview(existing || null)
    setQuickPhotoUrl(existing)
    setQuickPhotoFile(null)
  }

  const handleQuickPhotoUpload = async (e) => {
    e.preventDefault()
    if (!quickPhotoProduct) return
    setQuickPhotoSaving(true)

    try {
      const fd = new FormData()
      if (quickPhotoFile) {
        fd.append('image', quickPhotoFile)
      } else if (quickPhotoUrl) {
        fd.append('image_url', quickPhotoUrl)
      } else {
        alert('Silakan pilih berkas foto atau masukkan tautan URL foto.')
        setQuickPhotoSaving(false)
        return
      }

      await adminApi.uploadProductImage(quickPhotoProduct.id, fd)
      alert('Foto makanan produk berhasil diunggah!')
      setQuickPhotoProduct(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal mengunggah foto.')
    } finally {
      setQuickPhotoSaving(false)
    }
  }

  const handleDeletePhotoOnly = async () => {
    if (!quickPhotoProduct) return
    if (!window.confirm('Hapus foto dari produk ini?')) return
    setQuickPhotoSaving(true)
    try {
      await adminApi.deleteProductImage(quickPhotoProduct.id)
      setQuickPhotoPreview(null)
      setQuickPhotoUrl('')
      setQuickPhotoFile(null)
      alert('Foto produk berhasil dihapus.')
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus foto.')
    } finally {
      setQuickPhotoSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Katalog Produk KRAVO</h1>
          <p className="text-xs text-slate-500">Kelola menu makanan ringan, unggah foto produk, kategori, varian, dan ketersediaan.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-kravo-orange transition-colors"
            title="Segarkan data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-kravo-orange' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-kravo-orange/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Tambah Produk Baru
          </button>
        </div>
      </div>

      {/* Quick Photo Upload Modal */}
      {quickPhotoProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-kravo-orange/10 flex items-center justify-center text-kravo-orange">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Unggah Foto Makanan</h3>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{quickPhotoProduct.name}</span>
                </div>
              </div>
              <button
                onClick={() => setQuickPhotoProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickPhotoUpload} className="space-y-4">
              {/* Preview Showcase */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                {quickPhotoPreview ? (
                  <div className="relative group">
                    <img
                      src={quickPhotoPreview}
                      alt="Preview"
                      className="w-44 h-44 object-cover rounded-2xl shadow-md border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleDeletePhotoOnly}
                      className="absolute -top-2 -right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-2xl bg-orange-100 text-kravo-orange mx-auto flex items-center justify-center text-3xl mb-2">
                      {quickPhotoProduct.category?.icon || '🍿'}
                    </div>
                    <span className="text-xs font-bold text-slate-700 block">Belum ada foto makanan</span>
                    <span className="text-[11px] text-slate-400">Pilih foto dari komputer/HP untuk mengganti icon emoji ini</span>
                  </div>
                )}
              </div>

              {/* Upload Action */}
              <div className="space-y-3">
                <label className="w-full py-2.5 px-4 rounded-xl bg-kravo-dark hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>{quickPhotoPreview ? 'Pilih Foto Baru' : 'Pilih Foto dari Perangkat'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setQuickPhotoFile(file)
                        setQuickPhotoPreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                </label>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Atau tempel URL gambar snack:</label>
                  <input
                    type="url"
                    placeholder="https://... URL gambar"
                    value={quickPhotoUrl}
                    onChange={(e) => {
                      setQuickPhotoUrl(e.target.value)
                      setQuickPhotoPreview(e.target.value || null)
                      setQuickPhotoFile(null)
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickPhotoProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={quickPhotoSaving}
                  className="px-5 py-2 text-xs font-bold bg-kravo-orange hover:bg-orange-600 text-white rounded-xl shadow-md transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  {quickPhotoSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Simpan Foto Makanan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Modal: Tambah / Edit Produk */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {editingProduct ? 'Edit Data & Foto Produk' : 'Tambah Produk Snack Baru'}
                </h2>
                <span className="text-xs text-slate-400">
                  {editingProduct ? 'Perbarui informasi makanan ringan, foto, atau status ketersediaan.' : 'Lengkapi informasi snack, unggah foto, dan buat minimal 1 varian.'}
                </span>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              {/* Foto Produk Makanan Upload Box */}
              <div className="p-4 bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-kravo-orange" />
                    <span>Foto Produk Makanan</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-normal">Maks 5MB (JPG, PNG, WEBP)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0 relative">
                    {form.image_preview ? (
                      <img
                        src={form.image_preview}
                        alt="Preview Produk"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 text-center p-2">
                        <Image className="w-6 h-6 text-slate-300 mb-1" />
                        <span className="text-[9px] font-semibold">Belum Ada Foto</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="px-3.5 py-2 rounded-xl bg-kravo-dark hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Foto dari Perangkat</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileChange}
                        />
                      </label>
                      {form.image_preview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Atau tempel URL gambar snack:</span>
                      <input
                        type="url"
                        placeholder="https://... URL gambar"
                        value={form.image_url}
                        onChange={(e) => {
                          const val = e.target.value
                          setForm(f => ({ ...f, image_url: val, image_preview: val || null, image_file: null }))
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KRAVO Spicy Cassava Gourmet"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kravo-orange/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Kategori Snack *</label>
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon || '📦'} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Tagline Ringkas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Renyah Pedas Menggoda!"
                    value={form.tagline}
                    onChange={(e) => setForm(f => ({ ...f, tagline: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Petunjuk Penyimpanan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Simpan di tempat sejuk dan kedap udara"
                    value={form.storage_instructions}
                    onChange={(e) => setForm(f => ({ ...f, storage_instructions: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan cita rasa, kerenyahan, dan keunggulan snack..."
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Komposisi / Bahan Pangan</label>
                <input
                  type="text"
                  placeholder="Singkong asli, minyak kelapa, garam laut, rempah alami..."
                  value={form.ingredients}
                  onChange={(e) => setForm(f => ({ ...f, ingredients: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              {/* Variants Section (Only on create or preview) */}
              {!editingProduct && (
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] block">
                        Varian Rasa & Ukuran Kemasan *
                      </span>
                      <span className="text-[10px] text-slate-400">Minimal 1 varian dengan harga retail & stok awal.</span>
                    </div>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="px-2.5 py-1 text-xs font-bold text-kravo-orange hover:bg-kravo-orange/10 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Varian
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.variants.map((v, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">Nama Varian *</label>
                            <input
                              type="text"
                              required
                              placeholder="100g Original"
                              value={v.name}
                              onChange={(e) => updateVariant(i, 'name', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">SKU Unik *</label>
                            <input
                              type="text"
                              required
                              placeholder="KRV-CSV-100"
                              value={v.sku}
                              onChange={(e) => updateVariant(i, 'sku', e.target.value.toUpperCase())}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">Harga Retail (Rp) *</label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="24500"
                              value={v.retail_price}
                              onChange={(e) => updateVariant(i, 'retail_price', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">Berat Bersih (gram) *</label>
                            <input
                              type="number"
                              required
                              min="1"
                              placeholder="100"
                              value={v.weight_grams}
                              onChange={(e) => updateVariant(i, 'weight_grams', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-end">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">MOQ Reseller</label>
                            <input
                              type="number"
                              min="1"
                              value={v.moq}
                              onChange={(e) => updateVariant(i, 'moq', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">Stok Awal Fisik</label>
                            <input
                              type="number"
                              min="0"
                              value={v.initial_stock}
                              onChange={(e) => updateVariant(i, 'initial_stock', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex justify-end">
                            {form.variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariant(i)}
                                className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tanggal Manufaktur & Kedaluwarsa (Batch Awal FEFO & Stok Masuk) */}
              {!editingProduct && (
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Tanggal Produksi & Kedaluwarsa (Batch Awal FEFO)
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Stok awal otomatis didaftarkan sebagai batch pertama dan dicatat sebagai <strong>Tipe Pergerakan Masuk (Stock In)</strong> di Riwayat Stok Gudang.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Tgl Manufaktur / Produksi (Oven) *
                      </label>
                      <input
                        type="date"
                        required
                        value={form.manufacturing_date}
                        onChange={(e) => setForm(f => ({ ...f, manufacturing_date: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-kravo-orange"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Tgl Kedaluwarsa (Exp) *
                        </label>
                        <div className="flex items-center gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date(form.manufacturing_date || Date.now())
                              d.setMonth(d.getMonth() + 6)
                              setForm(f => ({ ...f, expiry_date: d.toISOString().split('T')[0] }))
                            }}
                            className="px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 font-bold hover:bg-amber-200"
                          >
                            +6 Bln
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date(form.manufacturing_date || Date.now())
                              d.setFullYear(d.getFullYear() + 1)
                              setForm(f => ({ ...f, expiry_date: d.toISOString().split('T')[0] }))
                            }}
                            className="px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 font-bold hover:bg-amber-200"
                          >
                            +1 Thn
                          </button>
                        </div>
                      </div>
                      <input
                        type="date"
                        required
                        value={form.expiry_date}
                        onChange={(e) => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-kravo-orange font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Aktif Switch */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active_checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 text-kravo-orange rounded border-slate-300 focus:ring-kravo-orange cursor-pointer"
                />
                <label htmlFor="is_active_checkbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Produk Aktif & Tampil di Katalog Pelanggan
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-kravo-orange hover:bg-orange-600 text-white text-xs font-black shadow-lg shadow-kravo-orange/30 transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {editingProduct ? 'Simpan Perubahan' : 'Buat Produk Baru'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama produk, tagline, atau rasa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-kravo-orange/30 font-semibold"
          />
        </form>
        <span className="text-xs font-bold text-slate-500 self-end sm:self-center">
          Menampilkan {products.length} snack
        </span>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-kravo-orange" />
            <span className="text-xs font-bold">Memuat katalog produk KRAVO...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Package className="w-12 h-12 stroke-[1.2]" />
            <span className="text-sm font-bold text-slate-600">Belum ada produk snack ditemukan</span>
            <span className="text-xs">Klik "Tambah Produk Baru" untuk menambahkan snack pertama Anda.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Foto & Nama Produk Snack</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Varian Kemasan</th>
                  <th className="py-3 px-4">Harga Retail</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((p) => {
                  const firstVariant = p.variants?.[0]
                  const imageUrl = p.image_url || p.primary_image?.image_url

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {/* Photo Thumbnail or Fallback Icon with Quick Upload trigger */}
                          <div 
                            onClick={() => openQuickPhotoModal(p)}
                            className="relative w-12 h-12 rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer group"
                            title="Klik untuk mengganti/unggah foto makanan"
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.style.display = 'none'
                                }}
                              />
                            ) : (
                              <span className="text-2xl group-hover:scale-110 transition-transform">
                                {p.category?.icon || '🍿'}
                              </span>
                            )}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Camera className="w-4 h-4" />
                            </div>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[11px] text-slate-400 block line-clamp-1">
                              {p.tagline || p.description || '-'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        {p.category?.name || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">{p.variants?.length || 0} varian</span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.variants?.map(v => v.name).join(', ') || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {firstVariant ? fmt(firstVariant.retail_price) : '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {p.is_active ? 'Aktif Tayang' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openQuickPhotoModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-kravo-orange hover:bg-slate-100 transition-colors"
                            title="Unggah / Ubah Foto Makanan"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-kravo-orange hover:bg-slate-100 transition-colors"
                            title="Edit Data Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Total {meta.total} produk snack terdaftar</span>
            <div className="flex gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg font-bold transition-colors ${
                    page === p ? 'bg-kravo-orange text-white' : 'hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
