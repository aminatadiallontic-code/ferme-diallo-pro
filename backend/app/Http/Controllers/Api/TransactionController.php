<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Display a listing of transactions.
     */
    public function index(Request $request)
    {
        $query = Transaction::query();

        // Search functionality
        if ($request->filled('q')) {
            $q = $request->string('q')->toString();
            $query->where(function ($sub) use ($q) {
                $like = '%'.$q.'%';
                $sub->where('description', 'like', $like)
                    ->orWhere('category', 'like', $like);
            });
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Date range filter
        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        // Amount range filter
        if ($request->filled('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }

        if ($request->filled('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        if ($sortBy !== 'date') {
            $query->orderBy('date', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 50);
        $perPage = max(1, min(200, $perPage));

        return TransactionResource::collection($query->paginate($perPage));
    }

    /**
     * Store a newly created transaction.
     */
    public function store(StoreTransactionRequest $request)
    {
        try {
            DB::beginTransaction();

            $transaction = Transaction::create($request->validated());

            // Create notification for large transactions
            if ($transaction->amount > 1000000) { // 1M GNF
                $this->createNotificationForAdmins(
                    'Transaction importante',
                    "Une transaction de {$transaction->amount} GNF a été enregistrée ({$transaction->type}: {$transaction->description})",
                    $transaction->type === 'revenu' ? 'success' : 'warning',
                    ['transaction_id' => $transaction->id]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Transaction créée avec succès',
                'transaction' => new TransactionResource($transaction),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création de la transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show(Transaction $transaction)
    {
        return new TransactionResource($transaction);
    }

    /**
     * Update the specified transaction.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        try {
            DB::beginTransaction();

            $oldAmount = $transaction->amount;
            $transaction->update($request->validated());

            // Create notification if amount changed significantly
            $newAmount = $transaction->amount;
            if (abs($newAmount - $oldAmount) > 500000) { // 500K GNF difference
                $this->createNotificationForAdmins(
                    'Transaction modifiée',
                    "La transaction #{$transaction->id} a été modifiée de {$oldAmount} à {$newAmount} GNF",
                    'info',
                    ['transaction_id' => $transaction->id, 'old_amount' => $oldAmount, 'new_amount' => $newAmount]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Transaction mise à jour avec succès',
                'transaction' => new TransactionResource($transaction),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified transaction.
     */
    public function destroy(Transaction $transaction)
    {
        try {
            DB::beginTransaction();

            $transactionId = $transaction->id;
            $transactionInfo = "{$transaction->type}: {$transaction->description} ({$transaction->amount} GNF)";
            $transaction->delete();

            // Create notification for deleted transaction
            $this->createNotificationForAdmins(
                'Transaction supprimée',
                "La transaction #{$transactionId} a été supprimée: {$transactionInfo}",
                'warning',
                ['deleted_transaction_id' => $transactionId]
            );

            DB::commit();

            return response()->json([
                'message' => 'Transaction supprimée avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression de la transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Duplicate a transaction.
     */
    public function duplicate(Request $request, Transaction $transaction)
    {
        try {
            DB::beginTransaction();

            $newTransaction = $transaction->replicate();
            $newTransaction->date = now()->toDateString();
            $newTransaction->save();

            // Create notification
            $this->createNotificationForAdmins(
                'Transaction dupliquée',
                "La transaction #{$transaction->id} a été dupliquée en #{$newTransaction->id}",
                'info',
                ['original_transaction_id' => $transaction->id, 'new_transaction_id' => $newTransaction->id]
            );

            DB::commit();

            return response()->json([
                'message' => 'Transaction dupliquée avec succès',
                'transaction' => new TransactionResource($newTransaction),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la duplication de la transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get recurring transactions.
     */
    public function recurring(Request $request)
    {
        // This would require a RecurringTransaction model
        // For now, return empty array
        return response()->json([
            'recurring_transactions' => [],
            'message' => 'Fonctionnalité des transactions récurrentes à implémenter'
        ]);
    }

    /**
     * Create recurring transaction.
     */
    public function createRecurring(Request $request)
    {
        $validated = $request->validate([
            'transaction_data' => ['required', 'array'],
            'frequency' => ['required', 'string', 'in:daily,weekly,monthly,yearly'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'next_occurrence' => ['required', 'date'],
        ]);

        // This would require a RecurringTransaction model
        return response()->json([
            'message' => 'Fonctionnalité des transactions récurrentes à implémenter',
            'validated_data' => $validated,
        ], 501);
    }

    /**
     * Get transaction categories.
     */
    public function categories(Request $request)
    {
        $type = $request->get('type'); // revenu or depense
        
        $query = Transaction::query();
        if ($type) {
            $query->where('type', $type);
        }

        $categories = $query->selectRaw('category, COUNT(*) as count, SUM(amount) as total_amount')
            ->groupBy('category')
            ->orderBy('category')
            ->get();

        return response()->json($categories);
    }

    /**
     * Get transaction summary.
     */
    public function summary(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

        $query = Transaction::whereBetween('date', [$startDate, $endDate]);

        $totalRevenue = $query->where('type', 'revenu')->sum('amount');
        $totalExpenses = $query->where('type', 'depense')->sum('amount');
        $profit = $totalRevenue - $totalExpenses;

        $transactionCount = $query->count();
        $avgTransactionAmount = $transactionCount > 0 ? $query->sum('amount') / $transactionCount : 0;

        // Category breakdown
        $revenueByCategory = $query->where('type', 'revenu')
            ->selectRaw('category, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        $expensesByCategory = $query->where('type', 'depense')
            ->selectRaw('category, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        // Daily/weekly trends
        $dailyTrends = $query->selectRaw('DATE(date) as date, type, SUM(amount) as total')
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get();

        return response()->json([
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_expenses' => $totalExpenses,
                'profit' => $profit,
                'transaction_count' => $transactionCount,
                'avg_transaction_amount' => round($avgTransactionAmount, 2),
            ],
            'revenue_by_category' => $revenueByCategory,
            'expenses_by_category' => $expensesByCategory,
            'daily_trends' => $dailyTrends,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Export transactions.
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'csv');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $type = $request->get('type');
        $category = $request->get('category');

        // This would require export functionality (Excel/CSV)
        return response()->json([
            'message' => 'Fonctionnalité d\'export à implémenter',
            'export_params' => [
                'format' => $format,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'type' => $type,
                'category' => $category,
            ],
        ], 501);
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
