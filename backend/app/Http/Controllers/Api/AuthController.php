<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $isReseller = $request->account_type === 'reseller';

        $roleName = $isReseller ? 'reseller' : 'customer';
        $role = Role::firstOrCreate(['name' => $roleName], [
            'display_name' => $isReseller ? 'B2B Reseller & Distributor' : 'Retail Customer',
            'description' => $isReseller ? 'Mitra bisnis & grosir KRAVO' : 'Konsumen retail biasa'
        ]);

        $user = User::create([
            'role_id' => $role->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        if ($isReseller) {
            $user->resellerProfile()->create([
                'company_name' => $request->company_name ?? $request->name,
                'business_type' => $request->business_type ?? 'Toko Retail & Distributor',
                'tax_id_or_nib' => $request->tax_id_or_nib,
                'business_address' => $request->business_address ?? '-',
                'status' => 'pending',
            ]);
        }

        if ($request->filled('street_address')) {
            $user->addresses()->create([
                'label' => 'Rumah Utama',
                'recipient_name' => $request->recipient_name ?: $user->name,
                'phone_number' => $request->phone ?: ($user->phone ?? '081234567890'),
                'street_address' => $request->street_address,
                'city' => $request->city ?? 'Jakarta Selatan',
                'province' => $request->province ?? 'DKI Jakarta',
                'postal_code' => $request->postal_code ?? '12000',
                'is_primary' => true,
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => $isReseller
                ? 'Pendaftaran akun Agen/Reseller berhasil! Menunggu verifikasi tim admin KRAVO.'
                : 'Registrasi berhasil! Selamat datang di KRAVO.',
            'data' => [
                'user' => $user->load(['role', 'resellerProfile', 'addresses']),
                'token' => $token,
            ]
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kombinasi email dan kata sandi tidak cocok.',
            ], 422);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi admin KRAVO.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $user->load(['role', 'resellerProfile', 'addresses']),
                'token' => $token,
            ]
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user()->load(['role', 'resellerProfile', 'addresses']),
            ]
        ]);
    }

    public function updateAddress(Request $request): JsonResponse
    {
        $request->validate([
            'street_address' => 'required|string|min:5|max:500',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
            'recipient_name' => 'nullable|string|max:100',
            'phone_number' => 'nullable|string|max:25',
        ], [
            'street_address.required' => 'Alamat jalan/rumah wajib diisi.',
            'street_address.min' => 'Alamat jalan/rumah minimal 5 karakter.',
            'city.required' => 'Kota/kabupaten wajib diisi.',
            'province.required' => 'Provinsi wajib diisi.',
            'postal_code.required' => 'Kode pos wajib diisi.',
        ]);

        $user = $request->user();
        $address = $user->addresses()->where('is_primary', true)->first()
            ?? $user->addresses()->first();

        $data = [
            'label' => 'Rumah Utama',
            'recipient_name' => $request->recipient_name ?: $user->name,
            'phone_number' => $request->phone_number ?: ($user->phone ?? '081234567890'),
            'street_address' => $request->street_address,
            'city' => $request->city,
            'province' => $request->province,
            'postal_code' => $request->postal_code,
            'is_primary' => true,
        ];

        if ($address) {
            $address->update($data);
        } else {
            $user->addresses()->create($data);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data diri alamat rumah berhasil disimpan!',
            'data' => [
                'user' => $user->fresh(['role', 'resellerProfile', 'addresses']),
                'address' => $address ? $address->fresh() : $user->addresses()->first(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesi login berhasil diakhiri.',
        ]);
    }
}
