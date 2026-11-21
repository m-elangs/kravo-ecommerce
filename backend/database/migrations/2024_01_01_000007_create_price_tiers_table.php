<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->integer('min_quantity'); // e.g. 50, 200, 500
            $table->decimal('unit_price', 12, 2); // DECIMAL strictly
            $table->decimal('discount_percentage', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['product_variant_id', 'min_quantity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_tiers');
    }
};
