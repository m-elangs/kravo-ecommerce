<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'package_type',
        'weight_grams',
        'retail_price',
        'minimum_order_quantity',
        'is_active',
    ];

    protected $casts = [
        'retail_price' => 'decimal:2',
        'weight_grams' => 'integer',
        'minimum_order_quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function priceTiers()
    {
        return $this->hasMany(PriceTier::class)->orderBy('min_quantity', 'asc');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class);
    }

    public function batches()
    {
        return $this->hasMany(ProductBatch::class)->orderBy('expiry_date', 'asc');
    }

    public function activeBatches()
    {
        return $this->hasMany(ProductBatch::class)
            ->where('status', 'active')
            ->where('expiry_date', '>', now()->addDays(30))
            ->where('current_quantity', '>', 0)
            ->orderBy('expiry_date', 'asc');
    }
}
