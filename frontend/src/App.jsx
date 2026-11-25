import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-[100dvh] w-full max-w-full overflow-x-clip flex flex-col bg-kravo-cream">
            <AppRoutes />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
