<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'total_orders',
        'last_order',
        'total_spent',
    ];

    protected function casts(): array
    {
        return [
            'total_orders' => 'integer',
            'total_spent' => 'integer',
            'last_order' => 'date',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
