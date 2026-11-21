<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'address_id',
        'courier_name',
        'service_name',
        'tracking_number',
        'shipping_status',
        'weight_grams',
        'notes',
        'dispatched_at',
        'delivered_at',
    ];

    protected $casts = [
        'weight_grams' => 'integer',
        'dispatched_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }
}
