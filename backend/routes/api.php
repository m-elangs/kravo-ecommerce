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

    // 5. Payment Webhook (Midtrans notification callback)
    Route::post('/payments/midtrans-webhook', [PaymentWebhookController::class, 'handle']);

    // 6. Protected Customer & Reseller Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Checkout & Orders
        Route::post('/checkout/preview', [CheckoutController::class, 'preview']);
        Route::post('/checkout', [CheckoutController::class, 'checkout']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

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
        
        // Products & Inventory
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::get('/batches', [AdminBatchController::class, 'index']);
        Route::post('/batches', [AdminBatchController::class, 'store']);

        // Orders & Shipments
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::put('/orders/{id}/shipment', [AdminOrderController::class, 'updateShipment']);

        // Reseller Verifications
        Route::get('/resellers', [AdminResellerController::class, 'index']);
        Route::put('/resellers/{id}/verify', [AdminResellerController::class, 'verify']);

        // Wholesale Pricing & MOQ
        Route::get('/wholesale-pricing', [AdminWholesaleController::class, 'index']);
        Route::post('/wholesale-pricing', [AdminWholesaleController::class, 'store']);
        Route::put('/wholesale-pricing/moq/{variantId}', [AdminWholesaleController::class, 'updateMoq']);

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
        Route::get('/inventory/movements', [AdminInventoryController::class, 'movements']);
    });
});
