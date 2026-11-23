<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryAdminController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $categories->map(fn($c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'slug'           => $c->slug,
                'icon'           => $c->icon,
                'image_url'      => $c->image_url,
                'description'    => $c->description,
                'products_count' => $c->products_count,
                'created_at'     => $c->created_at ? $c->created_at->format('d M Y') : '-',
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', Rule::unique('categories', 'name')],
            'icon'        => ['nullable', 'string', 'max:10'],
            'image_url'   => ['nullable', 'string', 'max:500'],
            'image'       => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'cat_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/categories'), $fileName);
            $data['image_url'] = url('uploads/categories/' . $fileName);
        }

        $data['slug'] = Str::slug($data['name']);

        $category = Category::create($data);

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', Rule::unique('categories', 'name')->ignore($id)],
            'icon'        => ['nullable', 'string', 'max:10'],
            'image_url'   => ['nullable', 'string', 'max:500'],
            'image'       => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'cat_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/categories'), $fileName);
            $data['image_url'] = url('uploads/categories/' . $fileName);
        }

        $data['slug'] = Str::slug($data['name']);
        $category->update($data);

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function uploadImage(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'image_url' => 'nullable|string|max:500',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'cat_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/categories'), $fileName);
            $imageUrl = url('uploads/categories/' . $fileName);
        } elseif ($request->filled('image_url')) {
            $imageUrl = $request->image_url;
        }

        if (!$imageUrl) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan pilih foto kategori atau masukkan URL foto.',
            ], 422);
        }

        $category->update(['image_url' => $imageUrl]);

        return response()->json([
            'success' => true,
            'message' => 'Foto kategori berhasil diperbarui!',
            'image_url' => $imageUrl,
            'data' => $category,
        ]);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori masih memiliki produk aktif. Pindahkan produk terlebih dahulu.'
            ], 422);
        }

        $category->delete();
        return response()->json(['success' => true, 'message' => 'Kategori berhasil dihapus.']);
    }
}
