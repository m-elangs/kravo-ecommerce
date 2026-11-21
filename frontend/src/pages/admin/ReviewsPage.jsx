import React from 'react'
import { Star, Check, X } from 'lucide-react'

export default function ReviewsPage() {
  const reviews = [
    { id: 1, user: 'Budi Santoso', product: 'KRAVO Gourmet Truffle Cassava', rating: 5, comment: 'Rasa trufflenya mewah banget, renyah dan kemasan tebal. Pasti repeat order!', status: 'Approved' },
    { id: 2, user: 'Siti Rahma', product: 'KRAVO Dark Fudge Brownie Cookies', rating: 5, comment: 'Cokelatnya pekat lumer, pas buat temen ngopi sore.', status: 'Approved' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Moderasi Ulasan Pelanggan</h1>
        <p className="text-xs text-slate-500">Ulasan terverifikasi pembeli yang telah menerima pesanan.</p>
      </div>

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900">{r.user}</span>
                <span className="text-xs text-slate-400 ml-2">untuk {r.product}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">"{r.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}
