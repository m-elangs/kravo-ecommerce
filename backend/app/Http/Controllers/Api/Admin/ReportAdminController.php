<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\StockMovement;
use App\Models\ProductBatch;
use App\Models\Inventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportAdminController extends Controller
{
    /**
     * Laporan Keuangan & Penjualan (B2C Retail & B2B Wholesale)
     */
    public function sales(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items.productVariant.product', 'payment', 'shipment'])
            ->latest();

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->filled('order_type') && $request->order_type !== 'all') {
            $query->where('order_type', $request->order_type);
        }
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $allOrders = $query->get();

        // Financial Metrics
        $totalRevenue = $allOrders->whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])->sum('grand_total');
        $totalB2cRevenue = $allOrders->where('order_type', 'b2c_retail')->whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])->sum('grand_total');
        $totalB2bRevenue = $allOrders->where('order_type', 'b2b_wholesale')->whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])->sum('grand_total');
        $totalDiscounts = $allOrders->sum('voucher_discount');
        $totalShipping = $allOrders->sum('shipping_cost');
        $totalOrdersCount = $allOrders->count();

        $ordersData = $allOrders->map(function ($o) {
            return [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'created_at' => $o->created_at->format('Y-m-d H:i:s'),
                'customer_name' => $o->user?->name ?? 'Guest',
                'customer_email' => $o->user?->email ?? '-',
                'order_type' => $o->order_type === 'b2b_wholesale' ? 'B2B Wholesale' : 'B2C Retail',
                'status' => strtoupper($o->status),
                'payment_method' => $o->payment?->payment_method ?? 'QRIS',
                'items_count' => $o->items->sum('quantity'),
                'subtotal' => (float) $o->subtotal,
                'voucher_discount' => (float) $o->voucher_discount,
                'shipping_cost' => (float) $o->shipping_cost,
                'grand_total' => (float) $o->grand_total,
            ];
        });

        return response()->json([
            'success' => true,
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'total_b2c_revenue' => (float) $totalB2cRevenue,
                'total_b2b_revenue' => (float) $totalB2bRevenue,
                'total_discounts' => (float) $totalDiscounts,
                'total_shipping' => (float) $totalShipping,
                'total_orders' => $totalOrdersCount,
                'paid_orders_count' => $allOrders->whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])->count(),
            ],
            'data' => $ordersData,
        ]);
    }

    /**
     * Laporan Audit Mutasi Stok FEFO & Inventaris
     */
    public function stockMovements(Request $request): JsonResponse
    {
        $query = StockMovement::with(['productBatch.productVariant.product', 'creator'])
            ->latest();

        if ($request->filled('movement_type') && $request->movement_type !== 'all') {
            $query->where('movement_type', $request->movement_type);
        }
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $allMovements = $query->get();

        // Summary Statistics
        $totalIn = $allMovements->where('movement_type', 'in')->sum('quantity');
        $totalOut = $allMovements->where('movement_type', 'out')->sum('quantity');
        $totalAllocated = $allMovements->where('movement_type', 'allocated')->sum('quantity');
        $totalAdjustments = $allMovements->where('movement_type', 'adjustment')->sum('quantity');

        $activeBatchesCount = ProductBatch::where('status', 'active')->count();
        $totalAvailableStock = Inventory::sum('available_stock');

        $movementsData = $allMovements->map(function ($m) {
            $batch = $m->productBatch;
            $variant = $batch?->productVariant;
            $product = $variant?->product;

            return [
                'id' => $m->id,
                'created_at' => $m->created_at->format('Y-m-d H:i:s'),
                'product_name' => $product?->name ?? 'Produk Snack',
                'variant_name' => $variant?->name ?? 'Standard',
                'sku' => $variant?->sku ?? '-',
                'batch_number' => $batch?->batch_number ?? '-',
                'expiry_date' => $batch?->expiry_date ? $batch->expiry_date->format('Y-m-d') : '-',
                'movement_type' => strtoupper($m->movement_type),
                'quantity' => (int) $m->quantity,
                'previous_stock' => (int) $m->previous_stock,
                'current_stock' => (int) $m->current_stock,
                'reason' => $m->reason ?? 'Mutasi sistem',
                'operator' => $m->creator?->name ?? 'Sistem FEFO Otomatis',
            ];
        });

        return response()->json([
            'success' => true,
            'summary' => [
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'total_allocated' => $totalAllocated,
                'total_adjustments' => $totalAdjustments,
                'active_batches_count' => $activeBatchesCount,
                'total_available_stock' => (int) $totalAvailableStock,
                'total_records' => $allMovements->count(),
            ],
            'data' => $movementsData,
        ]);
    }
}
