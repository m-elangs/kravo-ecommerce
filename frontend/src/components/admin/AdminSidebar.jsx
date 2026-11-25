import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Layers,
  Component,
  Boxes,
  CalendarClock,
  ShoppingCart,
  CreditCard,
  Truck,
  Users,
  Store,
  BadgePercent,
  Ticket,
  Star,
  BarChart3,
  Settings,
  X,
  ExternalLink,
  UserCheck,
  MessageSquare
} from 'lucide-react'

// All Admin Dashboard Menus as requested
const navigationItems = [
  { name: '1. Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: '2. Products', path: '/admin/products', icon: Package },
  { name: '3. Categories', path: '/admin/categories', icon: Layers },
  { name: '4. Product Variants', path: '/admin/variants', icon: Component },
  { name: '5. Inventory', path: '/admin/inventory', icon: Boxes },
  { name: '6. Product Batches', path: '/admin/batches', icon: CalendarClock },
  { name: '7. Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: '8. Payments', path: '/admin/payments', icon: CreditCard },
  { name: '9. Shipments', path: '/admin/shipments', icon: Truck },
  { name: '10. Customers', path: '/admin/customers', icon: Users },
  { name: '11. Resellers', path: '/admin/resellers', icon: Store },
  { name: '12. Wholesale Pricing', path: '/admin/wholesale-pricing', icon: BadgePercent },
  { name: '13. Vouchers', path: '/admin/vouchers', icon: Ticket },
  { name: '14. Reviews', path: '/admin/reviews', icon: Star },
  { name: '15. Reports', path: '/admin/reports', icon: BarChart3 },
  { name: '16. Settings', path: '/admin/settings', icon: Settings },
  { name: '17. Semua Pengguna', path: '/admin/users', icon: UserCheck },
  { name: '18. Layanan Bantuan', path: '/admin/support', icon: MessageSquare },
]

export default function AdminSidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-kravo-dark/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-[min(17rem,85vw)] lg:w-64 shrink-0 bg-kravo-dark text-kravo-cream flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-kravo-darkMuted">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-kravo-orange text-white font-black text-xl flex items-center justify-center shadow-md">
              K
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-wide">KRAVO HQ</span>
              <span className="block text-[10px] text-kravo-orange font-bold uppercase tracking-wider">Enterprise Admin</span>
            </div>
          </Link>

          <button 
            className="lg:hidden p-1.5 rounded-lg text-kravo-cream/70 hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menus (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 text-sm font-medium">
          <div className="text-[11px] font-bold uppercase tracking-wider text-kravo-cream/40 px-3 mb-2">
            Main Management
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-kravo-orange text-white font-semibold shadow-md' 
                    : 'text-kravo-cream/80 hover:bg-white/10 hover:text-white'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* View Storefront Shortcut */}
        <div className="p-4 border-t border-kravo-darkMuted">
          <Link 
            to="/" 
            target="_blank" 
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-kravo-orange text-white text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka Customer Website
          </Link>
        </div>
      </aside>
    </>
  )
}
