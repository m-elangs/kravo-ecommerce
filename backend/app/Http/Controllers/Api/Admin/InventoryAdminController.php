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
            $query->whereRaw('quantity_available <= reorder_point');
        }

        $inventories = $query->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $inventories->map(function ($inv) {
                $variant = $inv->productVariant;
                $product = $variant?->product;
                return [
                    'id'                 => $inv->id,
                    'product_name'       => $product?->name ?? '-',
                    'variant_name'       => $variant ? "{$variant->flavor} - {$variant->weight}g" : '-',
                    'sku'                => $variant?->sku ?? '-',
                    'quantity_available' => $inv->quantity_available,
                    'quantity_reserved'  => $inv->quantity_reserved,
                    'reorder_point'      => $inv->reorder_point,
                    'is_low_stock'       => $inv->quantity_available <= $inv->reorder_point,
                ];
            }),
            'meta' => [
                'total'        => $inventories->total(),
                'current_page' => $inventories->currentPage(),
                'last_page'    => $inventories->lastPage(),
            ],
        ]);
    }

    public function movements(Request $request)
    {
        $query = StockMovement::with(['productVariant.product', 'productBatch'])
            ->latest();

        if ($request->variant_id) {
            $query->where('product_variant_id', $request->variant_id);
        }

        $movements = $query->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $movements->map(function ($m) {
                return [
                    'id'           => $m->id,
                    'product_name' => $m->productVariant?->product?->name ?? '-',
                    'variant'      => $m->productVariant ? "{$m->productVariant->flavor} {$m->productVariant->weight}g" : '-',
                    'type'         => $m->type,
                    'quantity'     => $m->quantity,
                    'reference'    => $m->reference,
                    'notes'        => $m->notes,
                    'batch_number' => $m->productBatch?->batch_number ?? '-',
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
