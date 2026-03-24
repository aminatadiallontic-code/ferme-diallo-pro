<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request)
    {
        // Placeholder implementation
        return response()->json([
            'data' => [],
            'message' => 'Notifications placeholder - not implemented yet',
        ]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, $notification)
    {
        // Placeholder implementation
        return response()->json([
            'message' => 'Mark as read placeholder - not implemented yet',
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        // Placeholder implementation
        return response()->json([
            'message' => 'Mark all as read placeholder - not implemented yet',
        ]);
    }
}
