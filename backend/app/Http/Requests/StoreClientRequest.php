<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'total_orders' => ['nullable', 'integer', 'min:0'],
            'last_order' => ['nullable', 'date'],
            'total_spent' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
