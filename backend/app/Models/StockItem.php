<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockItem extends Model
{
    protected $fillable = [
        'name',
        'category',
        'quantity',
        'unit',
        'threshold',
        'last_update',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'threshold' => 'integer',
            'last_update' => 'date',
        ];
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
