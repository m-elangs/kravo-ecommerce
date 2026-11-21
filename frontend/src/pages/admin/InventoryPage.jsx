import React from 'react'
import { Boxes, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react'

export default function InventoryPage() {
  const inventory = [
    { id: 1, sku: 'KRV-CSV-TRF-100', name: 'Truffle Cassava 100g', physicalStock: 540, reservedStock: 45, availableStock: 495, status: 'Safe' },
    { id: 2, sku: 'KRV-POT-GHP-100', name: 'Spicy Ghost Pepper 100g', physicalStock: 18, reservedStock: 6, availableStock: 12, status: 'Low Stock' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Total Inventaris Gudang</h1>
        <p className="text-xs text-slate-500">Agregasi stok fisik, stok terpesan (reserved), dan safety stock.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Nama Varian Snack</th>
              <th className="py-3 px-4">Stok Fisik Total</th>
              <th className="py-3 px-4">Stok Dipesan (Reserved)</th>
              <th className="py-3 px-4">Stok Siap Jual</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {inventory.map(i => (
              <tr key={i.id}>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{i.sku}</td>
                <td className="py-3.5 px-4 font-bold">{i.name}</td>
                <td className="py-3.5 px-4">{i.physicalStock} pcs</td>
                <td className="py-3.5 px-4 text-amber-600 font-bold">{i.reservedStock} pcs</td>
                <td className="py-3.5 px-4 font-black text-emerald-700">{i.availableStock} pcs</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    i.status === 'Safe' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>{i.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
