import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { cartApi } from '../api/cartApi'
import { useAuth } from './AuthContext'
import { getMoq, getUnitPriceInfo } from '../utils/pricing'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isApprovedReseller, user } = useAuth()
  const [cart, setCart] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Debounce timers and rollback cache for optimistic quantity updates
  const debounceTimers = useRef({})
  const originalQuantities = useRef({})

  const fetchCart = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const res = await cartApi.getCart()
      if (res.success && res.data) {
        setCart(res.data)
        setItems(res.data.items || [])
      }
    } catch (e) {
      // error fetching cart
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [user?.id])

  const addToCart = async (variantId, quantity = 1, variant = null) => {
    let qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1)

    // Reseller B2B: pastikan total kuantitas di keranjang minimal memenuhi MOQ
    if (isApprovedReseller) {
      const existing = items.find((i) => i.product_variant_id === variantId)
      const refVariant = variant || existing?.product_variant
      if (refVariant) {
        const moq = getMoq(refVariant)
        const currentQty = existing?.quantity || 0
        if (currentQty + qtyToAdd < moq) {
          qtyToAdd = moq - currentQty
        }
      }
    }

    const res = await cartApi.addItem(variantId, qtyToAdd)
    if (res.success) {
      await fetchCart(true)
    }
    return { ...res, addedQuantity: qtyToAdd }
  }

  const updateQuantity = (itemId, quantity) => {
    const targetQty = Math.max(0, parseInt(quantity, 10) || 0)

    // 1. Instant Optimistic State Update (0ms delay on UI)
    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === itemId)
      if (existing && originalQuantities.current[itemId] === undefined) {
        originalQuantities.current[itemId] = existing.quantity
      }

      return prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: targetQty } : item
      )
    })

    // 2. Clear pending debounce timer for this specific item
    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId])
    }

    // 3. Debounce sync with backend (300ms)
    return new Promise((resolve) => {
      debounceTimers.current[itemId] = setTimeout(async () => {
        if (targetQty <= 0) {
          try {
            const res = await cartApi.removeItem(itemId)
            delete originalQuantities.current[itemId]
            delete debounceTimers.current[itemId]
            setItems((prev) => prev.filter((i) => i.id !== itemId))
            resolve(res)
          } catch (err) {
            await fetchCart(true)
            resolve({ success: false })
          }
          return
        }

        try {
          const res = await cartApi.updateItem(itemId, targetQty)
          delete originalQuantities.current[itemId]
          delete debounceTimers.current[itemId]
          resolve(res)
        } catch (err) {
          // Rollback to previous confirmed quantity if API fails
          if (originalQuantities.current[itemId] !== undefined) {
            const prevQty = originalQuantities.current[itemId]
            setItems((prev) =>
              prev.map((i) => (i.id === itemId ? { ...i, quantity: prevQty } : i))
            )
            delete originalQuantities.current[itemId]
          }
          delete debounceTimers.current[itemId]
          resolve({ success: false, message: 'Gagal memperbarui kuantitas' })
        }
      }, 300)
    })
  }

  const removeFromCart = async (itemId) => {
    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId])
      delete debounceTimers.current[itemId]
    }
    delete originalQuantities.current[itemId]

    // Optimistic removal
    setItems((prevItems) => prevItems.filter((i) => i.id !== itemId))

    try {
      const res = await cartApi.removeItem(itemId)
      if (!res.success) {
        await fetchCart(true) // rollback if error
      }
      return res
    } catch {
      await fetchCart(true)
      return { success: false }
    }
  }

  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0)

  // Harga satuan efektif per item (grosir untuk reseller disetujui, retail untuk customer)
  const getItemPriceInfo = (item) =>
    getUnitPriceInfo(item.product_variant, item.quantity, isApprovedReseller)

  const subtotal = items.reduce((sum, item) => {
    return sum + getItemPriceInfo(item).unitPrice * (item.quantity || 0)
  }, 0)

  const retailSubtotal = items.reduce((sum, item) => {
    return sum + (Number(item.product_variant?.retail_price) || 0) * (item.quantity || 0)
  }, 0)

  // Item yang belum memenuhi MOQ (khusus reseller)
  const belowMoqItems = isApprovedReseller
    ? items.filter((item) => !getItemPriceInfo(item).meetsMoq)
    : []

  return (
    <CartContext.Provider value={{
      cart,
      items,
      loading,
      totalCount,
      subtotal,
      retailSubtotal,
      belowMoqItems,
      getItemPriceInfo,
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
