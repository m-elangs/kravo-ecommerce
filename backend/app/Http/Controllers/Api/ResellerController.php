<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResellerRegisterRequest;
use App\Models\ResellerProfile;
use App\Models\Product;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResellerController extends Controller
{
    /**
     * Submit B2B reseller registration.
     */
    public function register(ResellerRegisterRequest $request): JsonResponse
    {
        $user = $request->user();

        // Check if already registered
        $existing = ResellerProfile::where('user_id', $user->id)->first();
        if ($existing && $existing->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda sudah disetujui sebagai mitra reseller KRAVO.',
            ], 422);
        }

        $docPath = null;
        if ($request->hasFile('document')) {
            $docPath = $request->file('document')->store('reseller_docs', 'local');
        }

        $profile = ResellerProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'company_name' => $request->company_name,
                'business_type' => $request->business_type,
                'tax_id_or_nib' => $request->tax_id_or_nib,
                'business_address' => $request->business_address,
                'document_path' => $docPath,
                'status' => 'pending',
                'rejection_reason' => null,
            ]
        );

        // Switch role to reseller
        $resellerRole = Role::where('name', 'reseller')->first();
        if ($resellerRole) {
            $user->role_id = $resellerRole->id;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran reseller berhasil dikirim! Menunggu verifikasi tim admin KRAVO.',
            'data' => $profile,
        ], 201);
    }

    /**
     * Get current reseller status.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = ResellerProfile::where('user_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'is_reseller' => $user->isReseller(),
                'status' => $profile ? $profile->status : 'unregistered',
                'profile' => $profile,
            ]
        ]);
    }

    /**
     * Wholesale catalog with B2B tiered pricing.
     */
    public function wholesaleProducts(Request $request): JsonResponse
    {
        $products = Product::where('is_active', true)
            ->with(['category', 'variants.inventory', 'variants.priceTiers', 'primaryImage'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }
}
