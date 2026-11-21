import React from 'react'
import { ShieldCheck, CheckCircle2, Clock } from 'lucide-react'

export default function PaymentsListPage() {
  const payments = [
    { id: 'PAY-MID-9921', order: 'ORD-202611-0089', method: 'BCA Virtual Account', amount: 'Rp 83.000', signature: 'SHA512 Verified ✓', status: 'Settlement' },
    { id: 'PAY-MID-9920', order: 'ORD-202611-0088', method: 'Mandiri Bill Payment', amount: 'Rp 5.400.000', signature: 'SHA512 Verified ✓', status: 'Settlement' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Riwayat Pembayaran & Webhook Gateway</h1>
        <p className="text-xs text-slate-500">Log verifikasi transaksi Midtrans Sandbox dengan signature anti-tampering.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Payment Ref</th>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Metode Bayar</th>
              <th className="py-3 px-4">Nominal</th>
              <th className="py-3 px-4">Kriptografi Signature</th>
              <th className="py-3 px-4">Status Midtrans</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {payments.map(p => (
              <tr key={p.id}>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                <td className="py-3.5 px-4 font-bold">{p.order}</td>
                <td className="py-3.5 px-4">{p.method}</td>
                <td className="py-3.5 px-4 font-black">{p.amount}</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">{p.signature}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
