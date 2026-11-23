<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'             => 'required|string|min:3|max:100',
            'email'            => 'required|email:rfc,dns|unique:users,email|max:150',
            'phone'            => ['required', 'string', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,12}$/'],
            'password'         => 'required|string|min:8|confirmed',
            'account_type'     => 'nullable|in:customer,reseller',
            'company_name'     => 'required_if:account_type,reseller|nullable|string|min:3|max:150',
            'business_type'    => 'nullable|string|max:100',
            'tax_id_or_nib'    => 'nullable|string|min:10|max:50',
            'business_address' => 'required_if:account_type,reseller|nullable|string|min:10|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                 => 'Nama lengkap wajib diisi.',
            'name.min'                      => 'Nama lengkap minimal 3 karakter.',
            'email.required'                => 'Alamat email wajib diisi.',
            'email.email'                   => 'Format alamat email tidak valid.',
            'email.unique'                  => 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau login.',
            'phone.required'                => 'Nomor telepon / WhatsApp wajib diisi.',
            'phone.regex'                   => 'Nomor HP tidak valid. Gunakan format nomor Indonesia (contoh: 081234567890).',
            'password.required'             => 'Kata sandi wajib diisi.',
            'password.min'                  => 'Kata sandi minimal 8 karakter.',
            'password.confirmed'            => 'Konfirmasi kata sandi tidak cocok.',
            'company_name.required_if'      => 'Nama usaha / toko wajib diisi untuk pendaftaran reseller.',
            'company_name.min'              => 'Nama usaha minimal 3 karakter.',
            'tax_id_or_nib.min'             => 'Nomor NIB / NPWP minimal 10 digit.',
            'business_address.required_if'  => 'Alamat fisik kantor / toko wajib diisi untuk verifikasi kemitraan.',
            'business_address.min'          => 'Alamat fisik toko minimal 10 karakter.',
        ];
    }
}
