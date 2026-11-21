import React from 'react'

export default function CustomersListPage() {
  const customers = [
    { id: 1, name: 'Budi Santoso', email: 'budi@example.com', phone: '081234567890', totalOrders: 4, lifetimeSpent: 'Rp 420.000', joined: '12 Sep 2026' },
    { id: 2, name: 'Rina Kusuma', email: 'rina@example.com', phone: '081987654321', totalOrders: 2, lifetimeSpent: 'Rp 290.000', joined: '04 Okt 2026' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Direktori Pelanggan Retail (B2C)</h1>
        <p className="text-xs text-slate-500">Database pelanggan terdaftar, riwayat belanja, dan loyalitas.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Nama Pelanggan</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">WhatsApp</th>
              <th className="py-3 px-4">Total Order</th>
              <th className="py-3 px-4">Lifetime Spent</th>
              <th className="py-3 px-4">Bergabung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {customers.map(c => (
              <tr key={c.id}>
                <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                <td className="py-3.5 px-4 text-slate-600">{c.email}</td>
                <td className="py-3.5 px-4">{c.phone}</td>
                <td className="py-3.5 px-4 font-bold">{c.totalOrders} pesanan</td>
                <td className="py-3.5 px-4 font-extrabold text-kravo-dark">{c.lifetimeSpent}</td>
                <td className="py-3.5 px-4 text-slate-400">{c.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
