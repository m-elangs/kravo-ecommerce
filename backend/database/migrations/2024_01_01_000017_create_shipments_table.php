<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->onDelete('cascade');
            $table->foreignId('address_id')->nullable()->constrained('addresses')->onDelete('set null');
            $table->string('courier_name'); // 'JNE', 'SiCepat', 'GoSend', 'Indah Logistik'
            $table->string('service_name')->nullable(); // 'Reguler', 'Best', 'Instant', 'Kargo'
            $table->string('tracking_number')->nullable()->index();
            $table->enum('shipping_status', ['pending_packing', 'packed', 'picked_up', 'in_transit', 'delivered'])->default('pending_packing')->index();
            $table->integer('weight_grams')->default(100);
            $table->text('notes')->nullable();
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
