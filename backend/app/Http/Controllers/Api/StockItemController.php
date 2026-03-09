<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockItemRequest;
use App\Http\Requests\UpdateStockItemQuantityRequest;
use App\Http\Requests\UpdateStockItemRequest;
use App\Http\Resources\StockItemResource;
use App\Models\StockItem;
use Illuminate\Http\Request;

class StockItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = StockItem::query()->orderBy('category')->orderBy('name');

        if ($request->boolean('paginate', true)) {
            $perPage = (int) $request->integer('per_page', 50);
            $perPage = max(1, min(200, $perPage));

            return StockItemResource::collection($query->paginate($perPage));
        }

        return StockItemResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStockItemRequest $request)
    {
        $item = StockItem::create($request->validated());

        return (new StockItemResource($item))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(StockItem $stockItem)
    {
        return new StockItemResource($stockItem);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStockItemRequest $request, StockItem $stockItem)
    {
        $validated = $request->validated();

        $quantityChanged = array_key_exists('quantity', $validated)
            && (int) $stockItem->quantity !== (int) ($validated['quantity'] ?? 0);

        $thresholdChanged = array_key_exists('threshold', $validated)
            && (int) $stockItem->threshold !== (int) ($validated['threshold'] ?? 0);

        if (!array_key_exists('last_update', $validated) && ($quantityChanged || $thresholdChanged)) {
            $validated['last_update'] = now()->toDateString();
        }

        $stockItem->update($validated);

        return new StockItemResource($stockItem);
    }

    public function updateQuantity(UpdateStockItemQuantityRequest $request, StockItem $stockItem)
    {
        $validated = $request->validated();

        $stockItem->update([
            'quantity' => $validated['quantity'],
            'last_update' => now()->toDateString(),
        ]);

        return new StockItemResource($stockItem);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StockItem $stockItem)
    {
        $stockItem->delete();

        return response()->noContent();
    }
}
