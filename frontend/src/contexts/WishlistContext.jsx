import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProductImageUrl } from '../utils/imageUrl'

const WishlistContext = createContext()
const STORAGE_KEY = 'kravo_wishlist'

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore storage quota errors
    }
  }, [items])

  const isInWishlist = useCallback(
    (productId) => items.some((item) => item.id === productId),
    [items]
  )

  const toggleWishlist = useCallback((product) => {
    if (!product || !product.id) return false
    let added = false
    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id)
      if (exists) {
        added = false
        return prev.filter((item) => item.id !== product.id)
      }
      const firstVariant = product.variants?.[0]
      const price = firstVariant ? Number(firstVariant.retail_price) : Number(product.price || 0)
      added = true
      return [
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          tagline: product.tagline || product.description || '',
          categoryName: product.category?.name || 'Snack KRAVO',
          icon: product.category?.icon || '🍿',
          imageUrl: getProductImageUrl(product),
          price,
          variantId: firstVariant?.id || null,
          variantName: firstVariant?.name || null,
          variant: firstVariant || null,
        },
        ...prev,
      ]
    })
    return added
  }, [])

  const removeFromWishlist = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const clearWishlist = useCallback(() => {
    setItems([])
  }, [])

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
