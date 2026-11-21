<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items', 'payment', 'shipment']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('order_type')) {
            $query->where('order_type', $request->order_type);
        }

        $orders = $query->latest()->paginate(15);

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

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending_payment,paid,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => "Status pesanan {$order->order_number} berhasil diperbarui menjadi {$order->status}.",
            'data' => $order,
        ]);
    }

    public function updateShipment(Request $request, int $orderId): JsonResponse
    {
        $request->validate([
            'tracking_number' => 'required|string|max:100',
            'shipping_status' => 'required|in:pending_packing,packed,picked_up,in_transit,delivered',
        ]);

        $shipment = Shipment::where('order_id', $orderId)->firstOrFail();
        $shipment->tracking_number = $request->tracking_number;
        $shipment->shipping_status = $request->shipping_status;

        if ($request->shipping_status === 'in_transit' && !$shipment->dispatched_at) {
            $shipment->dispatched_at = now();
            // Automatically mark order as shipped
            $order = $shipment->order;
            $order->status = 'shipped';
            $order->save();
        }

        $shipment->save();

        return response()->json([
            'success' => true,
            'message' => 'Nomor resi dan logistik pengiriman berhasil diperbarui.',
            'data' => $shipment,
        ]);
    }
}
