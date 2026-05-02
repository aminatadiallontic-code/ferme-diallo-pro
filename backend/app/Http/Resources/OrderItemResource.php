<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'stock_item_id' => $this->stock_item_id,
            'stock_item' => $this->whenLoaded('stockItem', function () {
                return [
                    'id' => $this->stockItem->id,
                    'name' => $this->stockItem->name,
                    'category' => $this->stockItem->category,
                    'unit' => $this->stockItem->unit,
                ];
            }),
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'line_total' => $this->line_total,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
