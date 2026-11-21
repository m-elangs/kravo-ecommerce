<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Voucher;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
        ]);

        // Demo Promo Voucher
        Voucher::firstOrCreate(['code' => 'KRAVOFRESH'], [
            'name' => 'Promo Diskon Snack Segar 15%',
            'discount_type' => 'percentage',
            'discount_value' => 15.00,
            'min_order_amount' => 50000.00,
            'max_discount_amount' => 30000.00,
            'quota' => 500,
            'used_count' => 12,
            'start_date' => now()->subDays(5),
            'end_date' => now()->addDays(60),
            'is_active' => true,
        ]);

        Voucher::firstOrCreate(['code' => 'B2BPARTNER'], [
            'name' => 'Cashback Grosir Reseller KRAVO',
            'discount_type' => 'fixed',
            'discount_value' => 100000.00,
            'min_order_amount' => 1500000.00,
            'max_discount_amount' => 100000.00,
            'quota' => 100,
            'used_count' => 4,
            'start_date' => now()->subDays(10),
            'end_date' => now()->addDays(90),
            'is_active' => true,
        ]);
    }
}
