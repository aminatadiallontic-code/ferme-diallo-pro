<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\StockItemController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::middleware('role:fermier,gestionnaire')->group(function () {
        Route::apiResource('clients', ClientController::class);

        Route::apiResource('orders', OrderController::class);
        Route::post('orders/{order}/confirm', [OrderController::class, 'confirm']);

        Route::patch('stock-items/{stockItem}/quantity', [StockItemController::class, 'updateQuantity']);
        Route::apiResource('stock-items', StockItemController::class);
    });

    Route::middleware('role:fermier')->group(function () {
        Route::apiResource('transactions', TransactionController::class);

        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
    });
});
