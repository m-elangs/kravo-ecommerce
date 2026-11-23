<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VoucherAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Voucher::latest();

        if ($request->search) {
            $query->where('code', 'like', "%{$request->search}%")
                  ->orWhere('name', 'like', "%{$request->search}%");
        }

        $vouchers = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $vouchers->map(function ($v) {
                return [
                    'id'            => $v->id,
                    'code'          => $v->code,
                    'name'          => $v->name,
                    'type'          => $v->discount_type,
                    'value'         => (float) $v->discount_value,
                    'min_purchase'  => $v->min_order_amount ? (float) $v->min_order_amount : null,
                    'max_discount'  => $v->max_discount_amount ? (float) $v->max_discount_amount : null,
                    'usage_limit'   => $v->quota,
                    'used_count'    => (int) ($v->used_count ?? 0),
                    'valid_from'    => $v->start_date ? $v->start_date->format('d M Y') : null,
                    'valid_until'   => $v->end_date ? $v->end_date->format('d M Y') : null,
                    'is_active'     => (bool) $v->is_active,
                    'created_at'    => $v->created_at ? $v->created_at->format('d M Y') : '-',
                ];
            }),
            'meta' => [
                'total'        => $vouchers->total(),
                'current_page' => $vouchers->currentPage(),
                'last_page'    => $vouchers->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code'         => ['required', 'string', 'max:50', Rule::unique('vouchers', 'code')],
            'name'         => ['nullable', 'string', 'max:100'],
            'type'         => ['required', Rule::in(['percentage', 'fixed'])],
            'value'        => ['required', 'numeric', 'min:0'],
            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit'  => ['nullable', 'integer', 'min:1'],
            'valid_from'   => ['nullable', 'date'],
            'valid_until'  => ['nullable', 'date', 'after_or_equal:valid_from'],
            'is_active'    => ['nullable', 'boolean'],
        ]);

        $voucher = Voucher::create([
            'code'                => strtoupper(trim($request->code)),
            'name'                => $request->filled('name') ? trim($request->name) : ('Promo ' . strtoupper(trim($request->code))),
            'discount_type'       => $request->type,
            'discount_value'      => $request->value,
            'min_order_amount'    => $request->min_purchase ?? 0,
            'max_discount_amount' => $request->max_discount,
            'quota'               => $request->usage_limit ?? 100,
            'used_count'          => 0,
            'start_date'          => $request->valid_from,
            'end_date'            => $request->valid_until,
            'is_active'           => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil dibuat.',
            'data'    => $voucher
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $voucher = Voucher::findOrFail($id);

        $data = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $voucher->update($data);

        return response()->json(['success' => true, 'data' => $voucher]);
    }

    public function destroy($id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();

        return response()->json(['success' => true, 'message' => 'Voucher deleted']);
    }
}
