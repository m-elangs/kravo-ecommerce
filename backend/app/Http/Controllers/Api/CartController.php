<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = $this->cartService->getOrCreateCart($user, $request->header('X-Session-ID'));

        $items = CartItem::where('cart_id', $cart->id)
            ->with(['productVariant.product.primaryImage', 'productVariant.inventory', 'productVariant.priceTiers'])
            ->get();

        $subtotal = $items->sum(function ($item) {
            return (float) $item->productVariant->retail_price * $item->quantity;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'cart_id' => $cart->id,
                'items' => $items,
                'total_items' => $items->sum('quantity'),
                'subtotal' => round($subtotal, 2),
            ]
        ]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $cart = $this->cartService->getOrCreateCart($user, $request->header('X-Session-ID'));

        $item = $this->cartService->addItem($cart, $request->variant_id, $request->quantity);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan ke keranjang.',
            'data' => $item->load('productVariant.product'),
        ]);
    }

    public function updateItem(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $item = $this->cartService->updateItem($id, $request->quantity);

        return response()->json([
            'success' => true,
            'message' => 'Keranjang berhasil diperbarui.',
            'data' => $item,
        ]);
    }

    public function removeItem(int $id): JsonResponse
    {
        $this->cartService->removeItem($id);

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil dihapus dari keranjang.',
        ]);
    }
}
