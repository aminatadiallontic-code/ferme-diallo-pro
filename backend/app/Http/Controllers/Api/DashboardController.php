<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Order;
use App\Models\StockItem;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function stats(Request $request)
    {
        try {
            // Clients stats
            $totalClients = Client::count();
            $activeClients = Client::where('status', 'actif')->count();
            $newClientsThisMonth = Client::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();

            // Orders stats
            $totalOrders = Order::count();
            $pendingOrders = Order::where('status', 'en_attente')->count();
            $confirmedOrders = Order::where('status', 'confirmé')->count();
            $cancelledOrders = Order::where('status', 'annulé')->count();
            $ordersThisMonth = Order::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();

            // Stock stats
            $totalStockItems = StockItem::count();
            $criticalStockItems = StockItem::whereColumn('quantity', '<', 'threshold')->count();
            $optimalStockItems = StockItem::whereColumn('quantity', '>=', 'threshold')->count();

            // Financial stats
            $totalRevenue = Transaction::where('type', 'revenu')->sum('amount');
            $totalExpenses = Transaction::where('type', 'depense')->sum('amount');
            $profit = $totalRevenue - $totalExpenses;
            
            $revenueThisMonth = Transaction::where('type', 'revenu')
                ->whereMonth('date', Carbon::now()->month)
                ->whereYear('date', Carbon::now()->year)
                ->sum('amount');
            
            $expensesThisMonth = Transaction::where('type', 'depense')
                ->whereMonth('date', Carbon::now()->month)
                ->whereYear('date', Carbon::now()->year)
                ->sum('amount');

            // Users stats
            $totalUsers = User::count();
            $activeUsers = User::where('status', 'actif')->count();
            $adminUsers = User::where('role', 'fermier')->count();
            $managerUsers = User::where('role', 'gestionnaire')->count();

            return response()->json([
                'clients' => [
                    'total' => $totalClients,
                    'active' => $activeClients,
                    'new_this_month' => $newClientsThisMonth,
                ],
                'orders' => [
                    'total' => $totalOrders,
                    'pending' => $pendingOrders,
                    'confirmed' => $confirmedOrders,
                    'cancelled' => $cancelledOrders,
                    'this_month' => $ordersThisMonth,
                ],
                'stock' => [
                    'total_items' => $totalStockItems,
                    'critical' => $criticalStockItems,
                    'optimal' => $optimalStockItems,
                ],
                'finance' => [
                    'total_revenue' => $totalRevenue,
                    'total_expenses' => $totalExpenses,
                    'profit' => $profit,
                    'revenue_this_month' => $revenueThisMonth,
                    'expenses_this_month' => $expensesThisMonth,
                ],
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'admins' => $adminUsers,
                    'managers' => $managerUsers,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get revenue chart data.
     */
    public function revenueChart(Request $request)
    {
        try {
            $period = $request->get('period', 'month'); // week, month, year
            
            $query = Transaction::selectRaw('DATE(date) as date, SUM(CASE WHEN type = "revenu" THEN amount ELSE 0 END) as revenue, SUM(CASE WHEN type = "depense" THEN amount ELSE 0 END) as expenses')
                ->groupBy('date')
                ->orderBy('date');

            if ($period === 'week') {
                $startDate = Carbon::now()->subDays(7);
            } elseif ($period === 'month') {
                $startDate = Carbon::now()->subDays(30);
            } else {
                $startDate = Carbon::now()->subYear();
            }

            $data = $query->whereDate('date', '>=', $startDate)->get();

            return response()->json([
                'data' => $data,
                'period' => $period,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des données de revenus',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get production chart data.
     */
    public function productionChart(Request $request)
    {
        try {
            $period = $request->get('period', 'month'); // week, month, year
            
            // For now, return mock data for egg production
            $data = [];
            
            if ($period === 'week') {
                for ($i = 6; $i >= 0; $i--) {
                    $date = Carbon::now()->subDays($i)->format('Y-m-d');
                    $data[] = [
                        'date' => $date,
                        'production' => rand(50, 150),
                    ];
                }
            } elseif ($period === 'month') {
                for ($i = 29; $i >= 0; $i--) {
                    $date = Carbon::now()->subDays($i)->format('Y-m-d');
                    $data[] = [
                        'date' => $date,
                        'production' => rand(50, 150),
                    ];
                }
            } else {
                for ($i = 11; $i >= 0; $i--) {
                    $date = Carbon::now()->subMonths($i)->format('Y-m');
                    $data[] = [
                        'date' => $date,
                        'production' => rand(1500, 4500),
                    ];
                }
            }

            return response()->json([
                'data' => $data,
                'period' => $period,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des données de production',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get recent activities.
     */
    public function recentActivities(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            
            // For now, return mock data
            $activities = [
                [
                    'id' => 1,
                    'type' => 'client_created',
                    'description' => 'Nouveau client ajouté: Oumar Bah',
                    'user' => 'Ibrahima Sow',
                    'created_at' => Carbon::now()->subMinutes(15)->toISOString(),
                ],
                [
                    'id' => 2,
                    'type' => 'order_confirmed',
                    'description' => 'Commande #123 confirmée',
                    'user' => 'Mamadou Diallo',
                    'created_at' => Carbon::now()->subHours(2)->toISOString(),
                ],
                [
                    'id' => 3,
                    'type' => 'stock_updated',
                    'description' => 'Stock de Maïs mis à jour: 50kg',
                    'user' => 'Ibrahima Sow',
                    'created_at' => Carbon::now()->subHours(4)->toISOString(),
                ],
                [
                    'id' => 4,
                    'type' => 'transaction_added',
                    'description' => 'Revenu enregistré: 500,000 GNF',
                    'user' => 'Mamadou Diallo',
                    'created_at' => Carbon::now()->subDays(1)->toISOString(),
                ],
            ];

            return response()->json([
                'activities' => array_slice($activities, 0, $limit),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des activités récentes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get alerts.
     */
    public function alerts(Request $request)
    {
        try {
            $alerts = [];

            // Check for critical stock items
            $criticalStockItems = StockItem::whereColumn('quantity', '<', 'threshold')->get();
            foreach ($criticalStockItems as $item) {
                $alerts[] = [
                    'id' => 'stock_' . $item->id,
                    'type' => 'warning',
                    'title' => 'Stock critique',
                    'message' => "{$item->name} est en stock critique ({$item->quantity} {$item->unit})",
                    'created_at' => $item->updated_at,
                ];
            }

            // Check for pending orders
            $pendingOrders = Order::where('status', 'en_attente')->count();
            if ($pendingOrders > 5) {
                $alerts[] = [
                    'id' => 'orders_pending',
                    'type' => 'info',
                    'title' => 'Commandes en attente',
                    'message' => "{$pendingOrders} commandes en attente de confirmation",
                    'created_at' => Carbon::now()->toISOString(),
                ];
            }

            // Check for inactive clients
            $inactiveClients = Client::where('status', 'inactif')->count();
            if ($inactiveClients > 0) {
                $alerts[] = [
                    'id' => 'clients_inactive',
                    'type' => 'info',
                    'title' => 'Clients inactifs',
                    'message' => "{$inactiveClients} clients sont inactifs",
                    'created_at' => Carbon::now()->toISOString(),
                ];
            }

            return response()->json([
                'alerts' => $alerts,
                'total' => count($alerts),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des alertes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
