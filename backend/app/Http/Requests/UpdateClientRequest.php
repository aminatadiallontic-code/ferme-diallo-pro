<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'required', 'string', 'max:50'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'total_orders' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'last_order' => ['sometimes', 'nullable', 'date'],
            'total_spent' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}
