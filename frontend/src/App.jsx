import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-kravo-cream">
          <AppRoutes />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
