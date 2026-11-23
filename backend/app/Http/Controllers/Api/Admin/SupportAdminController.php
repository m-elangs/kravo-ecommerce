<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::with('user')->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('message', 'like', "%{$s}%");
            });
        }

        $messages = $query->paginate(20);

        $counts = [
            'total'       => ContactMessage::count(),
            'pending'     => ContactMessage::where('status', 'pending')->count(),
            'in_progress' => ContactMessage::where('status', 'in_progress')->count(),
            'resolved'    => ContactMessage::where('status', 'resolved')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $messages->items(),
            'counts' => $counts,
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
                'total'        => $messages->total(),
            ]
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $msg = ContactMessage::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,in_progress,resolved',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $msg->status = $request->status;
        if ($request->has('admin_notes')) {
            $msg->admin_notes = $request->admin_notes;
        }
        $msg->save();

        return response()->json([
            'success' => true,
            'message' => 'Status tiket bantuan berhasil diperbarui.',
            'data' => $msg,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $msg = ContactMessage::findOrFail($id);
        $msg->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pesan bantuan berhasil dihapus.',
        ]);
    }
}
