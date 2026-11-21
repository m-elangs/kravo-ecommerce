<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::where('is_active', true)
            ->with(['category', 'variants.inventory', 'variants.priceTiers', 'primaryImage', 'images']);

        // Filter by category
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Live search by name or tagline
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('tagline', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('retail_price', '>=', (float) $request->min_price);
            });
        }
        if ($request->filled('max_price')) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('retail_price', '<=', (float) $request->max_price);
            });
        }

        // Sorting
        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'price_asc' => $query->orderBy(
                \App\Models\ProductVariant::select('retail_price')
                    ->whereColumn('product_variants.product_id', 'products.id')
                    ->orderBy('retail_price', 'asc')
                    ->limit(1)
            ),
            'price_desc' => $query->orderByDesc(
                \App\Models\ProductVariant::select('retail_price')
                    ->whereColumn('product_variants.product_id', 'products.id')
                    ->orderBy('retail_price', 'desc')
                    ->limit(1)
            ),
            'featured' => $query->orderByDesc('is_featured')->latest(),
            default => $query->latest(),
        };

        $products = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'category',
                'images',
                'variants.inventory',
                'variants.priceTiers',
                'variants.activeBatches' => function ($q) {
                    $q->select('id', 'product_variant_id', 'batch_number', 'expiry_date', 'current_quantity');
                },
                'reviews.user' => function ($q) {
                    $q->select('id', 'name');
                }
            ])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }
}
