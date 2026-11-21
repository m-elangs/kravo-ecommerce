<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique()->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->enum('order_type', ['b2c_retail', 'b2b_wholesale'])->default('b2c_retail')->index();
            $table->enum('status', ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending_payment')->index();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('voucher_discount', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2);
            $table->string('voucher_code')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
