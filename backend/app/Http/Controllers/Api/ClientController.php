<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use App\Models\Order;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(Request $request)
    {
        $query = Client::query();

        // Search functionality
        if ($request->filled('q')) {
            $q = $request->string('q')->toString();
            $query->where(function ($sub) use ($q) {
                $like = '%'.$q.'%';
                $sub->where('name', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('address', 'like', $like);
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->input('per_page', 15);
        $clients = $query->paginate($perPage);

        return ClientResource::collection($clients);
    }

    /**
     * Store a newly created client.
     */
    public function store(StoreClientRequest $request)
    {
        try {
            DB::beginTransaction();

            $client = Client::create($request->validated());

            // Create notification for admins
            $this->createNotificationForAdmins(
                'Nouveau client ajouté',
                "Le client {$client->name} a été ajouté avec succès",
                'success',
                ['client_id' => $client->id]
            );

            DB::commit();

            return response()->json([
                'message' => 'Client créé avec succès',
                'client' => new ClientResource($client),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création du client',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified client.
     */
    public function show(Client $client)
    {
        return new ClientResource($client);
    }

    /**
     * Update the specified client.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        try {
            DB::beginTransaction();

            $client->update($request->validated());

            // Create notification for admins
            $this->createNotificationForAdmins(
                'Client mis à jour',
                "Les informations du client {$client->name} ont été mises à jour",
                'info',
                ['client_id' => $client->id]
            );

            DB::commit();

            return response()->json([
                'message' => 'Client mis à jour avec succès',
                'client' => new ClientResource($client),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du client',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified client.
     */
    public function destroy(Client $client)
    {
        try {
            DB::beginTransaction();

            // Check if client has orders
            $ordersCount = $client->orders()->count();
            if ($ordersCount > 0) {
                return response()->json([
                    'message' => 'Impossible de supprimer ce client car il a des commandes associées',
                    'orders_count' => $ordersCount,
                ], 422);
            }

            $clientName = $client->name;
            $client->delete();

            // Create notification for admins
            $this->createNotificationForAdmins(
                'Client supprimé',
                "Le client {$clientName} a été supprimé",
                'warning',
                ['deleted_client_name' => $clientName]
            );

            DB::commit();

            return response()->json([
                'message' => 'Client supprimé avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression du client',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get client statistics.
     */
    public function stats(Client $client)
    {
        $orders = $client->orders();
        
        $totalOrders = $orders->count();
        $confirmedOrders = $orders->where('status', 'confirmé')->count();
        $pendingOrders = $orders->where('status', 'en_attente')->count();
        $cancelledOrders = $orders->where('status', 'annulé')->count();
        
        $totalAmount = $orders->sum('total_amount');
        $totalQuantity = $orders->sum('total_quantity');
        
        $lastOrder = $orders->latest()->first();
        $avgOrderValue = $totalOrders > 0 ? $totalAmount / $totalOrders : 0;
        
        return response()->json([
            'total_orders' => $totalOrders,
            'confirmed_orders' => $confirmedOrders,
            'pending_orders' => $pendingOrders,
            'cancelled_orders' => $cancelledOrders,
            'total_amount' => $totalAmount,
            'total_quantity' => $totalQuantity,
            'avg_order_value' => round($avgOrderValue, 2),
            'last_order_date' => $lastOrder?->created_at,
            'order_status_breakdown' => [
                'confirmé' => $confirmedOrders,
                'en_attente' => $pendingOrders,
                'annulé' => $cancelledOrders,
            ],
        ]);
    }

    /**
     * Get client orders.
     */
    public function orders(Request $request, Client $client)
    {
        $query = $client->orders()->with('orderItems.stockItem');
        
        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        // Date range filter
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        // Pagination
        $perPage = $request->input('per_page', 15);
        $orders = $query->paginate($perPage);
        
        return response()->json($orders);
    }

    /**
     * Update client status.
     */
    public function updateStatus(Request $request, Client $client)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:actif,inactif'],
        ]);
        
        $oldStatus = $client->status;
        $client->update($validated);
        
        // Create notification
        $this->createNotificationForAdmins(
            'Statut client modifié',
            "Le statut du client {$client->name} est passé de {$oldStatus} à {$validated['status']}",
            'info',
            ['client_id' => $client->id, 'old_status' => $oldStatus, 'new_status' => $validated['status']]
        );
        
        return response()->json([
            'message' => 'Statut du client mis à jour avec succès',
            'client' => new ClientResource($client),
        ]);
    }

    /**
     * Search clients.
     */
    public function search(Request $request)
    {
        $query = $request->input('q');
        $limit = $request->input('limit', 10);
        
        if (empty($query)) {
            return response()->json([]);
        }
        
        $clients = Client::where('name', 'like', '%'.$query.'%')
            ->orWhere('phone', 'like', '%'.$query.'%')
            ->orWhere('email', 'like', '%'.$query.'%')
            ->limit($limit)
            ->get(['id', 'name', 'phone', 'email']);
        
        return response()->json($clients);
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
