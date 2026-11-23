<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'phone' => 'nullable|string|max:30',
            'subject' => 'nullable|string|max:150',
            'message' => 'required|string|max:2000',
        ]);

        $userId = $request->user('sanctum')?->id ?? auth('sanctum')->id();
        $data['user_id'] = $userId;
        $data['status'] = 'pending';

        $msg = ContactMessage::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Pesan dan pertanyaan Anda berhasil dikirimkan! Tim layanan bantuan KRAVO akan segera menghubungi Anda.',
            'data' => $msg,
        ], 201);
    }
}
