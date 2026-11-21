import React from 'react'
import { Plus, BadgePercent, Edit2 } from 'lucide-react'

export default function WholesalePricingPage() {
  const tiers = [
    { id: 1, product: 'Truffle Cassava 100g', moq: 50, tier1: '50-199 pcs (Rp 18.000)', tier2: '200-499 pcs (Rp 16.500)', tier3: '>= 500 pcs (Rp 14.500)' },
    { id: 2, product: 'Golden Cheddar Crackers 100g', moq: 50, tier1: '50-199 pcs (Rp 16.500)', tier2: '200-499 pcs (Rp 15.000)', tier3: '>= 500 pcs (Rp 13.500)' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Wholesale Pricing & MOQ Matrix</h1>
          <p className="text-xs text-slate-500">Konfigurasi batas Minimum Order Quantity dan jenjang harga grosir B2B.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" /> Atur Tier Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Produk Varian</th>
              <th className="py-3 px-4">Wajib MOQ</th>
              <th className="py-3 px-4">Tier 1</th>
              <th className="py-3 px-4">Tier 2</th>
              <th className="py-3 px-4">Tier 3 (Distributor)</th>
              <th className="py-3 px-4 text-right">Edit Matrix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {tiers.map(t => (
              <tr key={t.id}>
                <td className="py-3.5 px-4 font-bold text-slate-900">{t.product}</td>
                <td className="py-3.5 px-4 font-black text-rose-600">{t.moq} pcs</td>
                <td className="py-3.5 px-4">{t.tier1}</td>
                <td className="py-3.5 px-4 font-bold text-kravo-orange">{t.tier2}</td>
                <td className="py-3.5 px-4 font-black text-emerald-700">{t.tier3}</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="text-slate-400 hover:text-kravo-orange p-1"><Edit2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
