import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Truck, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [courier, setCourier] = useState('jne')

  const handlePlaceOrder = (e) => {
    e.preventDefault()
    // Simulated order placement with Midtrans redirect
    navigate('/payment/ORD-202611-0089')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Checkout Aman</span>
        <h1 className="text-3xl font-black text-kravo-dark">Penyelesaian Pesanan</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Fields: Shipping & Courier */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-kravo-dark font-extrabold text-base">
              <MapPin className="w-5 h-5 text-kravo-orange" />
              <h3>1. Alamat Pengiriman Snack</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap Penerima</label>
                <input 
                  type="text" 
                  defaultValue="Budi Santoso"
                  className="w-full px-4 py-2.5 rounded-xl border border-kravo-creamBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nomor WhatsApp / HP</label>
                <input 
                  type="tel" 
                  defaultValue="081234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-kravo-creamBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Lengkap</label>
                <textarea 
                  rows="3"
                  defaultValue="Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan, 12190"
                  className="w-full px-4 py-2.5 rounded-xl border border-kravo-creamBorder bg-slate-50 focus:bg-white focus:outline-none focus:border-kravo-orange"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Logistics Courier */}
          <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-kravo-dark font-extrabold text-base">
              <Truck className="w-5 h-5 text-kravo-orange" />
              <h3>2. Pilih Layanan Pengiriman</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'jne', name: 'JNE Reguler', price: 12000, time: '1-2 Hari' },
                { id: 'sicepat', name: 'SiCepat Best', price: 14000, time: 'Besok Sampai' },
                { id: 'gosend', name: 'GoSend Instant', price: 25000, time: '3 Jam Sampai' },
              ].map(c => (
                <div
                  key={c.id}
                  onClick={() => setCourier(c.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    courier === c.id 
                      ? 'border-kravo-orange bg-kravo-orange/5 ring-2 ring-kravo-orange/20' 
                      : 'border-kravo-creamBorder hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-sm text-kravo-dark">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.time}</div>
                  <div className="text-xs font-black text-kravo-orange mt-2">Rp {c.price.toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Payment Summary */}
        <div className="bg-white p-6 rounded-3xl border border-kravo-creamBorder shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-kravo-dark font-extrabold text-base">
            <CreditCard className="w-5 h-5 text-kravo-orange" />
            <h3>Ringkasan Transaksi</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Produk (3 item)</span>
              <span className="font-bold text-kravo-dark">Rp 71.000</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Ongkos Kirim</span>
              <span className="font-bold text-kravo-dark">Rp 12.000</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Batch Food Safety Check</span>
              <span>Lolos FEFO ✓</span>
            </div>
          </div>

          <div className="pt-4 border-t border-kravo-creamBorder flex justify-between items-baseline">
            <span className="font-bold text-base text-kravo-dark">Total Biaya</span>
            <span className="text-2xl font-black text-kravo-dark">Rp 83.000</span>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-kravo-orange hover:bg-kravo-orangeHover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-kravo-orange/30 transition-all"
          >
            Bayar via Midtrans <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
