<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductBatch;
use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BatchInventoryController extends Controller
{
    public function index(): JsonResponse
    {
        $batches = ProductBatch::with(['productVariant.product'])
            ->orderBy('expiry_date', 'asc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $batches->items(),
            'meta' => [
                'current_page' => $batches->currentPage(),
                'last_page' => $batches->lastPage(),
                'total' => $batches->total(),
            ]
        ]);
    }

    /**
     * Store new food production batch and update inventory.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'batch_number' => 'required|string|unique:product_batches,batch_number',
            'manufacturing_date' => 'required|date',
            'expiry_date' => 'required|date|after:manufacturing_date',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $batch = DB::transaction(function () use ($request) {
            $batch = ProductBatch::create([
                'product_variant_id' => $request->product_variant_id,
                'batch_number' => $request->batch_number,
                'manufacturing_date' => $request->manufacturing_date,
                'expiry_date' => $request->expiry_date,
                'initial_quantity' => $request->quantity,
                'current_quantity' => $request->quantity,
                'status' => 'active',
                'notes' => $request->notes,
            ]);

            // Audit Trail
            StockMovement::create([
                'product_batch_id' => $batch->id,
                'reference_type' => 'Production',
                'reference_id' => $batch->id,
                'movement_type' => 'stock_in',
                'quantity' => $request->quantity,
                'previous_stock' => 0,
                'current_stock' => $request->quantity,
                'reason' => 'Pemasukan batch baru dari dapur produksi',
                'created_by' => auth()->id(),
            ]);

            // Update aggregated inventory
            $inv = Inventory::firstOrCreate(
                ['product_variant_id' => $request->product_variant_id],
                ['total_physical_stock' => 0, 'available_stock' => 0]
            );

            $inv->total_physical_stock += $request->quantity;
            $inv->available_stock += $request->quantity;
            $inv->save();

            return $batch;
        });

        return response()->json([
            'success' => true,
            'message' => 'Batch produksi makanan baru berhasil didaftarkan.',
            'data' => $batch->load('productVariant.product'),
        ], 201);
    }
}
