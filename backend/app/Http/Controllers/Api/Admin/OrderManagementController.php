<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\InventoryFefoService;
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

        $order = Order::with(['items', 'shipment'])->findOrFail($id);
        $oldStatus = $order->status;
        $newStatus = $request->status;

        if ($oldStatus !== $newStatus) {
            $order->status = $newStatus;
            $order->save();

            // Jika status pesanan berubah menjadi delivered (barang sudah sampai / selesai)
            if ($newStatus === 'delivered' && $oldStatus !== 'delivered') {
                app(InventoryFefoService::class)->fulfillDeliveredOrder($order);

                if ($order->shipment && $order->shipment->shipping_status !== 'delivered') {
                    $order->shipment->shipping_status = 'delivered';
                    $order->shipment->delivered_at = now();
                    $order->shipment->save();
                }
            }

            // Jika status dibatalkan, kembalikan stok reserved ke stok tersedia
            if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
                app(InventoryFefoService::class)->cancelOrderReservation($order);
            }
        }

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
        $oldShippingStatus = $shipment->shipping_status;
        $shipment->tracking_number = $request->tracking_number;
        $shipment->shipping_status = $request->shipping_status;

        if ($request->shipping_status === 'in_transit' && !$shipment->dispatched_at) {
            $shipment->dispatched_at = now();
            // Automatically mark order as shipped
            $order = $shipment->order;
            if ($order && in_array($order->status, ['paid', 'processing'])) {
                $order->status = 'shipped';
                $order->save();
            }
        }

        // Jika status pengiriman diupdate menjadi delivered (barang sudah sampai ke tangan pembeli)
        if ($request->shipping_status === 'delivered') {
            if (!$shipment->delivered_at) {
                $shipment->delivered_at = now();
            }
            $order = $shipment->order;
            if ($order && $order->status !== 'delivered') {
                $order->status = 'delivered';
                $order->save();
                app(InventoryFefoService::class)->fulfillDeliveredOrder($order);
            }
        }

        $shipment->save();

        return response()->json([
            'success' => true,
            'message' => 'Nomor resi dan logistik pengiriman berhasil diperbarui.',
            'data' => $shipment,
        ]);
    }
}
