<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\User;

class CartService
{
    public function getOrCreateCart(?User $user, ?string $sessionId = null): Cart
    {
        if ($user) {
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);

            // Merge guest cart items into user cart if sessionId was provided
            if ($sessionId) {
                $guestCart = Cart::where('session_id', $sessionId)
                    ->where(function ($q) use ($user) {
                        $q->whereNull('user_id')->orWhere('user_id', '!=', $user->id);
                    })
                    ->first();

                if ($guestCart && $guestCart->id !== $cart->id) {
                    foreach ($guestCart->items as $gItem) {
                        $existing = CartItem::where('cart_id', $cart->id)
                            ->where('product_variant_id', $gItem->product_variant_id)
                            ->first();
                        if ($existing) {
                            $existing->quantity += $gItem->quantity;
                            $existing->save();
                        } else {
                            $gItem->cart_id = $cart->id;
                            $gItem->save();
                        }
                    }
                    $guestCart->delete();
                }
            }

            return $cart;
        }

        // Guest user: ensure session ID exists without calling session()->getId()
        if (!$sessionId) {
            $sessionId = request()->header('X-Session-ID') 
                ?: (request()->ip() . '_' . substr(md5(request()->header('User-Agent') ?? 'guest'), 0, 16));
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
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
