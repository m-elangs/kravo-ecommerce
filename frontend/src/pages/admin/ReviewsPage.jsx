import React, { useState, useEffect } from 'react'
import { RefreshCw, Star, CheckCircle, Trash2 } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating]   = useState('')
  const [approved, setApproved] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (rating) params.rating = rating
      if (approved !== '') params.approved = approved
      const { data } = await axiosClient.get('/admin/reviews', { params })
      setReviews(data.data || [])
    } catch { setReviews([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [rating, approved])

  const handleApprove = async (id) => {
    try { await axiosClient.put(`/admin/reviews/${id}/approve`); load() } catch {}
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus ulasan ini?')) return
    try { await axiosClient.delete(`/admin/reviews/${id}`); load() } catch {}
  }

  const Stars = ({ n }) => (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}
    </span>
  )

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Ulasan Produk</h1>
          <p className="text-xs text-slate-500">Moderasi dan kelola semua ulasan dari pelanggan.</p>
        </div>
        <button onClick={load} className="p-2 text-slate-400 hover:text-kravo-orange rounded-xl"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="flex gap-3 items-center">
        <select value={rating} onChange={e => setRating(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2">
          <option value="">Semua Bintang</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Bintang</option>)}
        </select>
        <select value={approved} onChange={e => setApproved(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2">
          <option value="">Semua Status</option>
          <option value="1">Disetujui</option>
          <option value="0">Menunggu</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-kravo-orange border-t-transparent rounded-full animate-spin" /></div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400"><Star className="w-10 h-10 mb-2" /><p className="text-sm">Belum ada ulasan</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map(r => (
              <div key={r.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-black text-slate-900">{r.user_name}</span>
                      <Stars n={r.rating} />
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {r.is_approved ? 'Disetujui' : 'Menunggu'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Produk: <span className="font-bold text-slate-700">{r.product_name}</span></p>
                    <p className="text-sm text-slate-700 leading-relaxed">{r.comment}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{r.created_at}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!r.is_approved && (
                      <button onClick={() => handleApprove(r.id)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Setujui">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
