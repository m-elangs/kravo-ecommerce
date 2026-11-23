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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $selectedYear = (int) ($request->year ?? now()->year);
        $selectedMonth = $request->filled('month') && $request->month !== 'all' ? (int) $request->month : null;

        $validStatuses = ['paid', 'processing', 'shipped', 'delivered'];

        // 1. All-time Core KPIs
        $allTimeRevenue = (float) Order::whereIn('status', $validStatuses)->sum('grand_total');
        $allTimeOrders = Order::count();
        $totalCustomers = User::whereHas('role', fn($q) => $q->where('name', 'customer'))->count();
        $totalResellers = ResellerProfile::where('status', 'approved')->count();
        $pendingResellers = ResellerProfile::where('status', 'pending')->count();

        // 2. Filtered Metrics (Specific Month or Entire Year/All-Time)
        if ($selectedMonth) {
            $monthOrderQuery = Order::whereIn('status', $validStatuses)
                ->whereYear('created_at', $selectedYear)
                ->whereMonth('created_at', $selectedMonth);

            $filteredRevenue = (float) (clone $monthOrderQuery)->sum('grand_total');
            $filteredOrders = (int) Order::whereYear('created_at', $selectedYear)
                ->whereMonth('created_at', $selectedMonth)
                ->count();

            $filteredB2cRevenue = (float) (clone $monthOrderQuery)->where('order_type', 'b2c_retail')->sum('grand_total');
            $filteredB2bRevenue = (float) (clone $monthOrderQuery)->where('order_type', 'b2b_wholesale')->sum('grand_total');
            $filteredB2cOrders = (int) Order::whereYear('created_at', $selectedYear)
                ->whereMonth('created_at', $selectedMonth)
                ->where('order_type', 'b2c_retail')
                ->count();
            $filteredB2bOrders = (int) Order::whereYear('created_at', $selectedYear)
                ->whereMonth('created_at', $selectedMonth)
                ->where('order_type', 'b2b_wholesale')
                ->count();
        } else {
            $filteredRevenue = $allTimeRevenue;
            $filteredOrders = $allTimeOrders;
            $filteredB2cRevenue = (float) Order::whereIn('status', $validStatuses)->where('order_type', 'b2c_retail')->sum('grand_total');
            $filteredB2bRevenue = (float) Order::whereIn('status', $validStatuses)->where('order_type', 'b2b_wholesale')->sum('grand_total');
            $filteredB2cOrders = (int) Order::where('order_type', 'b2c_retail')->count();
            $filteredB2bOrders = (int) Order::where('order_type', 'b2b_wholesale')->count();
        }

        // 3. Best-Selling Products (filtered by month if specified)
        $bestSellersQuery = OrderItem::select('product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->whereHas('order', function ($q) use ($validStatuses, $selectedYear, $selectedMonth) {
                $q->whereIn('status', $validStatuses);
                if ($selectedMonth) {
                    $q->whereYear('created_at', $selectedYear)->whereMonth('created_at', $selectedMonth);
                }
            })
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->limit(5);
        $bestSellers = $bestSellersQuery->get();

        // 4. Recent Orders
        $recentOrdersQuery = Order::with('user');
        if ($selectedMonth) {
            $recentOrdersQuery->whereYear('created_at', $selectedYear)->whereMonth('created_at', $selectedMonth);
        }
        $recentOrders = $recentOrdersQuery->latest()->limit(8)->get();

        // 5. Low Stock Alerts (< threshold)
        $lowStockAlerts = Inventory::with(['productVariant.product'])
            ->whereColumn('available_stock', '<=', 'low_stock_threshold')
            ->get();

        // 6. Expiring Product Alerts (<= 60 days)
        $expiringBatches = ProductBatch::with(['productVariant.product'])
            ->where('status', 'active')
            ->where('current_quantity', '>', 0)
            ->whereBetween('expiry_date', [now(), now()->addDays(60)])
            ->orderBy('expiry_date', 'asc')
            ->get();

        // 7. REAL Aggregated Monthly Sales directly from Database
        $monthNames = [
            1 => ['short' => 'Jan', 'full' => 'Januari'],
            2 => ['short' => 'Feb', 'full' => 'Februari'],
            3 => ['short' => 'Mar', 'full' => 'Maret'],
            4 => ['short' => 'Apr', 'full' => 'April'],
            5 => ['short' => 'Mei', 'full' => 'Mei'],
            6 => ['short' => 'Jun', 'full' => 'Juni'],
            7 => ['short' => 'Jul', 'full' => 'Juli'],
            8 => ['short' => 'Agt', 'full' => 'Agustus'],
            9 => ['short' => 'Sep', 'full' => 'September'],
            10 => ['short' => 'Okt', 'full' => 'Oktober'],
            11 => ['short' => 'Nov', 'full' => 'November'],
            12 => ['short' => 'Des', 'full' => 'Desember'],
        ];

        $realMonthlyDb = Order::select(
                DB::raw('MONTH(created_at) as month_num'),
                'order_type',
                DB::raw('SUM(grand_total) as total_amount'),
                DB::raw('COUNT(*) as order_count')
            )
            ->whereIn('status', $validStatuses)
            ->whereYear('created_at', $selectedYear)
            ->groupBy(DB::raw('MONTH(created_at)'), 'order_type')
            ->get();

        $monthlySales = [];
        foreach ($monthNames as $mNum => $mInfo) {
            $b2cRecord = $realMonthlyDb->first(fn($r) => $r->month_num == $mNum && $r->order_type === 'b2c_retail');
            $b2bRecord = $realMonthlyDb->first(fn($r) => $r->month_num == $mNum && $r->order_type === 'b2b_wholesale');

            $b2cAmount = (float) ($b2cRecord?->total_amount ?? 0);
            $b2bAmount = (float) ($b2bRecord?->total_amount ?? 0);
            $b2cCount  = (int) ($b2cRecord?->order_count ?? 0);
            $b2bCount  = (int) ($b2bRecord?->order_count ?? 0);

            $monthlySales[] = [
                'month'        => $mInfo['short'],
                'month_name'   => $mInfo['full'],
                'month_num'    => $mNum,
                'year'         => $selectedYear,
                'b2c'          => $b2cAmount,
                'b2b'          => $b2bAmount,
                'b2c_orders'   => $b2cCount,
                'b2b_orders'   => $b2bCount,
                'total'        => $b2cAmount + $b2bAmount,
                'total_orders' => $b2cCount + $b2bCount,
            ];
        }

        // Available years for dropdown
        $availableYears = Order::selectRaw('YEAR(created_at) as yr')
            ->distinct()
            ->pluck('yr')
            ->filter()
            ->map(fn($y) => (int) $y)
            ->toArray();
        if (!in_array($selectedYear, $availableYears)) {
            $availableYears[] = $selectedYear;
        }
        sort($availableYears);

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue'           => $filteredRevenue,
                'total_orders'            => $filteredOrders,
                'all_time_revenue'        => $allTimeRevenue,
                'all_time_orders'         => $allTimeOrders,
                'total_customers'         => $totalCustomers,
                'total_resellers'         => $totalResellers,
                'pending_resellers'       => $pendingResellers,
                'filter' => [
                    'year'                => $selectedYear,
                    'month'               => $selectedMonth,
                    'month_name'          => $selectedMonth ? $monthNames[$selectedMonth]['full'] : 'Semua Bulan',
                    'available_years'     => $availableYears,
                ],
                'month_breakdown' => [
                    'b2c_revenue'         => $filteredB2cRevenue,
                    'b2b_revenue'         => $filteredB2bRevenue,
                    'b2c_orders'          => $filteredB2cOrders,
                    'b2b_orders'          => $filteredB2bOrders,
                    'total_revenue'       => $filteredB2cRevenue + $filteredB2bRevenue,
                    'total_orders'        => $filteredB2cOrders + $filteredB2bOrders,
                ],
                'best_selling_products'   => $bestSellers,
                'recent_orders'           => $recentOrders,
                'low_stock_alerts'        => $lowStockAlerts,
                'expiring_product_alerts' => $expiringBatches,
                'monthly_sales'           => $monthlySales,
            ]
        ]);
    }
}
