<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::with(['category', 'variants.inventory', 'primaryImage'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:150',
            'tagline' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'storage_instructions' => 'nullable|string',
            'variants' => 'required|array|min:1',
            'variants.*.name' => 'required|string',
            'variants.*.sku' => 'required|string|unique:product_variants,sku',
            'variants.*.retail_price' => 'required|numeric|min:0',
            'variants.*.weight_grams' => 'required|integer|min:1',
            'variants.*.moq' => 'nullable|integer|min:1',
        ]);

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(4),
            'tagline' => $request->tagline,
            'description' => $request->description,
            'ingredients' => $request->ingredients,
            'storage_instructions' => $request->storage_instructions,
            'is_active' => true,
        ]);

        foreach ($request->variants as $v) {
            $variant = $product->variants()->create([
                'sku' => $v['sku'],
                'name' => $v['name'],
                'retail_price' => $v['retail_price'],
                'weight_grams' => $v['weight_grams'],
                'minimum_order_quantity' => $v['moq'] ?? 1,
            ]);

            // Initialize empty inventory
            $variant->inventory()->create([
                'total_physical_stock' => 0,
                'reserved_stock' => 0,
                'available_stock' => 0,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Produk snack baru berhasil ditambahkan.',
            'data' => $product->load('variants.inventory'),
        ], 201);
    }
}
