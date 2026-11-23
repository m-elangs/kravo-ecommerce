<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Change foreign key from ON DELETE RESTRICT to ON DELETE SET NULL
        // and make product_variant_id nullable so historical orders keep invoice snapshots
        // even if a product or variant is deleted.
        try {
            DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_product_variant_id_foreign');
        } catch (\Throwable $e) {
            // Ignore if foreign key already dropped or named differently
        }

        DB::statement('ALTER TABLE order_items MODIFY product_variant_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_product_variant_id_foreign FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        try {
            DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_product_variant_id_foreign');
        } catch (\Throwable $e) {
            //
        }

        DB::statement('ALTER TABLE order_items MODIFY product_variant_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_product_variant_id_foreign FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT');
    }
};
