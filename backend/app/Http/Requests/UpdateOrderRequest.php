<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_date' => ['sometimes', 'date'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.stock_item_id' => ['required_with:items', 'integer', 'exists:stock_items,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_price' => ['required_with:items', 'integer', 'min:0'],
        ];
    }
}
