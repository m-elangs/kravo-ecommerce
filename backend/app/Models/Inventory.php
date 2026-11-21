<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_variant_id',
        'total_physical_stock',
        'reserved_stock',
        'available_stock',
        'low_stock_threshold',
    ];

    protected $casts = [
        'total_physical_stock' => 'integer',
        'reserved_stock' => 'integer',
        'available_stock' => 'integer',
        'low_stock_threshold' => 'integer',
    ];

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
