<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\ProductVariant;
use App\Models\Voucher;
use App\Services\CheckoutService;
use App\Services\WholesalePriceService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    protected CheckoutService $checkoutService;
    protected WholesalePriceService $priceService;

    public function __construct(
        CheckoutService $checkoutService,
        WholesalePriceService $priceService
    ) {
        $this->checkoutService = $checkoutService;
        $this->priceService = $priceService;
    }

    /**
     * Preview checkout calculations before finalizing (Subtotal, Discount, Shipping, Grand Total).
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'required|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'courier' => 'nullable|string',
            'voucher_code' => 'nullable|string',
        ]);

        $user = $request->user();
        $isWholesale = $user->isApprovedReseller();

        $subtotal = 0.0;
        $totalWeight = 0;
        $itemsPreview = [];

        foreach ($request->items as $item) {
            $variant = ProductVariant::with('product')->find($item['variant_id']);
            $qty = (int) $item['quantity'];

            try {
                $priceInfo = $this->priceService->resolveUnitPrice($variant, $qty, $user);
            } catch (Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 422);
            }

            $lineSubtotal = round($priceInfo['unit_price'] * $qty, 2);
            $subtotal += $lineSubtotal;
            $totalWeight += ($variant->weight_grams * $qty);

            $itemsPreview[] = [
                'variant_id' => $variant->id,
                'name' => $variant->product->name . ' - ' . $variant->name,
                'quantity' => $qty,
                'unit_price' => $priceInfo['unit_price'],
                'subtotal' => $lineSubtotal,
                'is_wholesale' => $priceInfo['is_wholesale'],
                'tier_applied' => $priceInfo['tier_applied'],
            ];
        }

        // Voucher
        $voucherDiscount = 0.0;
        if ($request->voucher_code) {
            $voucher = Voucher::where('code', $request->voucher_code)->first();
            if ($voucher && $voucher->isValidForAmount($subtotal)) {
                $voucherDiscount = $voucher->calculateDiscount($subtotal);
            }
        }

        // Shipping estimation
        $shippingCost = $isWholesale
            ? max(10, ceil($totalWeight / 1000)) * 5000.0
            : max(1, ceil($totalWeight / 1000)) * 12000.0;

        $grandTotal = max(0, ($subtotal - $voucherDiscount) + $shippingCost);

        return response()->json([
            'success' => true,
            'data' => [
                'order_type' => $isWholesale ? 'b2b_wholesale' : 'b2c_retail',
                'items' => $itemsPreview,
                'total_weight_grams' => $totalWeight,
                'subtotal' => round($subtotal, 2),
                'voucher_discount' => round($voucherDiscount, 2),
                'shipping_cost' => round($shippingCost, 2),
                'grand_total' => round($grandTotal, 2),
            ]
        ]);
    }

    /**
     * Execute transactional checkout and return Snap token.
     */
    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $user = $request->user();

        try {
            $order = $this->checkoutService->processCheckout(
                $user,
                $request->items,
                $request->address_id,
                $request->courier ?? 'JNE Reguler',
                $request->voucher_code,
                $request->notes
            );

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat! Silakan selesaikan pembayaran.',
                'data' => [
                    'order' => $order,
                    'snap_token' => $order->payment ? $order->payment->snap_token : null,
                    'snap_redirect_url' => $order->payment ? $order->payment->snap_redirect_url : null,
                ]
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
