<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\User;
use Exception;

class CartService
{
    public function getOrCreateCart(?User $user, ?string $sessionId = null): Cart
    {
        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId ?: session()->getId()]);
    }

    public function addItem(Cart $cart, int $variantId, int $quantity): CartItem
    {
        $variant = ProductVariant::findOrFail($variantId);
        
        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_variant_id', $variantId)
            ->first();

        if ($item) {
            $item->quantity += $quantity;
            $item->save();
            return $item;
        }

        return CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variantId,
            'quantity' => $quantity,
        ]);
    }

    public function updateItem(int $itemId, int $quantity): ?CartItem
    {
        $item = CartItem::find($itemId);
        if (!$item) return null;

        if ($quantity <= 0) {
            $item->delete();
            return null;
        }

        $item->quantity = $quantity;
        $item->save();
        return $item;
    }

    public function removeItem(int $itemId): bool
    {
        return (bool) CartItem::where('id', $itemId)->delete();
    }
}
