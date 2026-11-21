<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'admin'], [
            'display_name' => 'Super Administrator',
            'description' => 'Akses penuh ke seluruh modul sistem KRAVO HQ'
        ]);

        Role::firstOrCreate(['name' => 'reseller'], [
            'display_name' => 'B2B Wholesale Reseller',
            'description' => 'Mitra bisnis grosir terverifikasi'
        ]);

        Role::firstOrCreate(['name' => 'customer'], [
            'display_name' => 'Retail Customer',
            'description' => 'Konsumen retail biasa'
        ]);
    }
}
