<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StockItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClientOrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->client_id) {
            throw ValidationException::withMessages([
                'client' => "Aucun client n'est associé à ce compte.",
            ]);
        }

        $query = Order::query()
            ->where('client_id', $user->client_id)
            ->with(['items.stockItem'])
            ->latest();

        $perPage = (int) $request->integer('per_page', 20);
        $perPage = max(1, min(200, $perPage));

        return OrderResource::collection($query->paginate($perPage));
    }

    public function store(StoreOrderRequest $request)
    {
        $user = $request->user();

        if (!$user || !$user->client_id) {
            throw ValidationException::withMessages([
                'client' => "Aucun client n'est associé à ce compte.",
            ]);
        }

        $validated = $request->validated();

        if ((int) $validated['client_id'] !== (int) $user->client_id) {
            throw ValidationException::withMessages([
                'client_id' => 'Client invalide.',
            ]);
        }

        return DB::transaction(function () use ($validated) {
            $order = Order::create([
                'client_id' => (int) $validated['client_id'],
                'order_date' => $validated['order_date'],
                'status' => 'brouillon',
                'total_amount' => 0,
            ]);

            $total = 0;

            foreach ($validated['items'] as $item) {
                $stock = StockItem::findOrFail((int) $item['stock_item_id']);

                $lineTotal = (int) $item['quantity'] * (int) $item['unit_price'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'stock_item_id' => $stock->id,
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => (int) $item['unit_price'],
                    'line_total' => $lineTotal,
                ]);

                $total += $lineTotal;
            }

            $order->update(['total_amount' => $total]);

            return (new OrderResource($order->load(['items.stockItem'])))
                ->response()
                ->setStatusCode(201);
        });
    }
}
