<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PriceTier;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WholesalePricingController extends Controller
{
    public function index(): JsonResponse
    {
        $tiers = PriceTier::with(['productVariant.product'])
            ->orderBy('product_variant_id')
            ->orderBy('min_quantity')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tiers,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'min_quantity' => 'required|integer|min:2',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $tier = PriceTier::updateOrCreate(
            [
                'product_variant_id' => $request->product_variant_id,
                'min_quantity' => $request->min_quantity,
            ],
            [
                'unit_price' => $request->unit_price,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Tier harga grosir berhasil disimpan.',
            'data' => $tier->load('productVariant.product'),
        ], 201);
    }

    public function updateMoq(Request $request, int $variantId): JsonResponse
    {
        $request->validate([
            'minimum_order_quantity' => 'required|integer|min:1',
        ]);

        $variant = ProductVariant::findOrFail($variantId);
        $variant->minimum_order_quantity = $request->minimum_order_quantity;
        $variant->save();

        return response()->json([
            'success' => true,
            'message' => "MOQ untuk {$variant->name} berhasil diperbarui menjadi {$variant->minimum_order_quantity} pcs.",
            'data' => $variant,
        ]);
    }
}
