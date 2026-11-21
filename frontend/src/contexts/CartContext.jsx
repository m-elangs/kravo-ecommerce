import React, { createContext, useContext, useState, useEffect } from 'react'
import { cartApi } from '../api/cartApi'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const res = await cartApi.getCart()
      if (res.success && res.data) {
        setCart(res.data)
        setItems(res.data.items || [])
      }
    } catch (e) {
      // error fetching cart
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const addToCart = async (variantId, quantity = 1) => {
    const res = await cartApi.addItem(variantId, quantity)
    if (res.success) {
      await fetchCart()
    }
    return res
  }

  const updateQuantity = async (itemId, quantity) => {
    const res = await cartApi.updateItem(itemId, quantity)
    if (res.success) {
      await fetchCart()
    }
    return res
  }

  const removeFromCart = async (itemId) => {
    const res = await cartApi.removeItem(itemId)
    if (res.success) {
      await fetchCart()
    }
    return res
  }

  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const subtotal = items.reduce((sum, item) => {
    const price = item.product_variant?.retail_price || 0
    return sum + (price * (item.quantity || 0))
  }, 0)

  return (
    <CartContext.Provider value={{
      cart,
      items,
      loading,
      totalCount,
      subtotal,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
