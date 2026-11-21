<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['order.user'])
            ->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('order', function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%");
            });
        }

        $payments = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $payments->map(function ($payment) {
                return [
                    'id'             => $payment->id,
                    'order_number'   => $payment->order->order_number ?? '-',
                    'customer_name'  => $payment->order->user->name ?? '-',
                    'amount'         => $payment->amount,
                    'method'         => $payment->payment_method,
                    'status'         => $payment->status,
                    'midtrans_id'    => $payment->midtrans_transaction_id,
                    'paid_at'        => $payment->paid_at ? $payment->paid_at->format('d M Y H:i') : null,
                    'created_at'     => $payment->created_at->format('d M Y H:i'),
                ];
            }),
            'meta' => [
                'total'        => $payments->total(),
                'current_page' => $payments->currentPage(),
                'last_page'    => $payments->lastPage(),
            ],
        ]);
    }
}
