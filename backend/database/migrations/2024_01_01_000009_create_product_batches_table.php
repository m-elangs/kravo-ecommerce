<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->string('batch_number')->unique()->index();
            $table->date('manufacturing_date');
            $table->date('expiry_date')->index(); // Critical index for FEFO ORDER BY expiry_date ASC
            $table->integer('initial_quantity');
            $table->integer('current_quantity');
            $table->integer('reserved_quantity')->default(0);
            $table->enum('status', ['active', 'near_expiry', 'expired', 'quarantined'])->default('active')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_batches');
    }
};
