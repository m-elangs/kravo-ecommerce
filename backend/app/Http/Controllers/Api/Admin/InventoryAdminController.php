<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::with(['productVariant.product'])
            ->latest();

        if ($request->search) {
            $query->whereHas('productVariant.product', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        if ($request->low_stock) {
            $query->whereRaw('available_stock <= low_stock_threshold');
        }

        $inventories = $query->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $inventories->map(function ($inv) {
                $variant = $inv->productVariant;
                $product = $variant?->product;
                $avail = (int) ($inv->available_stock ?? 0);
                $reserved = (int) ($inv->reserved_stock ?? 0);
                $threshold = (int) ($inv->low_stock_threshold ?? 20);
                return [
                    'id'                 => $inv->id,
                    'product_name'       => $product?->name ?? '-',
                    'variant_name'       => $variant ? "{$variant->name} ({$variant->weight_grams}g)" : '-',
                    'sku'                => $variant?->sku ?? '-',
                    'quantity_available' => $avail,
                    'quantity_reserved'  => $reserved,
                    'reorder_point'      => $threshold,
                    'is_low_stock'       => $avail <= $threshold,
                ];
            }),
            'meta' => [
                'total'        => $inventories->total(),
                'current_page' => $inventories->currentPage(),
                'last_page'    => $inventories->lastPage(),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'available_stock'     => 'required|integer|min:0',
            'reserved_stock'      => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
        ], [
            'available_stock.required'     => 'Stok tersedia wajib diisi angka.',
            'reserved_stock.required'      => 'Stok reserved wajib diisi angka.',
            'low_stock_threshold.required' => 'Reorder point wajib diisi angka.',
        ]);

        $inventory = Inventory::with('productVariant.product')->findOrFail($id);
        $variant = $inventory->productVariant;

        $oldAvailable = (int) $inventory->available_stock;
        $newAvailable = (int) $request->available_stock;
        $newReserved  = (int) $request->reserved_stock;
        $newThreshold = (int) $request->low_stock_threshold;

        DB::transaction(function () use ($inventory, $variant, $oldAvailable, $newAvailable, $newReserved, $newThreshold, $request) {
            $inventory->update([
                'available_stock'     => $newAvailable,
                'reserved_stock'      => $newReserved,
                'total_physical_stock'=> $newAvailable + $newReserved,
                'low_stock_threshold' => $newThreshold,
            ]);

            // Sync with FEFO active batch so storefront checkout engine has sufficient stock
            if ($variant) {
                $batch = $variant->batches()
                    ->where('status', 'active')
                    ->where('expiry_date', '>', now()->addDays(30))
                    ->latest()
                    ->first();

                if ($batch) {
                    $prev = $batch->current_quantity;
                    $diff = $newAvailable - $oldAvailable;
                    $batch->current_quantity = max(0, $newAvailable);
                    $batch->save();

                    if ($diff != 0) {
                        StockMovement::create([
                            'product_batch_id' => $batch->id,
                            'reference_type'   => 'Adjustment',
                            'reference_id'     => $inventory->id,
                            'movement_type'    => 'adjustment',
                            'quantity'         => $diff,
                            'previous_stock'   => $prev,
                            'current_stock'    => $batch->current_quantity,
                            'reason'           => 'Penyesuaian stok gudang manual oleh admin',
                            'created_by'       => $request->user()?->id,
                        ]);
                    }
                } else {
                    $newBatch = $variant->batches()->create([
                        'batch_number'       => 'KB-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(4)),
                        'manufacturing_date' => now()->toDateString(),
                        'expiry_date'        => now()->addMonths(6)->toDateString(),
                        'initial_quantity'   => $newAvailable,
                        'current_quantity'   => $newAvailable,
                        'status'             => 'active',
                        'notes'              => 'Batch inisialisasi penyesuaian stok admin',
                    ]);

                    StockMovement::create([
                        'product_batch_id' => $newBatch->id,
                        'reference_type'   => 'Adjustment',
                        'reference_id'     => $inventory->id,
                        'movement_type'    => 'stock_in',
                        'quantity'         => $newAvailable,
                        'previous_stock'   => 0,
                        'current_stock'    => $newAvailable,
                        'reason'           => 'Inisialisasi batch penyesuaian stok admin',
                        'created_by'       => $request->user()?->id,
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Stok inventaris gudang berhasil diperbarui!',
            'data'    => [
                'id'                 => $inventory->id,
                'quantity_available' => $newAvailable,
                'quantity_reserved'  => $newReserved,
                'reorder_point'      => $newThreshold,
                'is_low_stock'       => $newAvailable <= $newThreshold,
            ]
        ]);
    }

    public function releaseReserved(Request $request, $id)
    {
        $request->validate([
            'amount' => 'nullable|integer|min:1',
        ]);

        $inventory = Inventory::with('productVariant')->findOrFail($id);
        $currentReserved = (int) $inventory->reserved_stock;

        if ($currentReserved <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada stok reserved yang dapat dipindahkan.',
            ], 422);
        }

        // If amount is not specified or exceeds reserved stock, transfer all reserved stock
        $transferAmount = $request->filled('amount')
            ? min($currentReserved, (int) $request->amount)
            : $currentReserved;

        $newReserved = $currentReserved - $transferAmount;
        $newAvailable = ((int) $inventory->available_stock) + $transferAmount;

        DB::transaction(function () use ($inventory, $transferAmount, $newReserved, $newAvailable, $request) {
            $inventory->update([
                'available_stock'     => $newAvailable,
                'reserved_stock'      => $newReserved,
                'total_physical_stock'=> $newAvailable + $newReserved,
            ]);

            $variant = $inventory->productVariant;
            if ($variant) {
                $batch = $variant->batches()
                    ->where('status', 'active')
                    ->where('expiry_date', '>', now()->addDays(30))
                    ->latest()
                    ->first();

                if ($batch) {
                    $prev = $batch->current_quantity;
                    $batch->current_quantity = max(0, $newAvailable);
                    $batch->save();

                    StockMovement::create([
                        'product_batch_id' => $batch->id,
                        'reference_type'   => 'Adjustment',
                        'reference_id'     => $inventory->id,
                        'movement_type'    => 'stock_in',
                        'quantity'         => $transferAmount,
                        'previous_stock'   => $prev,
                        'current_stock'    => $batch->current_quantity,
                        'reason'           => "Pengalihan {$transferAmount} pcs dari stok reserved ke stok siap jual",
                        'created_by'       => $request->user()?->id,
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Berhasil memindahkan {$transferAmount} pcs dari Stok Reserved ke Stok Tersedia!",
            'data'    => [
                'id'                 => $inventory->id,
                'quantity_available' => $newAvailable,
                'quantity_reserved'  => $newReserved,
                'reorder_point'      => (int) $inventory->low_stock_threshold,
                'is_low_stock'       => $newAvailable <= (int) $inventory->low_stock_threshold,
            ]
        ]);
    }

    public function movements(Request $request)
    {
        $query = StockMovement::with(['productBatch.productVariant.product'])
            ->latest();

        if ($request->variant_id) {
            $query->whereHas('productBatch', function ($q) use ($request) {
                $q->where('product_variant_id', $request->variant_id);
            });
        }

        $movements = $query->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $movements->map(function ($m) {
                $batch = $m->productBatch;
                $pv = $batch?->productVariant;
                $isPositive = in_array($m->movement_type, ['stock_in', 'adjustment']) && $m->quantity > 0;
                return [
                    'id'           => $m->id,
                    'product_name' => $pv?->product?->name ?? '-',
                    'variant'      => $pv ? "{$pv->name} ({$pv->weight_grams}g)" : '-',
                    'type'         => $isPositive ? 'in' : 'out',
                    'quantity'     => abs($m->quantity),
                    'reference'    => $m->reference_type ? "{$m->reference_type} #{$m->reference_id}" : 'Manual',
                    'notes'        => $m->reason ?? '-',
                    'batch_number' => $batch?->batch_number ?? '-',
                    'created_at'   => $m->created_at->format('d M Y H:i'),
                ];
            }),
            'meta' => [
                'total'        => $movements->total(),
                'current_page' => $movements->currentPage(),
                'last_page'    => $movements->lastPage(),
            ],
        ]);
    }
}
