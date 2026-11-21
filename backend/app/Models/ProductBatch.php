<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_variant_id',
        'batch_number',
        'manufacturing_date',
        'expiry_date',
        'initial_quantity',
        'current_quantity',
        'reserved_quantity',
        'status',
        'notes',
    ];

    protected $casts = [
        'manufacturing_date' => 'date',
        'expiry_date' => 'date',
        'initial_quantity' => 'integer',
        'current_quantity' => 'integer',
        'reserved_quantity' => 'integer',
    ];

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }

    public function isNearExpiry(int $daysThreshold = 60): bool
    {
        return $this->expiry_date->diffInDays(now()) <= $daysThreshold && !$this->isExpired();
    }
}
