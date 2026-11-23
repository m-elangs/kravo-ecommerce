<?php

namespace App\Services;

use App\Models\ProductVariant;
use App\Models\PriceTier;
use App\Models\User;
use Exception;

class WholesalePriceService
{
    /**
     * Resolve effective unit price for a variant given the buyer and order quantity.
     * Prevents front-end price manipulation.
     *
     * @param ProductVariant $variant
     * @param int $quantity
     * @param User|null $user
     * @return array [unit_price, is_wholesale, tier_applied, discount_amount]
     * @throws Exception
     */
    public function resolveUnitPrice(ProductVariant $variant, int $quantity, ?User $user): array
    {
        $retailPrice = (float) $variant->retail_price;

        // If user is not an approved reseller, enforce retail price
        if (!$user || !$user->isApprovedReseller()) {
            return [
                'unit_price' => $retailPrice,
                'is_wholesale' => false,
                'tier_applied' => null,
                'savings_per_unit' => 0.0,
            ];
        }

        // For approved resellers, validate MOQ
        $moq = $variant->minimum_order_quantity;
        if ($moq > 1 && $quantity < $moq) {
            throw new Exception("Kuantitas pemesanan grosir untuk {$variant->name} belum memenuhi Minimum Order Quantity (MOQ: {$moq} pcs).");
        }

        // Query price tiers matching the quantity
        $tier = PriceTier::where('product_variant_id', $variant->id)
            ->where('min_quantity', '<=', $quantity)
            ->orderBy('min_quantity', 'desc')
            ->first();

        if ($tier) {
            $wholesalePrice = (float) $tier->unit_price;
            return [
                'unit_price' => $wholesalePrice,
                'is_wholesale' => true,
                'tier_applied' => "Tier {$tier->min_quantity}+ pcs",
                'savings_per_unit' => max(0, $retailPrice - $wholesalePrice),
            ];
        }

        // Reseller sudah memenuhi MOQ: gunakan tier grosir termurah yang terdaftar
        $lowestTier = PriceTier::where('product_variant_id', $variant->id)
            ->orderBy('min_quantity', 'asc')
            ->first();

        if ($lowestTier && (float) $lowestTier->unit_price > 0) {
            $wholesalePrice = (float) $lowestTier->unit_price;
            return [
                'unit_price' => $wholesalePrice,
                'is_wholesale' => true,
                'tier_applied' => "Tier {$lowestTier->min_quantity}+ pcs",
                'savings_per_unit' => max(0, $retailPrice - $wholesalePrice),
            ];
        }

        // Default wholesale price if no specific tier (e.g. 15% standard reseller discount)
        $defaultWholesale = round($retailPrice * 0.85, 2);
        return [
            'unit_price' => $defaultWholesale,
            'is_wholesale' => true,
            'tier_applied' => 'Default Reseller Tier',
            'savings_per_unit' => round($retailPrice - $defaultWholesale, 2),
        ];
    }
}
