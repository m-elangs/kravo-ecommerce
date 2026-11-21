<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResellerProfile;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResellerVerificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ResellerProfile::with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $resellers = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $resellers->items(),
            'meta' => [
                'current_page' => $resellers->currentPage(),
                'last_page' => $resellers->lastPage(),
                'total' => $resellers->total(),
            ]
        ]);
    }

    public function verify(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $profile = ResellerProfile::findOrFail($id);
        $profile->status = $request->status;
        $profile->rejection_reason = $request->status === 'rejected' ? $request->rejection_reason : null;
        $profile->verified_by = auth()->id();
        $profile->verified_at = now();
        $profile->save();

        // If approved, ensure user has reseller role
        if ($request->status === 'approved') {
            $resellerRole = Role::firstOrCreate(['name' => 'reseller'], [
                'display_name' => 'B2B Reseller & Distributor',
            ]);
            $user = $profile->user;
            $user->role_id = $resellerRole->id;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => "Permohonan reseller {$profile->company_name} berhasil di-{$request->status}.",
            'data' => $profile->load('user'),
        ]);
    }
}
