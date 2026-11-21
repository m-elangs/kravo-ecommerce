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
            $query->where('code', 'like', "%{$request->search}%");
        }

        $vouchers = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $vouchers->map(function ($v) {
                return [
                    'id'            => $v->id,
                    'code'          => $v->code,
                    'type'          => $v->type,
                    'value'         => $v->value,
                    'min_purchase'  => $v->min_purchase,
                    'max_discount'  => $v->max_discount,
                    'usage_limit'   => $v->usage_limit,
                    'used_count'    => $v->used_count,
                    'valid_from'    => $v->valid_from ? $v->valid_from->format('d M Y') : null,
                    'valid_until'   => $v->valid_until ? $v->valid_until->format('d M Y') : null,
                    'is_active'     => $v->is_active,
                    'created_at'    => $v->created_at->format('d M Y'),
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
        $data = $request->validate([
            'code'         => ['required', 'string', 'max:50', Rule::unique('vouchers', 'code')],
            'type'         => ['required', Rule::in(['percentage', 'fixed'])],
            'value'        => ['required', 'numeric', 'min:0'],
            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit'  => ['nullable', 'integer', 'min:1'],
            'valid_from'   => ['nullable', 'date'],
            'valid_until'  => ['nullable', 'date', 'after_or_equal:valid_from'],
            'is_active'    => ['boolean'],
        ]);

        $voucher = Voucher::create($data);

        return response()->json(['success' => true, 'data' => $voucher], 201);
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
