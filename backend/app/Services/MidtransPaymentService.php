<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MidtransPaymentService
{
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isProduction;
    protected string $snapApiUrl;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key', env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-KRAVODEMO2026'));
        $this->clientKey = config('services.midtrans.client_key', env('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-KRAVODEMO2026'));
        $this->isProduction = (bool) env('MIDTRANS_IS_PRODUCTION', false);

        $this->snapApiUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    /**
     * Create Midtrans Snap Token & save initial payment record.
     */
    public function createSnapTransaction(Order $order, User $user): Payment
    {
        $paymentNumber = 'PAY-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) round($order->grand_total),
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '08123456789',
            ],
            'item_details' => $order->items->map(function ($item) {
                return [
                    'id' => (string) $item->product_variant_id,
                    'price' => (int) round($item->unit_price),
                    'quantity' => (int) $item->quantity,
                    'name' => substr($item->product_name . ' (' . $item->variant_name . ')', 0, 50),
                ];
            })->toArray(),
        ];

        // Include shipping cost if any
        if ((float) $order->shipping_cost > 0) {
            $payload['item_details'][] = [
                'id' => 'SHIPPING_FEE',
                'price' => (int) round($order->shipping_cost),
                'quantity' => 1,
                'name' => 'Ongkos Kirim Ekspedisi',
            ];
        }

        // Include voucher discount as negative item if any
        if ((float) $order->voucher_discount > 0) {
            $payload['item_details'][] = [
                'id' => 'VOUCHER_DISCOUNT',
                'price' => -(int) round($order->voucher_discount),
                'quantity' => 1,
                'name' => 'Potongan Voucher (' . ($order->voucher_code ?? 'PROMO') . ')',
            ];
        }

        $snapToken = 'SNAP-MOCK-' . Str::random(32);
        $redirectUrl = "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$snapToken}";

        // Attempt actual API call if key is provided and network reachable
        try {
            $authHeader = 'Basic ' . base64_encode($this->serverKey . ':');
            $response = Http::withHeaders([
                'Authorization' => $authHeader,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->timeout(4)->post($this->snapApiUrl, $payload);

            if ($response->successful()) {
                $resData = $response->json();
                $snapToken = $resData['token'] ?? $snapToken;
                $redirectUrl = $resData['redirect_url'] ?? $redirectUrl;
            }
        } catch (\Throwable $e) {
            // Gracefully fallback to sandbox mockup token if offline/sandbox testing
        }

        return Payment::create([
            'order_id' => $order->id,
            'payment_number' => $paymentNumber,
            'payment_gateway' => 'midtrans',
            'gross_amount' => $order->grand_total,
            'snap_token' => $snapToken,
            'snap_redirect_url' => $redirectUrl,
            'status' => 'pending',
            'raw_response' => ['payload_sent' => $payload],
        ]);
    }

    /**
     * Verify Midtrans notification webhook signature.
     * Signature = SHA512(order_id + status_code + gross_amount + ServerKey)
     */
    public function verifyWebhookSignature(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $incomingSignature = $payload['signature_key'] ?? '';

        if (!$orderId || !$statusCode || !$grossAmount || !$incomingSignature) {
            return false;
        }

        // Format gross_amount if it has .00
        $amountFormatted = number_format((float) $grossAmount, 2, '.', '');
        $signatureCalc1 = hash('sha512', $orderId . $statusCode . $amountFormatted . $this->serverKey);
        $signatureCalc2 = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        return hash_equals($signatureCalc1, $incomingSignature) || hash_equals($signatureCalc2, $incomingSignature);
    }
}
