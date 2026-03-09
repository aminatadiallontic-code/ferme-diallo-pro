<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'client_id',
        'order_date',
        'status',
        'total_amount',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'total_amount' => 'integer',
        ];
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
