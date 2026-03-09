<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'threshold' => $this->threshold,
            'last_update' => $this->last_update,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
