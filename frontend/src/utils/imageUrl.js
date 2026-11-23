/**
 * Helper to resolve product and category image URLs
 */
export const getProductImageUrl = (item) => {
  if (!item) return null
  let src = item.image_url || item.primary_image?.image_url || item.images?.[0]?.image_url
  if (!src) return null
  if (typeof src === 'object') {
    src = src.image_url || src.url
  }
  if (!src || typeof src !== 'string') return null

  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src
  }

  const backendBase = 'http://localhost:8000'
  return `${backendBase}${src.startsWith('/') ? '' : '/'}${src}`
}
