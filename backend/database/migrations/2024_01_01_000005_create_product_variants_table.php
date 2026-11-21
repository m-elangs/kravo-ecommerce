<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('sku')->unique()->index();
            $table->string('name'); // e.g. '100g Pouch Reguler', '250g Family Pack'
            $table->string('package_type')->default('pouch');
            $table->integer('weight_grams')->default(100);
            $table->decimal('retail_price', 12, 2); // DECIMAL strictly for currency
            $table->integer('minimum_order_quantity')->default(1); // MOQ for wholesale
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
