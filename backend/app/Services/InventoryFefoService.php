<?php

namespace App\Services;

use App\Models\ProductBatch;
use App\Models\Inventory;
use App\Models\StockMovement;
use Exception;
use Illuminate\Support\Facades\DB;

class InventoryFefoService
{
    /**
     * Allocate stock using FEFO (First Expired, First Out) algorithm.
     * Must be called inside an active DB transaction with row-level pessimistic locking.
     *
     * @param int $variantId
     * @param int $requestedQty
     * @param string $referenceType
     * @param int $referenceId
     * @return array Array of allocated batches with quantity [{batch_id, qty, batch_number}]
     * @throws Exception
     */
    public function allocateStockFEFO(int $variantId, int $requestedQty, string $referenceType = 'Order', int $referenceId = 0): array
    {
        if ($requestedQty <= 0) {
            throw new Exception("Kuantitas alokasi harus lebih dari 0.");
        }

        // 1. Lock the inventory record
        $inventory = Inventory::where('product_variant_id', $variantId)
            ->lockForUpdate()
            ->first();

        if (!$inventory || $inventory->available_stock < $requestedQty) {
            $avail = $inventory ? $inventory->available_stock : 0;
            throw new Exception("Stok tidak mencukupi untuk varian #{$variantId}. Tersedia: {$avail}, Diminta: {$requestedQty}.");
        }

        // 2. Fetch active batches ordered by expiry_date ASC (FEFO) with row lock
        // Reject batches that expire in <= 30 days or already expired
        $safetyBufferDate = now()->addDays(30)->toDateString();

        $batches = ProductBatch::where('product_variant_id', $variantId)
            ->where('status', 'active')
            ->where('expiry_date', '>', $safetyBufferDate)
            ->where('current_quantity', '>', 0)
            ->orderBy('expiry_date', 'asc')
            ->lockForUpdate()
            ->get();

        $totalBatchStock = $batches->sum('current_quantity');
        if ($totalBatchStock < $requestedQty) {
            throw new Exception("Stok batch aman (FEFO) tidak mencukupi untuk varian #{$variantId}.");
        }

        $allocated = [];
        $remainingNeeded = $requestedQty;

        foreach ($batches as $batch) {
            if ($remainingNeeded <= 0) {
                break;
            }

            $takeQty = min($batch->current_quantity, $remainingNeeded);
            $previousStock = $batch->current_quantity;
            $newStock = $previousStock - $takeQty;

            // Deduct batch quantity
            $batch->current_quantity = $newStock;
            if ($newStock === 0) {
                $batch->status = 'active'; // Remains active or completed
            }
            $batch->save();

            // Record stock movement audit trail
            StockMovement::create([
                'product_batch_id' => $batch->id,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'movement_type' => 'allocated',
                'quantity' => -$takeQty,
                'previous_stock' => $previousStock,
                'current_stock' => $newStock,
                'reason' => "Alokasi pesanan {$referenceType} #{$referenceId} (FEFO)",
                'created_by' => auth()->id() ?? null,
            ]);

            $allocated[] = [
                'batch_id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'expiry_date' => $batch->expiry_date->format('Y-m-d'),
                'allocated_quantity' => $takeQty,
            ];

            $remainingNeeded -= $takeQty;
        }

        // 3. Update inventory aggregation: kurangi stok tersedia dan alihkan ke stok reserved
        $inventory->available_stock = max(0, $inventory->available_stock - $requestedQty);
        $inventory->reserved_stock = ((int) $inventory->reserved_stock) + $requestedQty;
        $inventory->total_physical_stock = $inventory->available_stock + $inventory->reserved_stock;
        $inventory->save();

        return $allocated;
    }

    /**
     * Selesaikan pengiriman pesanan (status: delivered).
     * Barang telah resmi diterima customer/reseller, sehingga stok reserved berkurang dan fisik berkurang.
     */
    public function fulfillDeliveredOrder(\App\Models\Order $order): void
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $inv = Inventory::where('product_variant_id', $item->product_variant_id)
                ->lockForUpdate()
                ->first();

            if ($inv) {
                $qty = (int) $item->quantity;
                $inv->reserved_stock = max(0, (int) $inv->reserved_stock - $qty);
                $inv->total_physical_stock = max(0, (int) $inv->total_physical_stock - $qty);
                $inv->save();

                $batchId = $item->product_batch_id ?: ProductBatch::where('product_variant_id', $item->product_variant_id)->value('id');
                if ($batchId) {
                    StockMovement::create([
                        'product_batch_id' => $batchId,
                        'reference_type' => 'OrderDelivered',
                        'reference_id' => $order->id,
                        'movement_type' => 'dispatched',
                        'quantity' => -$qty,
                        'previous_stock' => $inv->reserved_stock + $qty,
                        'current_stock' => $inv->reserved_stock,
                        'reason' => "Pesanan #{$order->order_number} telah sampai / selesai (Delivered). Stok reserved keluar gudang.",
                        'created_by' => auth()->id() ?? null,
                    ]);
                }
            }
        }
    }

    /**
     * Batalkan pesanan: kembalikan stok dari reserved_stock ke available_stock.
     */
    public function cancelOrderReservation(\App\Models\Order $order): void
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $qty = (int) $item->quantity;

            // Revert batch quantity
            if ($item->product_batch_id) {
                $batch = ProductBatch::lockForUpdate()->find($item->product_batch_id);
                if ($batch) {
                    $prev = $batch->current_quantity;
                    $batch->current_quantity += $qty;
                    $batch->save();
                }
            }

            // Revert inventory from reserved to available
            $inv = Inventory::where('product_variant_id', $item->product_variant_id)
                ->lockForUpdate()
                ->first();

            if ($inv) {
                $inv->reserved_stock = max(0, (int) $inv->reserved_stock - $qty);
                $inv->available_stock = (int) $inv->available_stock + $qty;
                $inv->total_physical_stock = $inv->available_stock + $inv->reserved_stock;
                $inv->save();

                $batchId = $item->product_batch_id ?: ProductBatch::where('product_variant_id', $item->product_variant_id)->value('id');
                if ($batchId) {
                    StockMovement::create([
                        'product_batch_id' => $batchId,
                        'reference_type' => 'OrderCancel',
                        'reference_id' => $order->id,
                        'movement_type' => 'stock_in',
                        'quantity' => $qty,
                        'previous_stock' => $inv->available_stock - $qty,
                        'current_stock' => $inv->available_stock,
                        'reason' => "Pesanan #{$order->order_number} dibatalkan. Stok reserved dialihkan kembali ke stok tersedia.",
                        'created_by' => auth()->id() ?? null,
                    ]);
                }
            }
        }
    }

    /**
     * Revert / restock cancelled order allocation.
     */
    public function revertAllocation(int $batchId, int $qty, string $reason = 'Order Cancellation', int $refId = 0): void
    {
        $batch = ProductBatch::lockForUpdate()->find($batchId);
        if (!$batch) return;

        $prev = $batch->current_quantity;
        $batch->current_quantity += $qty;
        $batch->save();

        StockMovement::create([
            'product_batch_id' => $batch->id,
            'reference_type' => 'OrderCancel',
            'reference_id' => $refId,
            'movement_type' => 'stock_in',
            'quantity' => $qty,
            'previous_stock' => $prev,
            'current_stock' => $batch->current_quantity,
            'reason' => $reason,
        ]);

        $inv = Inventory::where('product_variant_id', $batch->product_variant_id)->lockForUpdate()->first();
        if ($inv) {
            $inv->total_physical_stock += $qty;
            $inv->available_stock += $qty;
            $inv->save();
        }
    }
}
