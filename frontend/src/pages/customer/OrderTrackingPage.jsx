import React, { useState } from 'react'
import { Search, PackageCheck, Truck, Clock, CheckCircle2 } from 'lucide-react'

export default function OrderTrackingPage() {
  const [orderQuery, setOrderQuery] = useState('')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider">Live Status</span>
        <h1 className="text-3xl font-black text-kravo-dark">Lacak Pengiriman Snack</h1>
        <p className="text-sm text-slate-600">
          Masukkan nomor pesanan atau nomor resi kurir untuk melihat progres pengemasan batch dan pengiriman.
        </p>

        <div className="flex gap-2 pt-4">
          <input 
            type="text"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Contoh: ORD-202611-0089"
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-kravo-creamBorder text-sm focus:outline-none focus:border-kravo-orange"
          />
          <button className="px-6 py-3 rounded-xl bg-kravo-dark hover:bg-kravo-orange text-white text-sm font-bold transition-colors">
            Lacak
          </button>
        </div>
      </div>

      {/* Tracking Stepper Simulation */}
      <div className="bg-white p-8 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-kravo-creamBorder gap-2">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Nomor Pesanan</div>
            <div className="font-extrabold text-base text-kravo-dark">ORD-202611-0089</div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Sedang Dalam Perjalanan Kurir
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-kravo-dark">Pembayaran Sukses</div>
            <div className="text-[10px] text-slate-400">21 Nov 2026, 10:15</div>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-kravo-dark">Alokasi FEFO & Packing</div>
            <div className="text-[10px] text-slate-400">Batch #KB-2026-11</div>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-kravo-orange text-white flex items-center justify-center mx-auto animate-bounce">
              <Truck className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-kravo-orange">Dalam Pengiriman</div>
            <div className="text-[10px] text-slate-400">Resi: JNE-9948201948</div>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-400">Tiba di Tujuan</div>
            <div className="text-[10px] text-slate-400">Estimasi Besok Sore</div>
          </div>
        </div>
      </div>
    </div>
  )
}
