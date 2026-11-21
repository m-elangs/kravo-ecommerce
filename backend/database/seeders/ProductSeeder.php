<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\PriceTier;
use App\Models\Inventory;
use App\Models\ProductBatch;
use App\Models\StockMovement;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $cassavaCat = Category::where('slug', 'cassava-chips')->first();
        $cheeseCat = Category::where('slug', 'cheese-crackers')->first();
        $cookieCat = Category::where('slug', 'chocolate-cookies')->first();
        $potatoCat = Category::where('slug', 'potato-chips')->first();

        // 1. Truffle Cassava Gourmet
        $p1 = Product::firstOrCreate(['slug' => 'kravo-gourmet-truffle-cassava'], [
            'category_id' => $cassavaCat->id,
            'name' => 'KRAVO Gourmet Truffle Cassava',
            'tagline' => 'Black Truffle & Sea Salt Crispy Chips',
            'description' => 'Keripik singkong renyah kualitas ekspor yang dipanggang dengan balutan black truffle asli dan taburan sea salt murni.',
            'ingredients' => 'Singkong Dieng pilihan, Minyak Nabati Kelapa Sawit, Ekstrak Black Truffle Asli, Garam Laut Mediterania.',
            'storage_instructions' => 'Simpan di tempat kering dan sejuk terhindar dari sinar matahari langsung.',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $v1 = ProductVariant::firstOrCreate(['sku' => 'KRV-CSV-TRF-100'], [
            'product_id' => $p1->id,
            'name' => '100g Pouch Reguler',
            'package_type' => 'pouch',
            'weight_grams' => 100,
            'retail_price' => 24500.00,
            'minimum_order_quantity' => 50,
            'is_active' => true,
        ]);

        // Price tiers for B2B wholesale
        PriceTier::firstOrCreate(['product_variant_id' => $v1->id, 'min_quantity' => 50], [
            'unit_price' => 18000.00,
            'discount_percentage' => 26.50,
        ]);
        PriceTier::firstOrCreate(['product_variant_id' => $v1->id, 'min_quantity' => 200], [
            'unit_price' => 16500.00,
            'discount_percentage' => 32.65,
        ]);
        PriceTier::firstOrCreate(['product_variant_id' => $v1->id, 'min_quantity' => 500], [
            'unit_price' => 14500.00,
            'discount_percentage' => 40.80,
        ]);

        // Batches for FEFO
        $b1 = ProductBatch::firstOrCreate(['batch_number' => 'KB-2026-CSV-01'], [
            'product_variant_id' => $v1->id,
            'manufacturing_date' => now()->subMonths(1)->toDateString(),
            'expiry_date' => now()->addMonths(11)->toDateString(),
            'initial_quantity' => 1000,
            'current_quantity' => 540,
            'status' => 'active',
            'notes' => 'Batch oven ke-1 fresh',
        ]);

        Inventory::firstOrCreate(['product_variant_id' => $v1->id], [
            'total_physical_stock' => 540,
            'reserved_stock' => 40,
            'available_stock' => 500,
            'low_stock_threshold' => 50,
        ]);

        // 2. Golden Cheddar Crackers
        $p2 = Product::firstOrCreate(['slug' => 'kravo-golden-cheddar-crackers'], [
            'category_id' => $cheeseCat->id,
            'name' => 'KRAVO Golden Cheddar Crackers',
            'tagline' => 'Aged Cheddar & Herb Oven Baked',
            'description' => 'Krakers keju panggang keemasan dengan taburan rosemary dan aged cheddar cheese premium.',
            'ingredients' => 'Tepung Terigu, Keju Cheddar Asli, Mentega, Garam, Daun Rosemary Kering.',
            'storage_instructions' => 'Tutup rapat kembali setelah dibuka agar kerenyahan tetap terjaga.',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $v2 = ProductVariant::firstOrCreate(['sku' => 'KRV-CRK-CHD-100'], [
            'product_id' => $p2->id,
            'name' => '100g Pouch Reguler',
            'package_type' => 'pouch',
            'weight_grams' => 100,
            'retail_price' => 22000.00,
            'minimum_order_quantity' => 50,
            'is_active' => true,
        ]);

        PriceTier::firstOrCreate(['product_variant_id' => $v2->id, 'min_quantity' => 50], [
            'unit_price' => 16500.00,
            'discount_percentage' => 25.00,
        ]);
        PriceTier::firstOrCreate(['product_variant_id' => $v2->id, 'min_quantity' => 200], [
            'unit_price' => 15000.00,
            'discount_percentage' => 31.80,
        ]);

        $b2 = ProductBatch::firstOrCreate(['batch_number' => 'KB-2026-CRK-01'], [
            'product_variant_id' => $v2->id,
            'manufacturing_date' => now()->subMonths(2)->toDateString(),
            'expiry_date' => now()->addMonths(8)->toDateString(),
            'initial_quantity' => 800,
            'current_quantity' => 320,
            'status' => 'active',
            'notes' => 'Batch oven keju',
        ]);

        Inventory::firstOrCreate(['product_variant_id' => $v2->id], [
            'total_physical_stock' => 320,
            'reserved_stock' => 20,
            'available_stock' => 300,
            'low_stock_threshold' => 50,
        ]);

        // 3. Dark Fudge Brownie Cookies
        $p3 = Product::firstOrCreate(['slug' => 'kravo-dark-fudge-brownie-cookies'], [
            'category_id' => $cookieCat->id,
            'name' => 'KRAVO Dark Fudge Brownie Cookies',
            'tagline' => 'Belgian Dark Chocolate 70% Melt',
            'description' => 'Cookies cokelat pekat renyah di luar dengan sensasi lumer fudge cokelat Belgia di dalam.',
            'ingredients' => 'Kakao Hitam Belgia 70%, Tepung Almond, Gula Tebu Alami, Mentega Wisman.',
            'storage_instructions' => 'Simpan pada suhu ruang sejuk (18-24 derajat Celcius).',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $v3 = ProductVariant::firstOrCreate(['sku' => 'KRV-COK-FDG-100'], [
            'product_id' => $p3->id,
            'name' => '100g Pouch Reguler',
            'package_type' => 'pouch',
            'weight_grams' => 100,
            'retail_price' => 28000.00,
            'minimum_order_quantity' => 50,
            'is_active' => true,
        ]);

        PriceTier::firstOrCreate(['product_variant_id' => $v3->id, 'min_quantity' => 50], [
            'unit_price' => 21000.00,
            'discount_percentage' => 25.00,
        ]);

        $b3 = ProductBatch::firstOrCreate(['batch_number' => 'KB-2026-COK-01'], [
            'product_variant_id' => $v3->id,
            'manufacturing_date' => now()->subMonths(1)->toDateString(),
            'expiry_date' => now()->addMonths(5)->toDateString(),
            'initial_quantity' => 500,
            'current_quantity' => 210,
            'status' => 'active',
            'notes' => 'Batch cokelat',
        ]);

        Inventory::firstOrCreate(['product_variant_id' => $v3->id], [
            'total_physical_stock' => 210,
            'reserved_stock' => 10,
            'available_stock' => 200,
            'low_stock_threshold' => 50,
        ]);
    }
}
