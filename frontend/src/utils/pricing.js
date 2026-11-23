/**
 * Pricing helpers mirroring backend WholesalePriceService.
 * Backend tetap menjadi sumber kebenaran (zero-trust), helper ini hanya untuk tampilan.
 */

export const getMoq = (variant) => Math.max(1, Number(variant?.minimum_order_quantity) || 1)

export const getRetailPrice = (variant) => Number(variant?.retail_price) || 0

/**
 * Hitung harga satuan efektif untuk sebuah varian.
 * - Customer / reseller belum disetujui  -> harga retail
 * - Reseller disetujui -> harga tier grosir (min_quantity <= qty, ambil yang terbesar),
 *   fallback ke tier termurah lalu ke diskon standar 15%.
 */
export const getUnitPriceInfo = (variant, quantity, isApprovedReseller) => {
  const retail = getRetailPrice(variant)
  const moq = getMoq(variant)
  const qty = Number(quantity) || 0

  if (!isApprovedReseller) {
    return { unitPrice: retail, retailPrice: retail, isWholesale: false, moq: 1, meetsMoq: true, tierLabel: null }
  }

  const tiers = [...(variant?.price_tiers || [])]
    .map((t) => ({ min: Number(t.min_quantity) || 1, price: Number(t.unit_price) || 0 }))
    .filter((t) => t.price > 0)
    .sort((a, b) => a.min - b.min)

  let unitPrice
  let tierLabel
  const matched = [...tiers].reverse().find((t) => t.min <= qty)
  if (matched) {
    unitPrice = matched.price
    tierLabel = `Tier ${matched.min}+ pcs`
  } else if (tiers.length > 0) {
    unitPrice = tiers[0].price
    tierLabel = `Tier ${tiers[0].min}+ pcs`
  } else {
    unitPrice = Math.round(retail * 0.85 * 100) / 100
    tierLabel = 'Diskon Reseller Standar'
  }

  return {
    unitPrice,
    retailPrice: retail,
    isWholesale: true,
    moq,
    meetsMoq: qty >= moq,
    tierLabel,
  }
}
