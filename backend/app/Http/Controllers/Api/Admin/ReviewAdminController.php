<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user', 'product'])->latest();

        if ($request->rating) {
            $query->where('rating', $request->rating);
        }

        if ($request->approved !== null) {
            $query->where('is_approved', $request->approved);
        }

        $reviews = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $reviews->map(function ($r) {
                return [
                    'id'           => $r->id,
                    'user_name'    => $r->user->name ?? 'Anonymous',
                    'product_name' => $r->product->name ?? '-',
                    'rating'       => $r->rating,
                    'comment'      => $r->comment,
                    'is_approved'  => $r->is_approved,
                    'created_at'   => $r->created_at->format('d M Y'),
                ];
            }),
            'meta' => [
                'total'        => $reviews->total(),
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
            ],
        ]);
    }

    public function approve($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_approved' => true]);

        return response()->json(['success' => true, 'message' => 'Review approved']);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json(['success' => true, 'message' => 'Review deleted']);
    }
}
