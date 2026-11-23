import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, RefreshCw, X, Layers, Upload, Camera, Image, Check } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

const ICONS = ['🥔','🍠','🍪','🧀','🌶️','🎁','🍿','🥨','🍩','🧁']

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    icon: '🥔',
    description: '',
    image_url: '',
    image_file: null,
    image_preview: null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/admin/categories')
      setCategories(res.data || [])
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      icon: '🥔',
      description: '',
      image_url: '',
      image_file: null,
      image_preview: null,
    })
    setShowForm(true)
    setError(null)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      name: c.name,
      icon: c.icon || '🥔',
      description: c.description || '',
      image_url: c.image_url || '',
      image_file: null,
      image_preview: c.image_url || null,
    })
    setShowForm(true)
    setError(null)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let savedCatId = null

      if (form.image_file) {
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('icon', form.icon || '🥔')
        fd.append('description', form.description || '')
        fd.append('image', form.image_file)
        if (editing) {
          // Laravel PUT with multipart requires POST with _method=PUT or POST to upload endpoint
          const res = await axiosClient.post(`/admin/categories/${editing.id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }).catch(async () => {
            // fallback: update basic info first, then upload image
            await axiosClient.put(`/admin/categories/${editing.id}`, {
              name: form.name,
              icon: form.icon,
              description: form.description,
            })
            await axiosClient.post(`/admin/categories/${editing.id}/image`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
          })
        } else {
          await axiosClient.post('/admin/categories', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      } else {
        const payload = {
          name: form.name,
          icon: form.icon,
          description: form.description,
          image_url: form.image_url,
        }
        if (editing) {
          await axiosClient.put(`/admin/categories/${editing.id}`, payload)
        } else {
          await axiosClient.post('/admin/categories', payload)
        }
      }

      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || JSON.stringify(err.response?.data?.errors || 'Gagal menyimpan kategori'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus kategori ini?')) return
    try {
      await axiosClient.delete(`/admin/categories/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Kategori Snack</h1>
          <p className="text-xs text-slate-500">Kelompok kategori makanan ringan KRAVO dengan foto dan icon.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-slate-400 hover:text-kravo-orange rounded-xl">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Kategori
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-black text-slate-900 text-base">{editing ? 'Edit Kategori Snack' : 'Tambah Kategori Baru'}</h2>
              <span className="text-[11px] text-slate-400">Atur nama kategori, foto banner/icon makanan.</span>
            </div>
            <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-xl mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto Kategori Upload */}
            <div className="p-4 bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-kravo-orange" />
                <span>Foto Kategori Makanan</span>
              </label>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  {form.image_preview ? (
                    <img src={form.image_preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{form.icon || '🥔'}</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-kravo-dark hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                    </label>
                    {form.image_preview && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, image_file: null, image_preview: null, image_url: '' }))}
                        className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="Atau tautan URL foto kategori..."
                    value={form.image_url}
                    onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value, image_preview: e.target.value || null, image_file: null }))}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Kategori *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Potato Chips"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kravo-orange/30 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Cadangan Icon Emoji</label>
                <div className="flex gap-1 flex-wrap">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center transition-colors ${
                        form.icon === icon ? 'bg-kravo-orange/20 ring-2 ring-kravo-orange' : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kravo-orange/30"
                placeholder="Kategori untuk keripik kentang premium..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-xs font-black bg-kravo-orange text-white rounded-xl disabled:opacity-60 hover:bg-orange-600 transition-colors shadow-md"
              >
                {saving ? 'Menyimpan...' : editing ? 'Update Kategori' : 'Simpan Kategori'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-400">
          <Layers className="w-10 h-10 mb-2" />
          <p className="text-sm">Belum ada kategori</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(c => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-kravo-orange/30 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-3xl shrink-0">
                    {c.icon || '📦'}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{c.name}</h3>
                  <span className="text-xs text-slate-400">{c.products_count} Produk Aktif</span>
                </div>
              </div>
              <div className="space-x-1">
                <button
                  onClick={() => openEdit(c)}
                  className="p-2 text-slate-400 hover:text-kravo-orange transition-colors"
                  title="Edit Kategori & Foto"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
