<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Client;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StockItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()->with(['client', 'items.stockItem'])->latest();

        if ($request->filled('client_id')) {
            $query->where('client_id', (int) $request->integer('client_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('from')) {
            $query->whereDate('order_date', '>=', $request->string('from')->toString());
        }

        if ($request->filled('to')) {
            $query->whereDate('order_date', '<=', $request->string('to')->toString());
        }

        if ($request->boolean('paginate', true)) {
            $perPage = (int) $request->integer('per_page', 20);
            $perPage = max(1, min(200, $perPage));

            return OrderResource::collection($query->paginate($perPage));
        }

        return OrderResource::collection($query->get());
    }

    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $client = Client::findOrFail($validated['client_id']);

            $order = Order::create([
                'client_id' => $client->id,
                'order_date' => $validated['order_date'],
                'status' => 'brouillon',
                'total_amount' => 0,
            ]);

            $total = 0;

            foreach ($validated['items'] as $item) {
                $lineTotal = (int) $item['quantity'] * (int) $item['unit_price'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'stock_item_id' => (int) $item['stock_item_id'],
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => (int) $item['unit_price'],
                    'line_total' => $lineTotal,
                ]);

                $total += $lineTotal;
            }

            $order->update(['total_amount' => $total]);

            return (new OrderResource($order->load(['client', 'items.stockItem'])))
                ->response()
                ->setStatusCode(201);
        });
    }

    public function show(Order $order)
    {
        return new OrderResource($order->load(['client', 'items.stockItem']));
    }

    public function update(UpdateOrderRequest $request, Order $order)
    {
        if ($order->status !== 'brouillon') {
            throw ValidationException::withMessages([
                'status' => 'Seules les commandes en brouillon peuvent être modifiées.',
            ]);
        }

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $order) {
            if (array_key_exists('order_date', $validated)) {
                $order->update(['order_date' => $validated['order_date']]);
            }

            if (array_key_exists('items', $validated)) {
                $order->items()->delete();

                $total = 0;

                foreach ($validated['items'] as $item) {
                    $lineTotal = (int) $item['quantity'] * (int) $item['unit_price'];

                    OrderItem::create([
                        'order_id' => $order->id,
                        'stock_item_id' => (int) $item['stock_item_id'],
                        'quantity' => (int) $item['quantity'],
                        'unit_price' => (int) $item['unit_price'],
                        'line_total' => $lineTotal,
                    ]);

                    $total += $lineTotal;
                }

                $order->update(['total_amount' => $total]);
            }

            return new OrderResource($order->load(['client', 'items.stockItem']));
        });
    }

    public function confirm(Request $request, Order $order)
    {
        if ($order->status !== 'brouillon') {
            throw ValidationException::withMessages([
                'status' => 'Seules les commandes en brouillon peuvent être confirmées.',
            ]);
        }

        return DB::transaction(function () use ($order) {
            $order->load(['items', 'client']);

            foreach ($order->items as $item) {
                $stock = StockItem::lockForUpdate()->findOrFail($item->stock_item_id);

                if ($stock->quantity < $item->quantity) {
                    throw ValidationException::withMessages([
                        'stock' => "Stock insuffisant pour l'article {$stock->name}.",
                    ]);
                }

                $stock->update([
                    'quantity' => (int) $stock->quantity - (int) $item->quantity,
                    'last_update' => now()->toDateString(),
                ]);
            }

            $order->update(['status' => 'confirmee']);

            $order->client->update([
                'total_orders' => (int) $order->client->total_orders + 1,
                'total_spent' => (int) $order->client->total_spent + (int) $order->total_amount,
                'last_order' => $order->order_date,
            ]);

            return new OrderResource($order->load(['client', 'items.stockItem']));
        });
    }

    public function destroy(Order $order)
    {
        if ($order->status === 'confirmee') {
            throw ValidationException::withMessages([
                'status' => 'Impossible de supprimer une commande confirmée.',
            ]);
        }

        $order->delete();

        return response()->noContent();
    }
}
