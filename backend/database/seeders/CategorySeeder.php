<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Potato Chips', 'slug' => 'potato-chips', 'description' => 'Keripik kentang pilihan bertekstur krispi renyah dengan bumbu istimewa.', 'icon' => '🥔', 'sort_order' => 1],
            ['name' => 'Cassava Chips', 'slug' => 'cassava-chips', 'description' => 'Keripik singkong gurih tipis renyah dengan cita rasa truffle dan rempah lokal.', 'icon' => '🍠', 'sort_order' => 2],
            ['name' => 'Chocolate Cookies', 'slug' => 'chocolate-cookies', 'description' => 'Kue cookies cokelat lumer dengan cokelat Belgia murni dan potongan kacang.', 'icon' => '🍪', 'sort_order' => 3],
            ['name' => 'Cheese Crackers', 'slug' => 'cheese-crackers', 'description' => 'Krakers keju cheddar panggang keemasan yang gurih renyah tanpa henti.', 'icon' => '🧀', 'sort_order' => 4],
            ['name' => 'Spicy Snacks', 'slug' => 'spicy-snacks', 'description' => 'Sensasi pedas membakar lidah dengan cabai pilihan level 1 hingga level 5.', 'icon' => '🌶️', 'sort_order' => 5],
            ['name' => 'Snack Bundles', 'slug' => 'snack-bundles', 'description' => 'Paket hemat komplit cocok untuk hampers, rapat kantor, maupun pesta bersama.', 'icon' => '🎁', 'sort_order' => 6],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
