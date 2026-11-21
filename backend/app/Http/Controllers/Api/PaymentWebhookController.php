<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\MidtransPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    protected MidtransPaymentService $midtransService;

    public function __construct(MidtransPaymentService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Handle Midtrans Payment Notification Webhook.
     * Verifies cryptographic signature SHA512 before updating database state.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('Midtrans Webhook Received:', $payload);

        // 1. Verify Signature
        if (!$this->midtransService->verifyWebhookSignature($payload)) {
            Log::warning('Midtrans Webhook: Invalid Signature Attempt.', $payload);
            return response()->json([
                'success' => false,
                'message' => 'Invalid signature key.',
            ], 403);
        }

        $orderNumber = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;
        $transactionId = $payload['transaction_id'] ?? null;
        $paymentType = $payload['payment_type'] ?? null;

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        DB::transaction(function () use ($order, $payload, $transactionStatus, $fraudStatus, $transactionId, $paymentType) {
            $payment = Payment::where('order_id', $order->id)->first();
            if ($payment) {
                $payment->transaction_id = $transactionId;
                $payment->payment_type = $paymentType;
                $payment->raw_response = $payload;
                $payment->signature_key = $payload['signature_key'] ?? null;
            }

            if ($transactionStatus === 'capture') {
                if ($fraudStatus === 'accept') {
                    $order->status = 'processing';
                    if ($payment) {
                        $payment->status = 'settlement';
                        $payment->paid_at = now();
                    }
                }
            } elseif ($transactionStatus === 'settlement') {
                $order->status = 'processing';
                if ($payment) {
                    $payment->status = 'settlement';
                    $payment->paid_at = now();
                }
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'], true)) {
                $order->status = 'cancelled';
                if ($payment) {
                    $payment->status = $transactionStatus;
                }
            } elseif ($transactionStatus === 'pending') {
                $order->status = 'pending_payment';
                if ($payment) {
                    $payment->status = 'pending';
                }
            }

            $order->save();
            if ($payment) {
                $payment->save();
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Webhook processed successfully.',
        ]);
    }
}
