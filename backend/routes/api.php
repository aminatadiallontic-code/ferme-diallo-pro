<?php



use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\StockItemController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;



Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);



Route::middleware('auth:sanctum')->group(function () {

    Route::get('auth/me', [AuthController::class, 'me']);

    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::put('auth/update-profile', [AuthController::class, 'updateProfile']);
    Route::put('auth/change-password', [AuthController::class, 'changePassword']);



    Route::middleware('role:fermier,gestionnaire')->group(function () {

        // Dashboard routes
        Route::get('dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('dashboard/charts/revenue', [DashboardController::class, 'revenueChart']);
        Route::get('dashboard/charts/production', [DashboardController::class, 'productionChart']);
        Route::get('dashboard/recent-activities', [DashboardController::class, 'recentActivities']);
        Route::get('dashboard/alerts', [DashboardController::class, 'alerts']);

        // Notifications routes
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::patch('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

        // Reports routes
        Route::get('reports/financial', [ReportController::class, 'financial']);
        Route::get('reports/stock', [ReportController::class, 'stock']);
        Route::get('reports/orders', [ReportController::class, 'orders']);
        Route::get('reports/clients', [ReportController::class, 'clients']);
        Route::get('reports/export', [ReportController::class, 'export']);

        // Clients routes
        Route::apiResource('clients', ClientController::class);
        Route::get('clients/{client}/stats', [ClientController::class, 'stats']);
        Route::get('clients/{client}/orders', [ClientController::class, 'orders']);
        Route::patch('clients/{client}/status', [ClientController::class, 'updateStatus']);
        Route::get('clients/search', [ClientController::class, 'search']);

        // Orders routes
        Route::apiResource('orders', OrderController::class);
        Route::post('orders/{order}/confirm', [OrderController::class, 'confirm']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);

        // Stock routes
        Route::apiResource('stock-items', StockItemController::class);
        Route::patch('stock-items/{stockItem}/quantity', [StockItemController::class, 'updateQuantity']);
        Route::patch('stock-items/{stockItem}/adjust', [StockItemController::class, 'adjustQuantity']);
        Route::get('stock-items/critical', [StockItemController::class, 'critical']);
        Route::get('stock-items/{stockItem}/history', [StockItemController::class, 'history']);
        Route::post('stock-items/bulk-update', [StockItemController::class, 'bulkUpdate']);
        Route::get('stock-items/search', [StockItemController::class, 'search']);

    });



    Route::middleware('role:fermier')->group(function () {

        // Transactions routes
        Route::apiResource('transactions', TransactionController::class);
        Route::post('transactions/{transaction}/duplicate', [TransactionController::class, 'duplicate']);
        Route::get('transactions/recurring', [TransactionController::class, 'recurring']);
        Route::post('transactions/recurring', [TransactionController::class, 'createRecurring']);
        Route::get('transactions/categories', [TransactionController::class, 'categories']);
        Route::get('transactions/summary', [TransactionController::class, 'summary']);
        Route::get('transactions/export', [TransactionController::class, 'export']);

        // Users routes
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
        Route::patch('users/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
        Route::get('users/activity/{user}', [UserController::class, 'activity']);
        Route::get('users/stats', [UserController::class, 'stats']);
        Route::get('users/search', [UserController::class, 'search']);

        // System settings routes
        Route::get('settings', [UserController::class, 'getSettings']);
        Route::put('settings', [UserController::class, 'updateSettings']);
        Route::put('settings/logo', [UserController::class, 'updateLogo']);
        Route::post('settings/backup', [UserController::class, 'backup']);
        Route::put('settings/maintenance', [UserController::class, 'toggleMaintenance']);
        Route::get('settings/logs', [UserController::class, 'logs']);

    });

});

