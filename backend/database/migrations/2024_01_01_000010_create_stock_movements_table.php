<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_batch_id')->constrained('product_batches')->onDelete('cascade');
            $table->string('reference_type')->nullable(); // 'Order', 'Production', 'Adjustment'
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->enum('movement_type', ['stock_in', 'allocated', 'dispatched', 'adjustment', 'expired_writeoff'])->index();
            $table->integer('quantity'); // Positive for IN, negative for OUT
            $table->integer('previous_stock');
            $table->integer('current_stock');
            $table->string('reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
