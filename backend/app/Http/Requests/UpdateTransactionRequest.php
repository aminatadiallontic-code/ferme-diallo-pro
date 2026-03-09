<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'required', 'in:revenu,depense'],
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'amount' => ['sometimes', 'required', 'integer', 'min:0'],
            'date' => ['sometimes', 'required', 'date'],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}
