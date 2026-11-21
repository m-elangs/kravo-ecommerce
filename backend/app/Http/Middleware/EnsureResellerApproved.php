<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureResellerApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->isReseller()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses khusus reseller KRAVO.',
            ], 403);
        }

        if (!$user->isApprovedReseller()) {
            $status = $user->resellerProfile ? $user->resellerProfile->status : 'unregistered';
            return response()->json([
                'success' => false,
                'message' => "Akses harga grosir belum aktif. Status kemitraan Anda saat ini: {$status}.",
                'data' => [
                    'reseller_status' => $status,
                ]
            ], 403);
        }

        return $next($request);
    }
}
