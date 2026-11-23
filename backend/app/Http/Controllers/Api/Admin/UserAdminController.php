<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['role', 'resellerProfile', 'addresses'])
            ->withCount('orders')
            ->withSum('orders', 'grand_total');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        if ($request->role) {
            $query->whereHas('role', fn($q) => $q->where('name', $request->role));
        }

        $users = $query->latest()->paginate(20);

        $roleCounts = [
            'total'    => User::count(),
            'admin'    => User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count(),
            'reseller' => User::whereHas('role', fn($q) => $q->where('name', 'reseller'))->count(),
            'customer' => User::whereHas('role', fn($q) => $q->where('name', 'customer'))->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $users->map(function ($u) {
                return [
                    'id'              => $u->id,
                    'name'            => $u->name,
                    'email'           => $u->email,
                    'phone'           => $u->phone,
                    'role'            => $u->role->name ?? '-',
                    'orders_count'    => $u->orders_count,
                    'total_spent'     => (float) ($u->orders_sum_grand_total ?? 0),
                    'reseller_status' => $u->resellerProfile?->status ?? null,
                    'created_at'      => $u->created_at->format('d M Y H:i'),
                ];
            }),
            'meta' => [
                'total'        => $users->total(),
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
            ],
            'role_counts' => $roleCounts,
        ]);
    }

    public function show($id)
    {
        $user = User::with(['role', 'addresses', 'resellerProfile', 'orders' => fn($q) => $q->latest()->limit(5)])
            ->withCount('orders')
            ->withSum('orders', 'grand_total')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'phone'            => $user->phone,
                'role'             => $user->role->name ?? '-',
                'created_at'       => $user->created_at->format('d M Y H:i:s'),
                'orders_count'     => $user->orders_count,
                'total_spent'      => (float) ($user->orders_sum_grand_total ?? 0),
                'addresses'        => $user->addresses,
                'reseller_profile' => $user->resellerProfile,
                'recent_orders'    => $user->orders->map(fn($o) => [
                    'id'           => $o->id,
                    'order_number' => $o->order_number,
                    'status'       => $o->status,
                    'grand_total'  => (float) $o->grand_total,
                    'created_at'   => $o->created_at->format('d M Y H:i'),
                ]),
            ],
        ]);
    }

    public function destroy($id, Request $request)
    {
        $currentUser = $request->user();
        if ($currentUser && $currentUser->id == $id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.',
            ], 422);
        }

        $user = User::findOrFail($id);

        if ($user->role && $user->role->name === 'admin') {
            $adminCount = User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus satu-satunya akun Administrator sistem.',
                ], 422);
            }
        }

        DB::transaction(function () use ($user) {
            foreach ($user->orders as $order) {
                $order->items()->delete();
                $order->payment()?->delete();
                $order->shipment()?->delete();
                $order->delete();
            }

            $user->cart?->items()->delete();
            $user->cart?->delete();
            $user->wishlist?->items()->delete();
            $user->wishlist?->delete();
            $user->reviews()->delete();
            $user->addresses()->delete();
            $user->resellerProfile()?->delete();
            $user->tokens()->delete();
            $user->delete();
        });

        return response()->json([
            'success' => true,
            'message' => "Akun pengguna {$user->name} ({$user->email}) berhasil dihapus dari sistem.",
        ]);
    }
}
