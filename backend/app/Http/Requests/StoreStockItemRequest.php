<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:aliments,vaccins,oeufs'],
            'quantity' => ['nullable', 'integer', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'threshold' => ['nullable', 'integer', 'min:0'],
            'last_update' => ['nullable', 'date'],
        ];
    }
}
