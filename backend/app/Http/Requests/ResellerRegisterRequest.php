<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResellerRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name'     => 'required|string|min:3|max:150',
            'business_type'    => 'required|string|max:100',
            'tax_id_or_nib'    => 'required|string|min:10|max:50',
            'business_address' => 'required|string|min:10|max:500',
            'document'         => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // max 5MB
        ];
    }

    public function messages(): array
    {
        return [
            'company_name.required'     => 'Nama entitas usaha / toko wajib diisi.',
            'company_name.min'          => 'Nama usaha / toko minimal 3 karakter.',
            'business_type.required'    => 'Jenis usaha ritel wajib dipilih.',
            'tax_id_or_nib.required'    => 'Nomor NIB atau NPWP wajib diisi.',
            'tax_id_or_nib.min'         => 'Nomor NIB / NPWP minimal 10 digit angka.',
            'business_address.required' => 'Alamat fisik kantor / toko / gudang wajib diisi.',
            'business_address.min'      => 'Alamat fisik minimal 10 karakter.',
            'document.file'             => 'Berkas dokumen yang diunggah tidak valid.',
            'document.mimes'            => 'Format dokumen harus berupa PDF, PNG, atau JPG.',
            'document.max'              => 'Ukuran file dokumen maksimal 5 MB.',
        ];
    }
}
