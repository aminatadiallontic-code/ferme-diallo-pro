<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockItemRequest;
use App\Http\Requests\UpdateStockItemQuantityRequest;
use App\Http\Requests\UpdateStockItemRequest;
use App\Http\Resources\StockItemResource;
use App\Models\StockItem;
use App\Models\Notification;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StockItemController extends Controller
{
    /**
     * Display a listing of stock items.
     */
    public function index(Request $request)
    {
        $query = StockItem::query();

        // Search functionality
        if ($request->filled('q')) {
            $q = $request->string('q')->toString();
            $query->where(function ($sub) use ($q) {
                $like = '%'.$q.'%';
                $sub->where('name', 'like', $like)
                    ->orWhere('description', 'like', $like);
            });
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by status (critical/optimal)
        if ($request->filled('status')) {
            if ($request->status === 'critical') {
                $query->whereColumn('quantity', '<', 'threshold');
            } elseif ($request->status === 'optimal') {
                $query->whereColumn('quantity', '>=', 'threshold');
            }
        }

        // Sort
        $sortBy = $request->get('sort_by', 'category');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        if ($sortBy !== 'name') {
            $query->orderBy('name', 'asc');
        }

        // Pagination
        $perPage = $request->get('per_page', 50);
        $perPage = max(1, min(200, $perPage));

        return StockItemResource::collection($query->paginate($perPage));
    }

    /**
     * Store a newly created stock item.
     */
    public function store(StoreStockItemRequest $request)
    {
        try {
            DB::beginTransaction();

            $item = StockItem::create($request->validated());

            // Create stock history entry
            $this->createStockHistory($item->id, 'initial', $item->quantity, 'Création initiale');

            // Create notification for admins if quantity is critical
            if ($item->quantity < $item->threshold) {
                $this->createNotificationForAdmins(
                    'Stock critique',
                    "L'article {$item->name} est en stock critique ({$item->quantity} {$item->unit})",
                    'warning',
                    ['stock_item_id' => $item->id]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Article de stock créé avec succès',
                'stock_item' => new StockItemResource($item),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création de l\'article de stock',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified stock item.
     */
    public function show(StockItem $stockItem)
    {
        return new StockItemResource($stockItem);
    }

    /**
     * Update the specified stock item.
     */
    public function update(UpdateStockItemRequest $request, StockItem $stockItem)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $oldQuantity = $stockItem->quantity;
            $oldThreshold = $stockItem->threshold;

            // Check if quantity or threshold changed
            $quantityChanged = array_key_exists('quantity', $validated) && $oldQuantity != $validated['quantity'];
            $thresholdChanged = array_key_exists('threshold', $validated) && $oldThreshold != $validated['threshold'];

            // Auto-update last_update if quantity or threshold changed
            if (($quantityChanged || $thresholdChanged) && !array_key_exists('last_update', $validated)) {
                $validated['last_update'] = now()->toDateString();
            }

            $stockItem->update($validated);

            // Create stock history if quantity changed
            if ($quantityChanged) {
                $newQuantity = $validated['quantity'];
                $difference = $newQuantity - $oldQuantity;
                $type = $difference > 0 ? 'increase' : ($difference < 0 ? 'decrease' : 'adjust');
                $this->createStockHistory($stockItem->id, $type, $newQuantity, 'Mise à jour manuelle', $difference);
            }

            // Check for critical stock notifications
            $newQuantity = $stockItem->quantity;
            $newThreshold = $stockItem->threshold;
            
            if ($newQuantity < $newThreshold) {
                if ($oldQuantity >= $oldThreshold) { // Just became critical
                    $this->createNotificationForAdmins(
                        'Stock devenu critique',
                        "L'article {$stockItem->name} est maintenant en stock critique ({$newQuantity} {$stockItem->unit})",
                        'warning',
                        ['stock_item_id' => $stockItem->id]
                    );
                }
            } elseif ($oldQuantity < $oldThreshold && $newQuantity >= $newThreshold) { // Just became optimal
                $this->createNotificationForAdmins(
                    'Stock réapprovisionné',
                    "L'article {$stockItem->name} est maintenant à un niveau optimal ({$newQuantity} {$stockItem->unit})",
                    'success',
                    ['stock_item_id' => $stockItem->id]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Article de stock mis à jour avec succès',
                'stock_item' => new StockItemResource($stockItem),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de l\'article de stock',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update stock item quantity.
     */
    public function updateQuantity(UpdateStockItemQuantityRequest $request, StockItem $stockItem)
    {
        try {
            DB::beginTransaction();

            $oldQuantity = $stockItem->quantity;
            $newQuantity = $request->validated()['quantity'];
            $difference = $newQuantity - $oldQuantity;

            $stockItem->update([
                'quantity' => $newQuantity,
                'last_update' => now()->toDateString(),
            ]);

            // Create stock history
            $type = $difference > 0 ? 'increase' : ($difference < 0 ? 'decrease' : 'adjust');
            $this->createStockHistory($stockItem->id, $type, $newQuantity, 'Ajustement de quantité', $difference);

            // Check for critical stock notifications
            if ($newQuantity < $stockItem->threshold && $oldQuantity >= $stockItem->threshold) {
                $this->createNotificationForAdmins(
                    'Stock critique',
                    "L'article {$stockItem->name} est en stock critique ({$newQuantity} {$stockItem->unit})",
                    'warning',
                    ['stock_item_id' => $stockItem->id]
                );
            } elseif ($newQuantity >= $stockItem->threshold && $oldQuantity < $stockItem->threshold) {
                $this->createNotificationForAdmins(
                    'Stock réapprovisionné',
                    "L'article {$stockItem->name} est maintenant à un niveau optimal ({$newQuantity} {$stockItem->unit})",
                    'success',
                    ['stock_item_id' => $stockItem->id]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Quantité mise à jour avec succès',
                'stock_item' => new StockItemResource($stockItem),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la quantité',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Adjust stock quantity with reason.
     */
    public function adjustQuantity(Request $request, StockItem $stockItem)
    {
        $validated = $request->validate([
            'adjustment' => ['required', 'integer', 'min:-1000', 'max:1000'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        try {
            DB::beginTransaction();

            $oldQuantity = $stockItem->quantity;
            $adjustment = $validated['adjustment'];
            $newQuantity = max(0, $oldQuantity + $adjustment);
            $reason = $validated['reason'];

            $stockItem->update([
                'quantity' => $newQuantity,
                'last_update' => now()->toDateString(),
            ]);

            // Create stock history
            $type = $adjustment > 0 ? 'increase' : ($adjustment < 0 ? 'decrease' : 'adjust');
            $this->createStockHistory($stockItem->id, $type, $newQuantity, $reason, $adjustment);

            // Check for critical stock notifications
            if ($newQuantity < $stockItem->threshold && $oldQuantity >= $stockItem->threshold) {
                $this->createNotificationForAdmins(
                    'Stock critique',
                    "L'article {$stockItem->name} est en stock critique ({$newQuantity} {$stockItem->unit})",
                    'warning',
                    ['stock_item_id' => $stockItem->id]
                );
            } elseif ($newQuantity >= $stockItem->threshold && $oldQuantity < $stockItem->threshold) {
                $this->createNotificationForAdmins(
                    'Stock réapprovisionné',
                    "L'article {$stockItem->name} est maintenant à un niveau optimal ({$newQuantity} {$stockItem->unit})",
                    'success',
                    ['stock_item_id' => $stockItem->id]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Ajustement de stock effectué avec succès',
                'stock_item' => new StockItemResource($stockItem),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de l\'ajustement du stock',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get critical stock items.
     */
    public function critical(Request $request)
    {
        $query = StockItem::whereColumn('quantity', '<', 'threshold')
            ->orderByRaw('(threshold - quantity) DESC');

        $perPage = $request->get('per_page', 50);
        $items = $query->paginate($perPage);

        return StockItemResource::collection($items);
    }

    /**
     * Get stock item history.
     */
    public function history(Request $request, StockItem $stockItem)
    {
        // This would require a StockHistory model
        // For now, return empty array
        return response()->json([
            'history' => [],
            'stock_item' => new StockItemResource($stockItem),
        ]);
    }

    /**
     * Bulk update stock items.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:stock_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:0'],
            'items.*.reason' => ['required', 'string', 'max:255'],
        ]);

        try {
            DB::beginTransaction();

            $updatedItems = [];
            foreach ($validated['items'] as $itemData) {
                $stockItem = StockItem::find($itemData['id']);
                $oldQuantity = $stockItem->quantity;
                $newQuantity = $itemData['quantity'];
                $difference = $newQuantity - $oldQuantity;

                $stockItem->update([
                    'quantity' => $newQuantity,
                    'last_update' => now()->toDateString(),
                ]);

                // Create stock history
                $type = $difference > 0 ? 'increase' : ($difference < 0 ? 'decrease' : 'adjust');
                $this->createStockHistory($stockItem->id, $type, $newQuantity, $itemData['reason'], $difference);

                $updatedItems[] = new StockItemResource($stockItem);

                // Check for critical stock notifications
                if ($newQuantity < $stockItem->threshold && $oldQuantity >= $stockItem->threshold) {
                    $this->createNotificationForAdmins(
                        'Stock critique',
                        "L'article {$stockItem->name} est en stock critique ({$newQuantity} {$stockItem->unit})",
                        'warning',
                        ['stock_item_id' => $stockItem->id]
                    );
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Mise à jour en masse effectuée avec succès',
                'updated_items' => $updatedItems,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour en masse',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search stock items.
     */
    public function search(Request $request)
    {
        $query = $request->get('q');
        $limit = $request->get('limit', 10);
        
        if (empty($query)) {
            return response()->json([]);
        }
        
        $items = StockItem::where('name', 'like', '%'.$query.'%')
            ->orWhere('description', 'like', '%'.$query.'%')
            ->limit($limit)
            ->get(['id', 'name', 'category', 'quantity', 'unit']);
        
        return response()->json($items);
    }

    /**
     * Remove the specified stock item.
     */
    public function destroy(StockItem $stockItem)
    {
        try {
            DB::beginTransaction();

            $itemName = $stockItem->name;
            $stockItem->delete();

            // Create notification for admins
            $this->createNotificationForAdmins(
                'Article de stock supprimé',
                "L'article {$itemName} a été supprimé du stock",
                'warning',
                ['deleted_item_name' => $itemName]
            );

            DB::commit();

            return response()->json([
                'message' => 'Article de stock supprimé avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'article de stock',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create stock history entry.
     */
    private function createStockHistory($stockItemId, $type, $quantity, $reason, $difference = null)
    {
        // This will be implemented when StockHistory model is ready
        // StockHistory::create([
        //     'stock_item_id' => $stockItemId,
        //     'type' => $type,
        //     'quantity' => $quantity,
        //     'difference' => $difference,
        //     'reason' => $reason,
        //     'user_id' => auth()->id(),
        // ]);
    }

    /**
     * Create notification for all admin users.
     */
    private function createNotificationForAdmins($title, $message, $type = 'info', $data = null)
    {
        // This will be implemented when Notification model is ready
        // For now, we'll skip notification creation
        // $adminUsers = User::where('role', 'fermier')->get();
        // foreach ($adminUsers as $admin) {
        //     Notification::create($admin->id, $title, $message, $type, $data);
        // }
    }
}
