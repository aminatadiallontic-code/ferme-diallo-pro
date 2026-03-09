<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->orderBy('name');

        if ($request->filled('q')) {
            $q = $request->string('q')->toString();
            $like = '%'.$q.'%';

            $query->where(function ($sub) use ($like) {
                $sub->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        if ($request->boolean('paginate', true)) {
            $perPage = (int) $request->integer('per_page', 50);
            $perPage = max(1, min(200, $perPage));

            return UserResource::collection($query->paginate($perPage));
        }

        return UserResource::collection($query->get());
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'name' => $request->validated()['name'],
            'email' => $request->validated()['email'],
            'password' => Hash::make($request->validated()['password']),
            'role' => $request->validated()['role'],
            'status' => $request->validated()['status'] ?? 'actif',
        ]);

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        if (array_key_exists('password', $validated)) {
            if ($validated['password']) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }
        }

        $user->update($validated);

        return new UserResource($user);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        $user->update([
            'status' => $request->validated()['status'],
        ]);

        return new UserResource($user);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()?->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }
}
