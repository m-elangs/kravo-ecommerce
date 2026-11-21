<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Address;
use App\Models\ResellerProfile;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $resellerRole = Role::where('name', 'reseller')->first();
        $customerRole = Role::where('name', 'customer')->first();

        // 1. Super Admin
        $admin = User::firstOrCreate(['email' => 'admin@kravo.id'], [
            'role_id' => $adminRole->id,
            'name' => 'Admin KRAVO HQ',
            'phone' => '08110000001',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        // 2. Verified Reseller (Approved)
        $reseller = User::firstOrCreate(['email' => 'reseller@kravo.id'], [
            'role_id' => $resellerRole->id,
            'name' => 'Haji Ahmad Santoso',
            'phone' => '081299998888',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        ResellerProfile::firstOrCreate(['user_id' => $reseller->id], [
            'company_name' => 'CV Snack Barokah Mandiri',
            'business_type' => 'Distributor Regional Kargo',
            'tax_id_or_nib' => '9120019283741',
            'business_address' => 'Jl. Industri Rungkut No. 88, Surabaya, Jawa Timur',
            'document_path' => 'reseller_docs/sample_nib.pdf',
            'status' => 'approved',
            'verified_by' => $admin->id,
            'verified_at' => now(),
        ]);

        // 3. Retail Customer
        $customer = User::firstOrCreate(['email' => 'customer@kravo.id'], [
            'role_id' => $customerRole->id,
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        Address::firstOrCreate(['user_id' => $customer->id], [
            'label' => 'Rumah Utama',
            'recipient_name' => 'Budi Santoso',
            'phone_number' => '081234567890',
            'street_address' => 'Jl. Senopati No. 45, Kebayoran Baru',
            'subdistrict' => 'Senayan',
            'district' => 'Kebayoran Baru',
            'city' => 'Jakarta Selatan',
            'province' => 'DKI Jakarta',
            'postal_code' => '12190',
            'is_primary' => true,
        ]);
    }
}
