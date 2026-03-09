<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockItemResource;
use App\Models\StockItem;
use Illuminate\Http\Request;

class ClientStockItemController extends Controller
{
    public function index(Request $request)
    {
        $query = StockItem::query()->orderBy('category')->orderBy('name');

        $perPage = (int) $request->integer('per_page', 200);
        $perPage = max(1, min(200, $perPage));

        return StockItemResource::collection($query->paginate($perPage));
    }
}
