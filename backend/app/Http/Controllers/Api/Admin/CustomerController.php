<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('addresses')
            ->whereHas('role', fn($q) => $q->where('name', 'customer'))
            ->withCount('orders')
            ->withSum('orders', 'grand_total');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $customers = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $customers->map(function ($customer) {
                return [
                    'id'           => $customer->id,
                    'name'         => $customer->name,
                    'email'        => $customer->email,
                    'phone'        => $customer->phone,
                    'orders_count' => $customer->orders_count,
                    'total_spent'  => (float) ($customer->orders_sum_grand_total ?? 0),
                    'created_at'   => $customer->created_at->format('d M Y'),
                ];
            }),
            'meta' => [
                'total'        => $customers->total(),
                'current_page' => $customers->currentPage(),
                'last_page'    => $customers->lastPage(),
            ],
        ]);
    }

    public function show($id)
    {
        $customer = User::with(['addresses', 'orders.items.productVariant.product'])
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $customer]);
    }
}
