import React from 'react'
import { Truck, Check, Edit3 } from 'lucide-react'

export default function ShipmentsListPage() {
  const shipments = [
    { id: 'SHP-001', order: 'ORD-202611-0089', courier: 'JNE Reguler', resi: 'JNE-9948201948', destination: 'Jakarta Selatan', status: 'In Transit' },
    { id: 'SHP-002', order: 'ORD-202611-0088', courier: 'Indah Logistik Kargo (B2B)', resi: 'IDH-8829104', destination: 'Surabaya, Jawa Timur', status: 'Packing Warehouse' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Manajemen Pengiriman & Resi</h1>
        <p className="text-xs text-slate-500">Antrean packing gudang dan input nomor resi kurir ekspedisi.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Shipment ID</th>
              <th className="py-3 px-4">Nomor Pesanan</th>
              <th className="py-3 px-4">Kurir Ekspedisi</th>
              <th className="py-3 px-4">Nomor Resi</th>
              <th className="py-3 px-4">Kota Tujuan</th>
              <th className="py-3 px-4">Status Pengiriman</th>
              <th className="py-3 px-4 text-right">Update Resi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {shipments.map(s => (
              <tr key={s.id}>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.id}</td>
                <td className="py-3.5 px-4 font-bold">{s.order}</td>
                <td className="py-3.5 px-4">{s.courier}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{s.resi}</td>
                <td className="py-3.5 px-4">{s.destination}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {s.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button className="px-3 py-1 bg-slate-100 hover:bg-kravo-orange hover:text-white rounded-lg text-xs font-bold transition-colors">
                    Edit Resi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
