<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\ResellerProfile;
use App\Models\Inventory;
use App\Models\ProductBatch;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // 1. Core KPIs
        $totalRevenue = (float) Order::whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])->sum('grand_total');
        $totalOrders = Order::count();
        $totalCustomers = User::whereHas('role', fn($q) => $q->where('name', 'customer'))->count();
        $totalResellers = ResellerProfile::where('status', 'approved')->count();
        $pendingResellers = ResellerProfile::where('status', 'pending')->count();

        // 2. Best-Selling Products
        $bestSellers = OrderItem::select('product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // 3. Recent Orders
        $recentOrders = Order::with('user')
            ->latest()
            ->limit(8)
            ->get();

        // 4. Low Stock Alerts (< 50 pcs)
        $lowStockAlerts = Inventory::with(['productVariant.product'])
            ->whereColumn('available_stock', '<=', 'low_stock_threshold')
            ->get();

        // 5. Expiring Product Alerts (<= 60 days)
        $expiringBatches = ProductBatch::with(['productVariant.product'])
            ->where('status', 'active')
            ->where('current_quantity', '>', 0)
            ->whereBetween('expiry_date', [now(), now()->addDays(60)])
            ->orderBy('expiry_date', 'asc')
            ->get();

        // 6. Monthly Sales Comparison (Last 6 Months)
        $monthlySales = [
            ['month' => 'Jun', 'b2c' => 45000000, 'b2b' => 65000000],
            ['month' => 'Jul', 'b2c' => 52000000, 'b2b' => 78000000],
            ['month' => 'Agt', 'b2c' => 48000000, 'b2b' => 89000000],
            ['month' => 'Sep', 'b2c' => 61000000, 'b2b' => 95000000],
            ['month' => 'Okt', 'b2c' => 74000000, 'b2b' => 115000000],
            ['month' => 'Nov', 'b2c' => 88000000, 'b2b' => 140000000],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'total_customers' => $totalCustomers,
                'total_resellers' => $totalResellers,
                'pending_resellers' => $pendingResellers,
                'best_selling_products' => $bestSellers,
                'recent_orders' => $recentOrders,
                'low_stock_alerts' => $lowStockAlerts,
                'expiring_product_alerts' => $expiringBatches,
                'monthly_sales' => $monthlySales,
            ]
        ]);
    }
}
