<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'discount_type',
        'discount_value',
        'min_order_amount',
        'max_discount_amount',
        'quota',
        'used_count',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'quota' => 'integer',
        'used_count' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function isValidForAmount(float $subtotal): bool
    {
        if (!$this->is_active) return false;
        if ($this->used_count >= $this->quota) return false;
        if ($this->start_date && now()->isBefore($this->start_date)) return false;
        if ($this->end_date && now()->isAfter($this->end_date)) return false;
        if ($subtotal < (float)$this->min_order_amount) return false;

        return true;
    }

    public function calculateDiscount(float $subtotal): float
    {
        if (!$this->isValidForAmount($subtotal)) return 0;

        if ($this->discount_type === 'percentage') {
            $discount = $subtotal * ((float)$this->discount_value / 100);
            if ($this->max_discount_amount && $discount > (float)$this->max_discount_amount) {
                $discount = (float)$this->max_discount_amount;
            }
            return round($discount, 2);
        }

        return min((float)$this->discount_value, $subtotal);
    }
}
