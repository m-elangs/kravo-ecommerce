<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Submit a new product review for an order.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        // Verify order belongs to user and is delivered or paid
        $order = Order::where('id', $request->order_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Check if already reviewed for this order & product
        $existing = Review::where('order_id', $order->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memberikan ulasan untuk produk ini pada pesanan ini.',
            ], 422);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Terima kasih! Ulasan produk Anda berhasil dikirim.',
            'data' => $review->load(['product', 'user']),
        ], 201);
    }

    /**
     * Get approved reviews for a specific product.
     */
    public function getProductReviews(int $productId): JsonResponse
    {
        $reviews = Review::where('product_id', $productId)
            ->where('is_approved', true)
            ->with('user:id,name')
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reviews->items(),
            'meta' => [
                'total' => $reviews->total(),
                'average_rating' => round(Review::where('product_id', $productId)->where('is_approved', true)->avg('rating') ?: 5, 1),
            ]
        ]);
    }
}
