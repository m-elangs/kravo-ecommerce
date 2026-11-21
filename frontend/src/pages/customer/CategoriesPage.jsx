import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const categories = [
  { slug: 'potato-chips', name: 'Potato Chips', desc: 'Keripik kentang pilihan bertekstur krispi renyah dengan bumbu istimewa.', count: 6, icon: '🥔' },
  { slug: 'cassava-chips', name: 'Cassava Chips', desc: 'Keripik singkong gurih tipis renyah dengan cita rasa truffle dan rempah lokal.', count: 4, icon: '🍠' },
  { slug: 'chocolate-cookies', name: 'Chocolate Cookies', desc: 'Kue cookies cokelat lumer dengan cokelat Belgia murni dan potongan kacang.', count: 5, icon: '🍪' },
  { slug: 'cheese-crackers', name: 'Cheese Crackers', desc: 'Krakers keju cheddar panggang keemasan yang gurih renyah tanpa henti.', count: 4, icon: '🧀' },
  { slug: 'spicy-snacks', name: 'Spicy Snacks', desc: 'Sensasi pedas membakar lidah dengan cabai pilihan level 1 hingga level 5.', count: 6, icon: '🌶️' },
  { slug: 'snack-bundles', name: 'Snack Bundles', desc: 'Paket hemat komplit cocok untuk hampers, rapat kantor, maupun pesta bersama.', count: 8, icon: '🎁' },
]

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-kravo-orange uppercase tracking-wider block">Kategori Produk</span>
        <h1 className="text-3xl font-black text-kravo-dark">Koleksi Makanan Ringan KRAVO</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/products?category=${c.slug}`}
            className="bg-white rounded-3xl p-8 border border-kravo-creamBorder shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-kravo-cream text-kravo-dark text-xs font-bold mb-2">
                {c.count} Varian Tersedia
              </div>
              <h3 className="text-xl font-black text-kravo-dark group-hover:text-kravo-orange transition-colors">
                {c.name}
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {c.desc}
              </p>
            </div>

            <div className="pt-6 flex items-center gap-2 text-sm font-bold text-kravo-orange">
              Lihat Semua Produk <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
