<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::with(['category', 'variants.inventory', 'variants.priceTiers', 'primaryImage', 'images'])
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'image_url' => 'nullable|string|max:500',
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

        // Handle product photo upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'prod_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/products'), $fileName);
            $imageUrl = url('uploads/products/' . $fileName);

            $product->images()->create([
                'image_url' => $imageUrl,
                'is_primary' => true,
                'display_order' => 0,
            ]);
        } elseif ($request->filled('image_url')) {
            $product->images()->create([
                'image_url' => $request->image_url,
                'is_primary' => true,
                'display_order' => 0,
            ]);
        }

        $mfd = $request->manufacturing_date ?? now()->toDateString();
        $exp = $request->expiry_date ?? now()->addMonths(6)->toDateString();

        foreach ($request->variants as $v) {
            $variant = $product->variants()->create([
                'sku' => $v['sku'],
                'name' => $v['name'],
                'retail_price' => $v['retail_price'],
                'weight_grams' => $v['weight_grams'],
                'minimum_order_quantity' => $v['moq'] ?? 1,
            ]);

            $stock = (int) ($v['initial_stock'] ?? 100);
            $variant->inventory()->create([
                'total_physical_stock' => $stock,
                'reserved_stock' => 0,
                'available_stock' => $stock,
                'low_stock_threshold' => 20,
            ]);

            // Mendaftarkan batch produksi awal ke sistem FEFO
            $variantMfd = !empty($v['manufacturing_date']) ? $v['manufacturing_date'] : $mfd;
            $variantExp = !empty($v['expiry_date']) ? $v['expiry_date'] : $exp;

            $batch = ProductBatch::create([
                'product_variant_id' => $variant->id,
                'batch_number' => 'KB-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'manufacturing_date' => $variantMfd,
                'expiry_date' => $variantExp,
                'initial_quantity' => $stock,
                'current_quantity' => $stock,
                'status' => 'active',
                'notes' => "Batch inisialisasi produk baru ({$product->name} - {$variant->name})",
            ]);

            // Mencatat riwayat pergerakan masuk (Stock In)
            StockMovement::create([
                'product_batch_id' => $batch->id,
                'reference_type' => 'NewProduct',
                'reference_id' => $product->id,
                'movement_type' => 'stock_in',
                'quantity' => $stock,
                'previous_stock' => 0,
                'current_stock' => $stock,
                'reason' => "Pemasukan stok awal produk baru: {$product->name} ({$variant->name})",
                'created_by' => auth()->id(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Produk snack baru berhasil ditambahkan! Stok awal telah dicatat ke Riwayat Pergerakan Masuk (Stock In) dan sistem Food Batch FEFO.',
            'data' => $product->load(['variants.inventory', 'primaryImage', 'images']),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:150',
            'tagline' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'storage_instructions' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'image_url' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        $product = Product::findOrFail($id);
        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'tagline' => $request->tagline,
            'description' => $request->description,
            'ingredients' => $request->ingredients,
            'storage_instructions' => $request->storage_instructions,
            'is_active' => $request->has('is_active') ? $request->is_active : $product->is_active,
        ]);

        // Handle photo update
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'prod_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/products'), $fileName);
            $imageUrl = url('uploads/products/' . $fileName);

            $primary = $product->primaryImage;
            if ($primary) {
                $primary->update(['image_url' => $imageUrl]);
            } else {
                $product->images()->create([
                    'image_url' => $imageUrl,
                    'is_primary' => true,
                    'display_order' => 0,
                ]);
            }
        } elseif ($request->filled('image_url')) {
            $primary = $product->primaryImage;
            if ($primary) {
                $primary->update(['image_url' => $request->image_url]);
            } else {
                $product->images()->create([
                    'image_url' => $request->image_url,
                    'is_primary' => true,
                    'display_order' => 0,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Data dan foto produk berhasil diperbarui.',
            'data' => $product->load(['variants.inventory', 'primaryImage', 'images']),
        ]);
    }

    public function uploadImage(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'image_url' => 'nullable|string|max:500',
        ]);

        $imageUrl = null;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'prod_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/products'), $fileName);
            $imageUrl = url('uploads/products/' . $fileName);
        } elseif ($request->filled('image_url')) {
            $imageUrl = $request->image_url;
        }

        if (!$imageUrl) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan pilih berkas foto makanan atau masukkan URL foto.',
            ], 422);
        }

        $primary = $product->primaryImage;
        if ($primary) {
            $primary->update(['image_url' => $imageUrl]);
        } else {
            $product->images()->create([
                'image_url' => $imageUrl,
                'is_primary' => true,
                'display_order' => 0,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto makanan produk berhasil diunggah!',
            'image_url' => $imageUrl,
            'data' => $product->fresh(['primaryImage', 'images', 'category', 'variants.inventory']),
        ]);
    }

    public function deleteImage($id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $primary = $product->primaryImage;
        if ($primary) {
            $primary->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto produk berhasil dihapus.',
            'data' => $product->fresh(['primaryImage', 'images']),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $product = Product::findOrFail($id);

        try {
            DB::transaction(function () use ($product) {
                $variantIds = $product->variants()->pluck('id')->toArray();
                
                if (!empty($variantIds)) {
                    // Nullify reference in order_items so historical invoices keep product/variant name & price snapshots
                    DB::table('order_items')
                        ->whereIn('product_variant_id', $variantIds)
                        ->update(['product_variant_id' => null]);

                    // Remove from cart items if any
                    DB::table('cart_items')
                        ->whereIn('product_variant_id', $variantIds)
                        ->delete();
                }

                foreach ($product->variants as $variant) {
                    $variant->inventory()?->delete();
                    $variant->priceTiers()->delete();
                    $variant->batches()->delete();
                    $variant->delete();
                }
                $product->images()->delete();
                $product->reviews()->delete();
                $product->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Produk "' . $product->name . '" beserta seluruh variannya berhasil dihapus.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus produk: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function storeVariant(Request $request, $productId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'sku' => 'required|string|unique:product_variants,sku',
            'retail_price' => 'required|numeric|min:0',
            'weight_grams' => 'required|integer|min:1',
            'minimum_order_quantity' => 'nullable|integer|min:1',
            'initial_stock' => 'nullable|integer|min:0',
        ]);

        $product = Product::findOrFail($productId);

        $variant = $product->variants()->create([
            'sku' => $request->sku,
            'name' => $request->name,
            'retail_price' => $request->retail_price,
            'weight_grams' => $request->weight_grams,
            'minimum_order_quantity' => $request->minimum_order_quantity ?? 1,
            'is_active' => true,
        ]);

        $stock = (int) ($request->initial_stock ?? 100);
        $variant->inventory()->create([
            'total_physical_stock' => $stock,
            'reserved_stock' => 0,
            'available_stock' => $stock,
            'low_stock_threshold' => 20,
        ]);

        $mfd = $request->manufacturing_date ?? now()->toDateString();
        $exp = $request->expiry_date ?? now()->addMonths(6)->toDateString();

        $batch = ProductBatch::create([
            'product_variant_id' => $variant->id,
            'batch_number' => 'KB-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
            'manufacturing_date' => $mfd,
            'expiry_date' => $exp,
            'initial_quantity' => $stock,
            'current_quantity' => $stock,
            'status' => 'active',
            'notes' => "Batch inisialisasi varian baru ({$product->name} - {$variant->name})",
        ]);

        StockMovement::create([
            'product_batch_id' => $batch->id,
            'reference_type' => 'NewVariant',
            'reference_id' => $variant->id,
            'movement_type' => 'stock_in',
            'quantity' => $stock,
            'previous_stock' => 0,
            'current_stock' => $stock,
            'reason' => "Pemasukan stok awal varian baru: {$product->name} ({$variant->name})",
            'created_by' => auth()->id(),
        ]);

        if ($request->filled('wholesale_price') && (float) $request->wholesale_price > 0) {
            $wholesale = (float) $request->wholesale_price;
            $retail = (float) $request->retail_price;
            $moq = (int) ($request->minimum_order_quantity ?? 1);
            $discount = $retail > 0 ? round((($retail - $wholesale) / $retail) * 100, 2) : 0;
            $variant->priceTiers()->create([
                'min_quantity' => $moq,
                'unit_price' => $wholesale,
                'discount_percentage' => max(0, $discount),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Varian {$variant->name} berhasil ditambahkan.",
            'data' => $variant->load(['inventory', 'priceTiers']),
        ], 201);
    }

    public function updateVariant(Request $request, $id): JsonResponse
    {
        $variant = ProductVariant::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'sku' => 'required|string|unique:product_variants,sku,' . $variant->id,
            'retail_price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'weight_grams' => 'required|integer|min:1',
            'minimum_order_quantity' => 'nullable|integer|min:1',
            'stock' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($request, $variant) {
            $variant->update([
                'name' => $request->name,
                'sku' => $request->sku,
                'retail_price' => $request->retail_price,
                'weight_grams' => $request->weight_grams,
                'minimum_order_quantity' => $request->minimum_order_quantity ?? $variant->minimum_order_quantity,
                'is_active' => $request->has('is_active') ? $request->is_active : $variant->is_active,
            ]);

            if ($request->has('wholesale_price') && $request->wholesale_price !== null && (float) $request->wholesale_price > 0) {
                $wholesale = (float) $request->wholesale_price;
                $retail = (float) ($request->retail_price ?? $variant->retail_price);
                $moq = (int) ($request->minimum_order_quantity ?? $variant->minimum_order_quantity ?? 1);
                $discount = $retail > 0 ? round((($retail - $wholesale) / $retail) * 100, 2) : 0;

                $tier = $variant->priceTiers()->first();
                if ($tier) {
                    $tier->update([
                        'min_quantity' => $moq,
                        'unit_price' => $wholesale,
                        'discount_percentage' => max(0, $discount),
                    ]);
                } else {
                    $variant->priceTiers()->create([
                        'min_quantity' => $moq,
                        'unit_price' => $wholesale,
                        'discount_percentage' => max(0, $discount),
                    ]);
                }
            }

            if ($request->has('stock') && $request->stock !== null) {
                $newStock = (int) $request->stock;
                $inv = $variant->inventory;

                if (!$inv) {
                    $variant->inventory()->create([
                        'total_physical_stock' => $newStock,
                        'reserved_stock' => 0,
                        'available_stock' => $newStock,
                        'low_stock_threshold' => 50,
                    ]);
                } else {
                    $reserved = (int) ($inv->reserved_stock ?? 0);
                    $inv->total_physical_stock = $newStock + $reserved;
                    $inv->available_stock = $newStock;
                    $inv->save();
                }

                // Sync or create active batch so FEFO engine has sufficient stock
                $batch = $variant->batches()->where('status', 'active')->where('expiry_date', '>', now()->addDays(30))->latest()->first();
                if ($batch) {
                    $batch->current_quantity = $newStock;
                    $batch->save();
                } else {
                    $variant->batches()->create([
                        'batch_number' => 'KB-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                        'manufacturing_date' => now()->toDateString(),
                        'expiry_date' => now()->addMonths(6)->toDateString(),
                        'initial_quantity' => $newStock,
                        'current_quantity' => $newStock,
                        'status' => 'active',
                        'notes' => 'Batch penyesuaian stok admin',
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Varian {$variant->name} berhasil diperbarui.",
            'data' => $variant->fresh(['inventory', 'priceTiers']),
        ]);
    }

    public function deleteVariant($id): JsonResponse
    {
        $variant = ProductVariant::findOrFail($id);

        try {
            DB::transaction(function () use ($variant) {
                DB::table('order_items')
                    ->where('product_variant_id', $variant->id)
                    ->update(['product_variant_id' => null]);

                DB::table('cart_items')
                    ->where('product_variant_id', $variant->id)
                    ->delete();

                $variant->inventory()?->delete();
                $variant->priceTiers()->delete();
                $variant->batches()->delete();
                $variant->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Varian produk berhasil dihapus.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus varian: ' . $e->getMessage(),
            ], 500);
        }
    }
}
