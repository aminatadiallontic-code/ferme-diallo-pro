<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStockItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'required', 'in:aliments,vaccins,oeufs'],
            'quantity' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'threshold' => ['sometimes', 'integer', 'min:0'],
            'last_update' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
