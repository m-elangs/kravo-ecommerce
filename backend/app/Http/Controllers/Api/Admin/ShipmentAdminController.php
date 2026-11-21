<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\Request;

class ShipmentAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::with(['order.user'])->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('tracking_number', 'like', "%{$request->search}%")
                  ->orWhereHas('order', fn($oq) => $oq->where('order_number', 'like', "%{$request->search}%"));
            });
        }

        $shipments = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $shipments->map(function ($s) {
                return [
                    'id'              => $s->id,
                    'order_number'    => $s->order->order_number ?? '-',
                    'customer_name'   => $s->order->user->name ?? '-',
                    'courier'         => $s->courier,
                    'tracking_number' => $s->tracking_number,
                    'status'          => $s->status,
                    'shipped_at'      => $s->shipped_at ? $s->shipped_at->format('d M Y') : null,
                    'delivered_at'    => $s->delivered_at ? $s->delivered_at->format('d M Y') : null,
                    'created_at'      => $s->created_at->format('d M Y'),
                ];
            }),
            'meta' => [
                'total'        => $shipments->total(),
                'current_page' => $shipments->currentPage(),
                'last_page'    => $shipments->lastPage(),
            ],
        ]);
    }
}
