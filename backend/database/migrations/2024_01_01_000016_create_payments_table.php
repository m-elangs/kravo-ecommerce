<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->onDelete('cascade');
            $table->string('payment_number')->unique()->index();
            $table->string('payment_gateway')->default('midtrans');
            $table->string('transaction_id')->nullable()->index(); // Midtrans transaction ID
            $table->string('payment_type')->nullable(); // 'bank_transfer', 'qris', 'gopay', 'credit_card'
            $table->decimal('gross_amount', 12, 2);
            $table->string('snap_token')->nullable();
            $table->string('snap_redirect_url')->nullable();
            $table->enum('status', ['pending', 'settlement', 'expire', 'cancel', 'deny'])->default('pending')->index();
            $table->text('signature_key')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
