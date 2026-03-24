<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
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
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::query()->with(['client', 'items.stockItem'])->latest();

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 20);
        $perPage = max(1, min(200, $perPage));

        return OrderResource::collection($query->paginate($perPage));
    }

    /**
     * Store a newly created order.
     */
    public function store(StoreOrderRequest $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $client = Client::findOrFail($validated['client_id']);

            // Create order
            $order = Order::create([
                'client_id' => $client->id,
                'order_date' => $validated['order_date'] ?? now()->toDateString(),
                'status' => 'brouillon',
                'total_amount' => 0,
            ]);

            $total = 0;

            foreach ($validated['items'] as $item) {
                $stockItem = StockItem::findOrFail($item['stock_item_id']);
                $lineTotal = (int) $item['quantity'] * (int) $item['unit_price'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'stock_item_id' => $stockItem->id,
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => (int) $item['unit_price'],
                    'line_total' => $lineTotal,
                ]);

                $total += $lineTotal;
            }

            $order->update(['total_amount' => $total]);

            DB::commit();

            return response()->json([
                'message' => 'Commande créée avec succès',
                'order' => new OrderResource($order->load(['client', 'items.stockItem'])),
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création de la commande',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        return new OrderResource($order->load(['client', 'items.stockItem']));
    }

    /**
     * Confirm an order and decrement stock.
     */
    public function confirm(Request $request, Order $order)
    {
        if ($order->status !== 'brouillon') {
            return response()->json([
                'message' => 'Seules les commandes en brouillon peuvent être confirmées',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $order->load(['items.stockItem', 'client']);
            $stockUpdates = [];

            // Check and decrement stock for each item
            foreach ($order->items as $item) {
                $stock = StockItem::lockForUpdate()->findOrFail($item->stock_item_id);

                if ($stock->quantity < $item->quantity) {
                    throw ValidationException::withMessages([
                        'stock' => "Stock insuffisant pour l'article {$stock->name}. Disponible: {$stock->quantity} {$stock->unit}, Demandé: {$item->quantity} {$stock->unit}",
                    ]);
                }

                $oldQuantity = $stock->quantity;
                $newQuantity = $oldQuantity - $item->quantity;

                $stock->update([
                    'quantity' => $newQuantity,
                    'last_update' => now()->toDateString(),
                ]);

                $stockUpdates[] = [
                    'stock_item' => $stock->name,
                    'old_quantity' => $oldQuantity,
                    'new_quantity' => $newQuantity,
                    'decremented' => $item->quantity,
                ];
            }

            // Update order status
            $order->update(['status' => 'confirmé']);

            // Update client statistics
            $order->client->update([
                'total_orders' => (int) $order->client->total_orders + 1,
                'total_spent' => (int) $order->client->total_spent + (int) $order->total_amount,
                'last_order' => $order->order_date,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Commande confirmée avec succès',
                'order' => new OrderResource($order->load(['client', 'items.stockItem'])),
                'stock_updates' => $stockUpdates,
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la confirmation de la commande',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel an order.
     */
    public function cancel(Request $request, Order $order)
    {
        if ($order->status === 'annulé') {
            return response()->json([
                'message' => 'Cette commande est déjà annulée',
            ], 422);
        }

        if ($order->status === 'confirmé') {
            return response()->json([
                'message' => 'Impossible d\'annuler une commande confirmée. Veuillez contacter l\'administrateur.',
            ], 422);
        }

        $order->update(['status' => 'annulé']);

        return response()->json([
            'message' => 'Commande annulée avec succès',
            'order' => new OrderResource($order->load(['client', 'items.stockItem'])),
        ]);
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order)
    {
        if ($order->status === 'confirmé') {
            return response()->json([
                'message' => 'Impossible de supprimer une commande confirmée',
            ], 422);
        }

        $order->delete();

        return response()->json([
            'message' => 'Commande supprimée avec succès',
        ]);
    }
}
