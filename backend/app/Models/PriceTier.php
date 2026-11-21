<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_variant_id',
        'min_quantity',
        'unit_price',
        'discount_percentage',
    ];

    protected $casts = [
        'min_quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
    ];

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
