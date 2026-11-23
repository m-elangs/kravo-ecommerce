<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Order::where('user_id', $user->id)
            ->with([
                'items.productVariant.product.category',
                'items.productVariant.product.primaryImage',
                'items.productVariant.inventory',
                'payment',
                'shipment',
                'reviews'
            ])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->input('per_page', 25);
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.productBatch', 'payment', 'shipment.address', 'user'])
            ->firstOrFail();

        // Check authorization if user is not admin
        if ($request->user() && !$request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function track(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['shipment', 'items'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'order_type' => $order->order_type,
                'total_items' => $order->items->sum('quantity'),
                'shipment' => $order->shipment,
                'created_at' => $order->created_at,
            ]
        ]);
    }

    /**
     * Confirm/simulate payment success and update order state to paid/processing.
     */
    public function confirmPayment(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        DB::transaction(function () use ($order, $request) {
            $paymentType = $request->input('payment_type', 'qris_midtrans');
            $transactionId = $request->input('transaction_id', 'TRX-MID-' . strtoupper(Str::random(10)));

            $order->status = 'paid';
            $order->save();

            $payment = Payment::firstOrCreate(['order_id' => $order->id], [
                'payment_number' => 'PAY-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
                'payment_gateway' => 'midtrans',
                'gross_amount' => $order->grand_total,
                'status' => 'settlement',
            ]);

            $payment->status = 'settlement';
            $payment->payment_type = $paymentType;
            $payment->transaction_id = $transactionId;
            $payment->paid_at = now();
            $payment->raw_response = [
                'simulation' => true,
                'confirmed_at' => now()->toIso8601String(),
                'method' => $paymentType,
            ];
            $payment->save();

            // Keep shipment ready in pending_packing status for kitchen/warehouse
            if ($order->shipment && $order->shipment->shipping_status !== 'pending_packing') {
                $order->shipment->shipping_status = 'pending_packing';
                $order->shipment->save();
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran pesanan berhasil diverifikasi! Pesanan kini berstatus PAID.',
            'data' => $order->fresh(['payment', 'items', 'shipment']),
        ]);
    }
}
