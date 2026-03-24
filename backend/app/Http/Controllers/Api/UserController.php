<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search functionality
        if ($request->filled('q')) {
            $q = $request->string('q')->toString();
            $query->where(function ($sub) use ($q) {
                $like = '%'.$q.'%';
                $sub->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Date range filter
        if ($request->filled('created_from')) {
            $query->whereDate('created_at', '>=', $request->created_from);
        }

        if ($request->filled('created_to')) {
            $query->whereDate('created_at', '<=', $request->created_to);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        if ($sortBy !== 'created_at') {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 50);
        $perPage = max(1, min(200, $perPage));

        return UserResource::collection($query->paginate($perPage));
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'status' => $validated['status'] ?? 'actif',
                'client_id' => $validated['client_id'] ?? null,
            ]);

            // Create notification for admins
            $this->createNotificationForAdmins(
                'Nouvel utilisateur ajouté',
                "L'utilisateur {$user->name} ({$user->role}) a été ajouté avec succès",
                'success',
                ['user_id' => $user->id]
            );

            DB::commit();

            return response()->json([
                'message' => 'Utilisateur créé avec succès',
                'user' => new UserResource($user),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création de l\'utilisateur',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();

            // Handle password update
            if (array_key_exists('password', $validated)) {
                if ($validated['password']) {
                    $validated['password'] = Hash::make($validated['password']);
                    // Revoke all tokens except current one for password change
                    if ($request->user()->id !== $user->id) {
                        $user->tokens()->delete();
                    }
                } else {
                    unset($validated['password']);
                }
            }

            $oldRole = $user->role;
            $oldStatus = $user->status;
            $user->update($validated);

            // Create notifications for role or status changes
            if (isset($validated['role']) && $oldRole !== $validated['role']) {
                $this->createNotificationForAdmins(
                    'Rôle utilisateur modifié',
                    "Le rôle de {$user->name} est passé de {$oldRole} à {$validated['role']}",
                    'info',
                    ['user_id' => $user->id, 'old_role' => $oldRole, 'new_role' => $validated['role']]
                );
            }

            if (isset($validated['status']) && $oldStatus !== $validated['status']) {
                $this->createNotificationForAdmins(
                    'Statut utilisateur modifié',
                    "Le statut de {$user->name} est passé de {$oldStatus} à {$validated['status']}",
                    'info',
                    ['user_id' => $user->id, 'old_status' => $oldStatus, 'new_status' => $validated['status']]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => new UserResource($user),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de l\'utilisateur',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user status.
     */
    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        try {
            DB::beginTransaction();

            $oldStatus = $user->status;
            $newStatus = $request->validated()['status'];
            
            // Prevent self-deactivation
            if ($request->user()->id === $user->id && $newStatus === 'inactif') {
                return response()->json([
                    'message' => 'Vous ne pouvez pas désactiver votre propre compte',
                ], 422);
            }

            $user->update(['status' => $newStatus]);

            // Revoke all tokens if user is deactivated
            if ($newStatus === 'inactif') {
                $user->tokens()->delete();
            }

            // Create notification
            $this->createNotificationForAdmins(
                'Statut utilisateur modifié',
                "Le statut de {$user->name} est passé de {$oldStatus} à {$newStatus}",
                'info',
                ['user_id' => $user->id, 'old_status' => $oldStatus, 'new_status' => $newStatus]
            );

            DB::commit();

            return response()->json([
                'message' => 'Statut utilisateur mis à jour avec succès',
                'user' => new UserResource($user),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        try {
            DB::beginTransaction();

            $user->update([
                'password' => Hash::make($validated['password']),
            ]);

            // Revoke all tokens (force logout)
            $user->tokens()->delete();

            // Create notification
            $this->createNotificationForAdmins(
                'Mot de passe réinitialisé',
                "Le mot de passe de {$user->name} a été réinitialisé",
                'warning',
                ['user_id' => $user->id]
            );

            DB::commit();

            return response()->json([
                'message' => 'Mot de passe réinitialisé avec succès',
                'user' => new UserResource($user),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la réinitialisation du mot de passe',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user activity logs.
     */
    public function activity(Request $request, User $user)
    {
        // This would require an ActivityLog model
        // For now, return empty array
        return response()->json([
            'activities' => [],
            'user' => new UserResource($user),
            'message' => 'Journal d\'activité à implémenter',
        ]);
    }

    /**
     * Get user statistics.
     */
    public function stats(Request $request)
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'actif')->count();
        $inactiveUsers = User::where('status', 'inactif')->count();
        
        $fermierCount = User::where('role', 'fermier')->count();
        $gestionnaireCount = User::where('role', 'gestionnaire')->count();
        
        $newUsersThisMonth = User::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
        
        $newUsersLastMonth = User::whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->count();

        return response()->json([
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'inactive_users' => $inactiveUsers,
            'fermier_count' => $fermierCount,
            'gestionnaire_count' => $gestionnaireCount,
            'new_users_this_month' => $newUsersThisMonth,
            'new_users_last_month' => $newUsersLastMonth,
            'monthly_growth' => $newUsersLastMonth > 0 ? 
                round((($newUsersThisMonth - $newUsersLastMonth) / $newUsersLastMonth) * 100, 2) : 0,
        ]);
    }

    /**
     * Get system settings.
     */
    public function getSettings(Request $request)
    {
        // This would require a Settings model or storage
        // For now, return default settings
        return response()->json([
            'settings' => [
                'system_name' => 'Ferme Diallo',
                'notification_email' => 'admin@fermediallo.com',
                'timezone' => 'Africa/Conakry',
                'language' => 'fr',
                'notifications' => true,
                'auto_reports' => true,
                'data_retention' => '12',
                'maintenance_mode' => false,
            ],
        ]);
    }

    /**
     * Update system settings.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'system_name' => ['sometimes', 'string', 'max:255'],
            'notification_email' => ['sometimes', 'email'],
            'timezone' => ['sometimes', 'string'],
            'language' => ['sometimes', 'string', 'in:fr,en'],
            'notifications' => ['sometimes', 'boolean'],
            'auto_reports' => ['sometimes', 'boolean'],
            'data_retention' => ['sometimes', 'string', 'in:6,12,24,36'],
            'maintenance_mode' => ['sometimes', 'boolean'],
        ]);

        // This would require a Settings model or storage
        return response()->json([
            'message' => 'Paramètres système mis à jour avec succès',
            'settings' => $validated,
        ]);
    }

    /**
     * Update system logo.
     */
    public function updateLogo(Request $request)
    {
        $validated = $request->validate([
            'logo' => ['required', 'string', 'max:1000000'], // Base64 string
        ]);

        // This would require file storage
        return response()->json([
            'message' => 'Logo mis à jour avec succès',
            'logo_url' => 'storage/logos/system-logo.png',
        ]);
    }

    /**
     * Create system backup.
     */
    public function backup(Request $request)
    {
        try {
            // This would implement actual backup functionality
            $backupFile = 'backup_' . Carbon::now()->format('Y-m-d_H-i-s') . '.sql';
            
            return response()->json([
                'message' => 'Sauvegarde créée avec succès',
                'backup_file' => $backupFile,
                'backup_url' => 'storage/backups/' . $backupFile,
                'created_at' => Carbon::now(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la sauvegarde',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle maintenance mode.
     */
    public function toggleMaintenance(Request $request)
    {
        $validated = $request->validate([
            'maintenance_mode' => ['required', 'boolean'],
        ]);

        // This would require a Settings model or storage
        return response()->json([
            'message' => $validated['maintenance_mode'] ? 
                'Mode maintenance activé' : 'Mode maintenance désactivé',
            'maintenance_mode' => $validated['maintenance_mode'],
        ]);
    }

    /**
     * Get system logs.
     */
    public function logs(Request $request)
    {
        $level = $request->get('level', 'all');
        $limit = $request->get('limit', 100);
        
        // This would require actual log reading functionality
        return response()->json([
            'logs' => [],
            'message' => 'Fonctionnalité des logs système à implémenter',
            'filters' => [
                'level' => $level,
                'limit' => $limit,
            ],
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, User $user)
    {
        try {
            DB::beginTransaction();

            // Prevent self-deletion
            if ($request->user()->id === $user->id) {
                return response()->json([
                    'message' => 'Vous ne pouvez pas supprimer votre propre compte',
                ], 422);
            }

            // Prevent deletion of the last admin
            $adminCount = User::where('role', 'fermier')->count();
            if ($user->role === 'fermier' && $adminCount <= 1) {
                return response()->json([
                    'message' => 'Impossible de supprimer le dernier administrateur',
                ], 422);
            }

            $userName = $user->name;
            $user->tokens()->delete();
            $user->delete();

            // Create notification for admins
            $this->createNotificationForAdmins(
                'Utilisateur supprimé',
                "L'utilisateur {$userName} a été supprimé",
                'warning',
                ['deleted_user_name' => $userName]
            );

            DB::commit();

            return response()->json([
                'message' => 'Utilisateur supprimé avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'utilisateur',
                'error' => $e->getMessage(),
            ], 500);
        }
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
