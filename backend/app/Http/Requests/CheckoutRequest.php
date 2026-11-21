<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'required|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'address_id' => 'nullable|integer|exists:addresses,id',
            'courier' => 'nullable|string|max:100',
            'voucher_code' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
