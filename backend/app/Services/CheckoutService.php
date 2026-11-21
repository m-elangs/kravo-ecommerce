<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\Voucher;
use App\Models\Address;
use App\Models\Shipment;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutService
{
    protected InventoryFefoService $fefoService;
    protected WholesalePriceService $priceService;
    protected MidtransPaymentService $midtransService;

    public function __construct(
        InventoryFefoService $fefoService,
        WholesalePriceService $priceService,
        MidtransPaymentService $midtransService
    ) {
        $this->fefoService = $fefoService;
        $this->priceService = $priceService;
        $this->midtransService = $midtransService;
    }

    /**
     * Process checkout completely on the server-side to prevent price tampering.
     *
     * @param User $user
     * @param array $items [{variant_id: int, quantity: int}]
     * @param int|null $addressId
     * @param string $courier
     * @param string|null $voucherCode
     * @param string|null $notes
     * @return Order
     * @throws Exception
     */
    public function processCheckout(
        User $user,
        array $items,
        ?int $addressId,
        string $courier = 'JNE Reguler',
        ?string $voucherCode = null,
        ?string $notes = null
    ): Order {
        if (empty($items)) {
            throw new Exception("Keranjang belanja kosong.");
        }

        return DB::transaction(function () use ($user, $items, $addressId, $courier, $voucherCode, $notes) {
            $orderNumber = 'KRV-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            $isWholesale = $user->isApprovedReseller();

            $subtotal = 0.0;
            $orderItemsData = [];
            $totalWeight = 0;

            // 1. Validate variants & calculate unit prices server-side (Zero Trust in Frontend Prices)
            foreach ($items as $item) {
                $variantId = (int) $item['variant_id'];
                $qty = (int) $item['quantity'];

                if ($qty <= 0) {
                    throw new Exception("Kuantitas produk tidak valid.");
                }

                $variant = ProductVariant::with('product')->lockForUpdate()->find($variantId);
                if (!$variant || !$variant->is_active) {
                    throw new Exception("Varian produk #{$variantId} tidak tersedia.");
                }

                // Resolve real price strictly on backend
                $priceInfo = $this->priceService->resolveUnitPrice($variant, $qty, $user);
                $unitPrice = $priceInfo['unit_price'];
                $lineSubtotal = round($unitPrice * $qty, 2);

                $subtotal += $lineSubtotal;
                $totalWeight += ($variant->weight_grams * $qty);

                $orderItemsData[] = [
                    'variant' => $variant,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'line_subtotal' => $lineSubtotal,
                ];
            }

            // 2. Voucher Discount calculation
            $voucherDiscount = 0.0;
            if ($voucherCode) {
                $voucher = Voucher::where('code', $voucherCode)->lockForUpdate()->first();
                if ($voucher && $voucher->isValidForAmount($subtotal)) {
                    $voucherDiscount = $voucher->calculateDiscount($subtotal);
                    $voucher->increment('used_count');
                }
            }

            // 3. Shipping cost estimation
            $shippingCost = $this->calculateShippingCost($courier, $totalWeight, $isWholesale);
            $grandTotal = max(0, ($subtotal - $voucherDiscount) + $shippingCost);

            // 4. Create Order Header
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'order_type' => $isWholesale ? 'b2b_wholesale' : 'b2c_retail',
                'status' => 'pending_payment',
                'subtotal' => $subtotal,
                'voucher_discount' => $voucherDiscount,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
                'voucher_code' => $voucherCode,
                'notes' => $notes,
            ]);

            // 5. Allocate Batches via FEFO Engine & Save Order Items
            foreach ($orderItemsData as $itemData) {
                $variant = $itemData['variant'];
                $qty = $itemData['quantity'];
                $unitPrice = $itemData['unit_price'];

                // Run FEFO Allocation
                $allocations = $this->fefoService->allocateStockFEFO(
                    $variant->id,
                    $qty,
                    'Order',
                    $order->id
                );

                // Freeze price snapshot into order_items
                foreach ($allocations as $alloc) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_variant_id' => $variant->id,
                        'product_batch_id' => $alloc['batch_id'],
                        'product_name' => $variant->product->name,
                        'variant_name' => $variant->name,
                        'sku' => $variant->sku,
                        'unit_price' => $unitPrice,
                        'quantity' => $alloc['allocated_quantity'],
                        'subtotal' => round($unitPrice * $alloc['allocated_quantity'], 2),
                    ]);
                }
            }

            // 6. Create Initial Shipment Record
            Shipment::create([
                'order_id' => $order->id,
                'address_id' => $addressId,
                'courier_name' => $courier,
                'service_name' => $isWholesale ? 'Kargo Ekspedisi' : 'Reguler',
                'tracking_number' => null,
                'shipping_status' => 'pending_packing',
                'weight_grams' => $totalWeight,
            ]);

            // 7. Request Midtrans Snap Token
            $payment = $this->midtransService->createSnapTransaction($order, $user);

            return $order->load(['items', 'payment', 'shipment']);
        });
    }

    private function calculateShippingCost(string $courier, int $weightGrams, bool $isWholesale): float
    {
        if ($isWholesale) {
            // Wholesale cargo rate: Rp 5.000 per kg (minimum 10kg)
            $kg = max(10, ceil($weightGrams / 1000));
            return $kg * 5000.0;
        }

        // Retail courier rates
        $kg = max(1, ceil($weightGrams / 1000));
        if (stripos($courier, 'sicepat') !== false) {
            return $kg * 14000.0;
        }
        if (stripos($courier, 'instant') !== false || stripos($courier, 'gosend') !== false) {
            return 25000.0;
        }
        return $kg * 12000.0; // Default JNE Reguler
    }
}
