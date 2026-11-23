<?php

use Illuminate\Support\Facades\Route;

// Public & Customer Controllers
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ResellerController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ReviewController;

// Admin Controllers
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ProductManagementController as AdminProductController;
use App\Http\Controllers\Api\Admin\BatchInventoryController as AdminBatchController;
use App\Http\Controllers\Api\Admin\OrderManagementController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ResellerVerificationController as AdminResellerController;
use App\Http\Controllers\Api\Admin\WholesalePricingController as AdminWholesaleController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\PaymentAdminController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\ShipmentAdminController as AdminShipmentController;
use App\Http\Controllers\Api\Admin\VoucherAdminController as AdminVoucherController;
use App\Http\Controllers\Api\Admin\ReviewAdminController as AdminReviewController;
use App\Http\Controllers\Api\Admin\InventoryAdminController as AdminInventoryController;
use App\Http\Controllers\Api\Admin\UserAdminController as AdminUserController;
use App\Http\Controllers\Api\Admin\CategoryAdminController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\SupportAdminController as AdminSupportController;
use App\Http\Controllers\Api\Admin\ReportAdminController as AdminReportController;

/*
|--------------------------------------------------------------------------
| API Routes for KRAVO Modern Snack E-Commerce
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 1. Authentication Routes (Public)
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // 2. Catalog & Categories (Public)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // 3. Order Tracking (Public)
    Route::get('/orders/track/{orderNumber}', [OrderController::class, 'track']);

    // 4. Cart Routes (Guest / Authenticated)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{id}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{id}', [CartController::class, 'removeItem']);

    // 5. Payment Webhook & Direct Confirmation
    Route::post('/payments/midtrans-webhook', [PaymentWebhookController::class, 'handle']);
    Route::post('/orders/{orderNumber}/confirm-payment', [OrderController::class, 'confirmPayment']);

    // 5b. Contact & Support Message (Public)
    Route::post('/contact', [ContactController::class, 'store']);

    // 6. Protected Customer & Reseller Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/address', [AuthController::class, 'updateAddress']);

        // Checkout & Orders
        Route::post('/checkout/preview', [CheckoutController::class, 'preview']);
        Route::post('/checkout', [CheckoutController::class, 'checkout']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

        // Customer Product Reviews
        Route::post('/reviews', [ReviewController::class, 'store']);

        // Reseller Portal
        Route::post('/reseller/register', [ResellerController::class, 'register']);
        Route::get('/reseller/status', [ResellerController::class, 'status']);

        // B2B Wholesale Pricing (Requires Approved Reseller)
        Route::middleware('reseller.approved')->group(function () {
            Route::get('/wholesale/products', [ResellerController::class, 'wholesaleProducts']);
        });
    });

    // 7. Admin Dashboard Routes (Requires role: admin)
    Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        
        // Products & Variants CRUD
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
        Route::post('/products/{id}/image', [AdminProductController::class, 'uploadImage']);
        Route::delete('/products/{id}/image', [AdminProductController::class, 'deleteImage']);
        Route::post('/products/{productId}/variants', [AdminProductController::class, 'storeVariant']);
        Route::put('/variants/{id}', [AdminProductController::class, 'updateVariant']);
        Route::delete('/variants/{id}', [AdminProductController::class, 'deleteVariant']);
        Route::get('/batches', [AdminBatchController::class, 'index']);
        Route::post('/batches', [AdminBatchController::class, 'store']);
        Route::put('/batches/{id}', [AdminBatchController::class, 'update']);

        // Orders & Shipments
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::put('/orders/{id}/shipment', [AdminOrderController::class, 'updateShipment']);

        // Reseller Verifications
        Route::get('/resellers', [AdminResellerController::class, 'index']);
        Route::put('/resellers/{id}/verify', [AdminResellerController::class, 'verify']);
        Route::get('/resellers/{id}/document', [AdminResellerController::class, 'downloadDocument']);

        // Wholesale Pricing & MOQ
        Route::get('/wholesale-pricing', [AdminWholesaleController::class, 'index']);
        Route::post('/wholesale-pricing', [AdminWholesaleController::class, 'store']);
        Route::put('/wholesale-pricing/tier/{id}', [AdminWholesaleController::class, 'update']);
        Route::delete('/wholesale-pricing/tier/{id}', [AdminWholesaleController::class, 'destroy']);
        Route::put('/wholesale-pricing/moq/{variantId}', [AdminWholesaleController::class, 'updateMoq']);

        // Reports & Laporan Keuangan / Mutasi Stok
        Route::get('/reports/sales', [AdminReportController::class, 'sales']);
        Route::get('/reports/stock-movements', [AdminReportController::class, 'stockMovements']);

        // Customers
        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::get('/customers/{id}', [AdminCustomerController::class, 'show']);

        // Payments
        Route::get('/payments', [AdminPaymentController::class, 'index']);

        // Shipments
        Route::get('/shipments', [AdminShipmentController::class, 'index']);

        // Vouchers
        Route::get('/vouchers', [AdminVoucherController::class, 'index']);
        Route::post('/vouchers', [AdminVoucherController::class, 'store']);
        Route::put('/vouchers/{id}', [AdminVoucherController::class, 'update']);
        Route::delete('/vouchers/{id}', [AdminVoucherController::class, 'destroy']);

        // Reviews
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::put('/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
        Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

        // Inventory & Stock Movements
        Route::get('/inventory', [AdminInventoryController::class, 'index']);
        Route::put('/inventory/{id}', [AdminInventoryController::class, 'update']);
        Route::post('/inventory/{id}/release-reserved', [AdminInventoryController::class, 'releaseReserved']);
        Route::get('/inventory/movements', [AdminInventoryController::class, 'movements']);

        // Users Management
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        // Categories CRUD
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::post('/categories/{id}/image', [AdminCategoryController::class, 'uploadImage']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

        // Support & Layanan Bantuan
        Route::get('/support', [AdminSupportController::class, 'index']);
        Route::put('/support/{id}/status', [AdminSupportController::class, 'updateStatus']);
        Route::delete('/support/{id}', [AdminSupportController::class, 'destroy']);
    });
});
